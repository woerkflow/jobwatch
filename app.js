const STORAGE_KEY = 'orders';

const elements = {
    orderNumberInput: document.getElementById('orderNumber'),
    feedbackNumberInput: document.getElementById('feedbackNumber'),
    addButton: document.getElementById('addButton'),
    stopButton: document.getElementById('stopButton'),
    clearButton: document.getElementById('clearButton'),
    orderList: document.getElementById('orderList'),
    totalTime: document.getElementById('totalTime'),
};

let orders = loadOrders();

elements.addButton.addEventListener('click', handleAddOrder);
elements.stopButton.addEventListener('click', handleStopCurrentOrder);
elements.clearButton.addEventListener('click', handleClearOrders);

const MINUTE = 60000;
const BILLING_INTERVAL_MINUTES = 5;

const BREAK_WINDOWS = [
    { start: '09:00', end: '09:15' },
    { start: '11:30', end: '11:45' },
];

setInterval(render, 30000);
render();

/**
 * Starts a new order and automatically
 * stops the currently running one.
 */
function handleAddOrder() {
    const orderNumber = elements.orderNumberInput.value.trim();
    const feedbackNumber = elements.feedbackNumberInput.value.trim();

    if (!orderNumber || !feedbackNumber) {
        alert('Bitte Auftragsnummer und Rückmeldenummer eingeben.');
        return;
    }
    stopRunningOrder();
    orders.push(createOrder(orderNumber, feedbackNumber));
    saveOrders();
    clearForm();
    render();
}

function handleStopCurrentOrder() {
    const stopped = stopRunningOrder();

    if (!stopped) {
        alert('Es läuft aktuell kein Auftrag.');
        return;
    }
    saveOrders();
    render();
}

function handleClearOrders() {
    if (!confirm('Wirklich alle Aufträge löschen?')) {
        return;
    }
    orders = [];
    saveOrders();
    render();
}

function createOrder(orderNumber, feedbackNumber) {
    return {
        id: crypto.randomUUID(),
        orderNumber,
        feedbackNumber,
        startTime: new Date().toISOString(),
        endTime: null,
    };
}

/**
 * Stops the currently active order.
 *
 * @returns {boolean}
 */
function stopRunningOrder() {
    const runningOrder = getRunningOrder();

    if (!runningOrder) {
        return false;
    }
    runningOrder.endTime = new Date().toISOString();
    return true;
}

/**
 * Returns the currently running order.
 *
 * @returns {Object|undefined}
 */
function getRunningOrder() {
    return orders.find(order => order.endTime === null);
}

function clearForm() {
    elements.orderNumberInput.value = '';
    elements.feedbackNumberInput.value = '';
    elements.orderNumberInput.focus();
}

function render() {
    renderOrders();
    renderTotalTime();
}

function renderOrders() {
    clearElement(elements.orderList);

    getOrdersNewestFirst().forEach(order => {
        elements.orderList.appendChild(createOrderListItem(order));
    });
}

function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function renderTotalTime() {
    elements.totalTime.textContent = formatDuration(getTotalDuration());
}

/**
 * Creates a DOM element for an order entry.
 *
 * @param {Object} order
 * @returns {HTMLLIElement}
 */
function createOrderListItem(order) {
    const li = document.createElement('li');
    li.className = 'order-item';
    li.appendChild(createStrongLine(`Auftragsnr.: ${order.orderNumber}`));
    li.appendChild(document.createElement('br'));
    li.appendChild(createStrongLine(`Rückmeldenr.: ${order.feedbackNumber}`));
    li.appendChild(document.createElement('br'));
    li.append(`Start: ${formatDateTime(order.startTime)}`);
    li.appendChild(document.createElement('br'));
    li.append('Ende: ');

    if (order.endTime) {
        li.append(formatDateTime(order.endTime));
    } else {
        const runningBadge = document.createElement('span');
        runningBadge.className = 'running';
        runningBadge.textContent = 'läuft';

        li.appendChild(runningBadge);
    }
    li.appendChild(document.createElement('br'));
    li.append(`Dauer: ${formatDuration(getOrderDuration(order))}`);
    return li;
}

/**
 * Creates a strong text element.
 *
 * @param {string} text
 * @returns {HTMLElement}
 */
function createStrongLine(text) {
    const strong = document.createElement('strong');
    strong.textContent = text;
    return strong;
}

function getOrdersNewestFirst() {
    return [...orders].reverse();
}

/**
 * Calculates the billable duration of an order.
 * Break windows are subtracted first.
 * Finished orders are rounded up to the next 5-minute interval.
 *
 * @param {Object} order
 * @returns {number}
 */
function getOrderDuration(order) {
    const start = getEffectiveStartTime(order);
    const end = order.endTime
        ? new Date(order.endTime)
        : new Date();
    const netDuration = getNetDuration(start, end);

    if (!order.endTime) {
        return roundDownToFullMinutes(netDuration);
    }
    return roundUpToBillingInterval(netDuration);
}

function getEffectiveStartTime(order) {
    const start = new Date(order.startTime);
    const offset = getCarryOverOffset(order);
    return new Date(start.getTime() + offset);
}

function getCarryOverOffset(order) {
    const orderIndex = orders.findIndex(currentOrder => currentOrder.id === order.id);

    if (orderIndex <= 0) {
        return 0;
    }
    return orders
        .slice(0, orderIndex)
        .reduce((sum, previousOrder) => {
            return sum + getRoundingDifference(previousOrder);
        }, 0);
}

/**
 * Returns the accumulated rounding difference of all previous orders.
 * This shifts the effective start time of following orders forward.
 */
function getRoundingDifference(order) {
    if (!order.endTime) {
        return 0;
    }
    const start = getEffectiveStartTime(order);
    const end = new Date(order.endTime);
    const netDuration = getNetDuration(start, end);
    const roundedDuration = roundUpToBillingInterval(netDuration);
    return Math.max(0, roundedDuration - netDuration);
}

function getNetDuration(start, end) {
    const rawDuration = Math.max(0, end.getTime() - start.getTime());
    const breakDuration = getOverlappingBreakDuration(start, end);
    return Math.max(0, rawDuration - breakDuration);
}

function getOverlappingBreakDuration(start, end) {
    return BREAK_WINDOWS.reduce((sum, breakWindow) => {
        return sum + getBreakOverlap(start, end, breakWindow);
    }, 0);
}

function getBreakOverlap(start, end, breakWindow) {
    const breakStart = createDateWithTime(start, breakWindow.start);
    const breakEnd = createDateWithTime(start, breakWindow.end);
    const overlapStart = Math.max(start.getTime(), breakStart.getTime());
    const overlapEnd = Math.min(end.getTime(), breakEnd.getTime());
    return Math.max(0, overlapEnd - overlapStart);
}

function createDateWithTime(baseDate, time) {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
}

function roundDownToFullMinutes(milliseconds) {
    return Math.floor(milliseconds / MINUTE) * MINUTE;
}

function roundUpToBillingInterval(milliseconds) {
    const interval = BILLING_INTERVAL_MINUTES * MINUTE;

    if (milliseconds === 0) {
        return 0;
    }
    return Math.ceil(milliseconds / interval) * interval;
}

/**
 * Calculates the total tracked duration.
 *
 * @returns {number}
 */
function getTotalDuration() {
    return orders.reduce((sum, order) => {
        return sum + getOrderDuration(order);
    }, 0);
}

/**
 * Formats milliseconds as billable minutes.
 *
 * @param {number} milliseconds
 * @returns {string}
 */
function formatDuration(milliseconds) {
    const totalMinutes = Math.floor(milliseconds / MINUTE);
    return `${totalMinutes} min`;
}

function formatDateTime(value) {
    return new Date(value).toLocaleString('de-DE', {
        dateStyle: 'short',
        timeStyle: 'medium',
    });
}

/**
 * Persists all orders in local storage.
 */
function saveOrders() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

/**
 * Loads saved orders from local storage.
 *
 * @returns {Array}
 */
function loadOrders() {
    const rawOrders = localStorage.getItem(STORAGE_KEY);

    if (!rawOrders) {
        return [];
    }
    try {
        return JSON.parse(rawOrders);
    } catch {
        return [];
    }
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js');
    });
}