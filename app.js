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

setInterval(render, 30000);
render();

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

function stopRunningOrder() {
    const runningOrder = getRunningOrder();

    if (!runningOrder) {
        return false;
    }
    runningOrder.endTime = new Date().toISOString();
    return true;
}

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
    elements.orderList.innerHTML = '';

    getOrdersNewestFirst().forEach(order => {
        elements.orderList.appendChild(createOrderListItem(order));
    });
}

function renderTotalTime() {
    elements.totalTime.textContent = formatDuration(getTotalDuration());
}

function createOrderListItem(order) {
    const li = document.createElement('li');
    li.className = 'order-item';
    li.innerHTML = `
        <strong>Auftragsnr.: ${escapeHtml(order.orderNumber)}</strong><br>
        <strong>Rückmeldenr.: ${escapeHtml(order.feedbackNumber)}</strong><br>
        Start: ${formatDateTime(order.startTime)}<br>
        Ende: ${formatEndTime(order)}<br>
        Dauer: ${formatDuration(getOrderDuration(order))}
    `;
    return li;
}

function formatEndTime(order) {
    if (!order.endTime) {
        return '<span class="running">läuft</span>';
    }
    return formatDateTime(order.endTime);
}

function getOrdersNewestFirst() {
    return [...orders].reverse();
}

function getOrderDuration(order) {
    const start = new Date(order.startTime).getTime();
    const end = order.endTime
        ? new Date(order.endTime).getTime()
        : Date.now();

    const rawDuration = Math.max(0, end - start);
    const fullMinutes = Math.floor(rawDuration / 60000);
    return fullMinutes * 60000;
}

function getTotalDuration() {
    return orders.reduce((sum, order) => {
        return sum + getOrderDuration(order);
    }, 0);
}

function formatDuration(milliseconds) {
    const totalMinutes = Math.floor(milliseconds / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return [hours, minutes]
        .map(value => String(value).padStart(2, '0'))
        .join(':');
}

function formatDateTime(value) {
    return new Date(value).toLocaleString('de-DE', {
        dateStyle: 'short',
        timeStyle: 'medium',
    });
}

function saveOrders() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

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

function escapeHtml(value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js');
    });
}