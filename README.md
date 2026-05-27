# Auftrag Timer

A lightweight Progressive Web App (PWA) for tracking sequential work orders on smartphones and desktop devices.

The app automatically stops the currently running order when a new one is started and calculates the total tracked time.

## Features

- Start and stop work orders
- Automatic switching between running orders
- Total time calculation
- Persistent local storage
- Offline support
- Installable as a PWA
- Mobile-first UI
- Android and iOS compatible

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
git clone https://github.com/your-name/your-repo.git
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

## License

MIT License
