# Notes App - Cross-platform Note-Taking Application

An Obsidian-like, extensible note-taking application built with Tauri (desktop) and React.

## Architecture Overview

```
notes-app/
├── apps/
│   ├── web/                    # Web frontend (React)
│   └── desktop/               # Tauri desktop app
├── packages/
│   ├── core/                  # Core business logic (vault, notes, search)
│   ├── plugins/              # Plugin system and core plugins
│   ├── sync/                 # Sync service layer
│   ├── shared/               # Shared types, utilities, hooks
│   └── ui/                   # Shared UI components
├── turbo.json                # Turborepo configuration
└── package.json              # Root package.json
```

## Tech Stack

### Desktop
- **Tauri 2.x** - Rust-based desktop framework (smaller binary, better performance)

### Frontend
- **React 18** + TypeScript
- **Vite** - Build tool
- **TailwindCSS** - Styling

### State Management
- **Zustand** - Lightweight, React state management

### Routing
- **React Router 6** - Client-side routing

### Monorepo
- **Turborepo** - Build system and task orchestration

## Package Responsibilities

### @notes-app/core
- Vault management (file system operations)
- Note CRUD operations
- Search indexing (full-text search)
- Metadata extraction

### @notes-app/plugins
- Plugin system (load, unload, enable, disable)
- Plugin API definitions
- Core plugins (Markdown, Tags, Graph View, etc.)

### @notes-app/sync
- Sync protocol implementation
- Conflict resolution
- Provider abstraction (local, cloud)
- Offline queue

### @notes-app/shared
- TypeScript types and interfaces
- Utility functions
- Custom hooks
- Constants

### @notes-app/ui
- Base UI components
- Design system tokens
- Themed components

## Development Phases

- **Phase 0**: Project Setup & Architecture (current)
- **Phase 1**: Core Note-Taking Features
- **Phase 2**: Plugin System
- **Phase 3**: Sync & Collaboration
- **Phase 4**: Mobile Support
- **Phase 5**: Advanced Features

## Getting Started

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run desktop app
npm run desktop

# Run web app
npm run web

# Run in development mode
npm run dev
```

## License

MIT
