# Jobwatch

A lightweight Progressive Web App (PWA) for tracking sequential work orders on smartphones and desktop devices.

The app automatically stops the currently running order when a new one is started, subtracts defined break windows from tracked time and rounds finished orders up to the next billing interval.

## Features

- Start and stop work orders
- Automatic switching between running orders
- Automatic break deduction
- Configurable break windows
- Automatic 5-minute billing rounding
- Carry-over rounding compensation between orders
- Total tracked time calculation
- Persistent local storage
- Offline support
- Installable as a PWA
- Mobile-first UI
- Android and iOS compatible

## Billing Logic

Tracked durations are calculated as:

```txt
(end time - start time) - overlapping break windows
```

Finished orders are automatically rounded up to the next 5-minute interval.

### Example:

```txt
Actual duration:     63 min
Rounded duration:    65 min
Carry-over offset:    2 min
```

The rounding difference is transferred internally to the following order to prevent artificial inflation of total working time.

## Default Break Windows

```txt
09:00 - 09:15
11:30 - 11:45
```

Break windows can be configured directly inside app.js.

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- Service Worker
- LocalStorage

No frameworks, no backend, no dependencies.

## Installation

Clone the repository:

```bash
git clone https://github.com/woerkflow/jobwatch.git
```

Open the project folder and start a local web server.

Example using Python:

```bash
python -m http.server
```

Then open:

```txt
http://localhost:8000
```

## Deployment

The app can be deployed directly using GitHub Pages.

### GitHub Pages Setup

1. Push the repository to GitHub
2. Open repository settings
3. Navigate to:

```txt
Settings → Pages
```

4. Select:

```txt
Deploy from branch
```

5. Choose:

```txt
Branch: main
Folder: /root
```

After deployment the app will be available at:

```txt
https://your-name.github.io/repository-name/
```

## PWA Installation

### Android

Open the app in Chrome or Firefox and choose:

```txt
Add to Home Screen
```

### iPhone / iPad

Open the app in Safari:

```txt
Share → Add to Home Screen
```

## Data Storage

All data is stored locally inside the browser using LocalStorage.

No user accounts, cloud services or external databases are required.

## Roadmap Ideas

- CSV export
- Manual order editing
- Statistics dashboard
- Dark/light themes
- Import/export backups
- Custom billing intervals
- Configurable break windows

## License

MIT License
