# StudyFlow

A modern offline-first study planner that combines the best ideas from Notion, Obsidian, Todoist, TickTick, and Google Calendar while remaining lightweight and beautiful.

## Features

### Core Features
- **Dashboard** - Overview of your study progress, upcoming tasks, and recent notes
- **Notes** - Create, edit, and organize notes with notebooks
- **Tasks** - Manage tasks with priorities, due dates, and recurring options
- **Calendar** - View and manage events in month/week views
- **Focus Mode** - Pomodoro timer with focus sessions and breaks
- **Flashcards** - Study with spaced repetition using flashcard decks
- **Settings** - Customize themes, colors, and preferences

### Key Features
- Offline-first PWA (Progressive Web App)
- Local storage for all data
- Dark/Light theme support
- Multiple accent colors
- Adjustable font sizes
- Command palette (Ctrl+K)
- Keyboard shortcuts
- Data export/import
- Responsive design
- Mobile-friendly interface

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - runs entirely in the browser

### Installation

1. Clone or download the project
2. Open `index.html` in your web browser
3. Start using StudyFlow immediately

### PWA Installation

1. Open the app in a supported browser
2. Look for the install prompt in the address bar
3. Click "Install" to add StudyFlow to your desktop or home screen

## Usage

### Navigation
- Use the sidebar to navigate between different sections
- Press `Ctrl+K` (or `Cmd+K` on Mac) to open the command palette
- Use keyboard shortcuts for quick actions

### Notes
- Create notebooks to organize your notes
- Pin important notes for quick access
- Search through all your notes
- Auto-saves as you type

### Tasks
- Create tasks with titles, descriptions, and due dates
- Set priority levels (High, Medium, Low)
- Mark tasks as complete
- Filter by All, Pending, Completed, Today, or Upcoming
- Set recurring tasks (Daily, Weekly, Monthly)

### Calendar
- View events in month or week view
- Add events with titles, dates, times, and colors
- Navigate between months/weeks
- Click on dates to add events

### Focus Mode
- Start focus sessions with the Pomodoro technique
- Customize focus duration, short breaks, and long breaks
- Track your study time
- View statistics and streaks

### Flashcards
- Create decks for different subjects
- Add cards with front and back sides
- Study mode with flip animation
- Track your progress

## Keyboard Shortcuts

- `Ctrl+K` / `Cmd+K` - Open command palette
- `Ctrl+N` / `Cmd+N` - Create new note
- `Ctrl+T` / `Cmd+T` - Create new task
- `Escape` - Close modals/command palette

## Data Management

### Export Data
1. Go to Settings
2. Click "Export" under Data Management
3. Save the JSON file to your computer

### Import Data
1. Go to Settings
2. Click "Import" under Data Management
3. Select a previously exported JSON file
4. Confirm to overwrite current data

### Clear Data
1. Go to Settings
2. Click "Clear Data" under Data Management
3. Confirm twice to permanently delete all data

## Technical Details

### Architecture
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES Modules)
- **Storage**: LocalStorage (with abstraction layer for future upgrades)
- **PWA**: Service Worker for offline functionality
- **Design**: Warm minimalism with Inter font family

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Any modern browser with ES6 module support

### File Structure
```
StudyFlow/
├── index.html
├── manifest.json
├── service-worker.js
├── README.md
├── css/
│   ├── reset.css
│   ├── variables.css
│   ├── themes.css
│   ├── layout.css
│   ├── sidebar.css
│   ├── dashboard.css
│   ├── components.css
│   ├── animations.css
│   └── responsive.css
├── js/
│   ├── app.js
│   ├── router.js
│   ├── database.js
│   ├── core/
│   │   └── storage.js
│   ├── utils/
│   │   ├── date.js
│   │   ├── dom.js
│   │   └── helpers.js
│   ├── ui/
│   │   ├── modal.js
│   │   ├── toast.js
│   │   └── commandPalette.js
│   ├── pages/
│   │   ├── dashboard.js
│   │   ├── notes.js
│   │   ├── tasks.js
│   │   ├── calendar.js
│   │   ├── focus.js
│   │   ├── flashcards.js
│   │   └── settings.js
│   └── modules/
│       ├── notes.js
│       ├── tasks.js
│       ├── calendar.js
│       ├── focus.js
│       └── flashcards.js
└── assets/
    ├── images/
    └── fonts/
```

## Future Enhancements

- [ ] Markdown support in notes
- [ ] Drag and drop for tasks
- [ ] Advanced calendar features (exams, assignments)
- [ ] Ambient sounds for focus mode
- [ ] Spaced repetition algorithm for flashcards
- [ ] Analytics and heatmaps
- [ ] Cloud sync
- [ ] Collaborative features
- [ ] Mobile apps (iOS/Android)

## Contributing

This is a production-quality study application built with modern web technologies. The codebase follows SOLID principles and uses ES Modules for better maintainability.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Version

Current Version: 1.0.0

---

**StudyFlow** - Study smarter, not harder.