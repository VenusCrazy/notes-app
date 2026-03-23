# Notes App - Cross-platform Note-Taking Application

An Obsidian-like, extensible note-taking application built with Tauri (desktop) and React.

## Architecture Overview

```
notes-app/
├── apps/
│   ├── web/                    # Web frontend (React + Vite)
│   │   ├── src/
│   │   │   ├── components/     # Layout components
│   │   │   ├── pages/         # Page components (Home, Note, Settings)
│   │   │   ├── store/         # Zustand stores
│   │   │   ├── App.tsx        # Main app with routing
│   │   │   └── main.tsx       # Entry point
│   │   └── package.json
│   │
│   └── desktop/               # Tauri desktop app
│       ├── src/               # React frontend (same as web)
│       ├── src-tauri/         # Rust backend
│       │   ├── src/
│       │   │   ├── lib.rs     # Main Tauri logic
│       │   │   └── main.rs    # Entry point
│       │   └── tauri.conf.json
│       └── package.json
│
├── packages/
│   ├── core/                  # Core business logic
│   │   └── src/
│   │       ├── index.ts       # Package exports
│   │       └── services.ts    # Vault, Note, Search interfaces
│   │
│   ├── plugins/              # Plugin system and core plugins
│   │   └── src/
│   │       ├── index.ts       # Package exports
│   │       └── types.ts       # Plugin API definitions
│   │
│   ├── sync/                 # Sync service layer
│   │   └── src/
│   │       ├── index.ts       # Package exports
│   │       └── types.ts       # Sync interfaces
│   │
│   ├── shared/               # Shared types, utilities, hooks
│   │   └── src/
│   │       ├── index.ts       # Package exports
│   │       └── types.ts       # Core TypeScript interfaces
│   │
│   └── ui/                   # Shared UI components
│       └── src/
│           ├── index.ts       # Package exports
│           └── components.ts  # Shared component types
│
├── turbo.json                # Turborepo configuration
├── tsconfig.json              # Root TypeScript config
├── eslint.config.js           # ESLint configuration
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

### Package Manager
- **npm 11** with workspaces

## Package Responsibilities

### @notes-app/shared
- Core TypeScript types and interfaces (Note, Vault, Plugin, SyncStatus, etc.)
- Constants and enums
- Platform-agnostic utilities

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

### @notes-app/ui
- Base UI components (Button, Input, etc.)
- Design system tokens
- Themed components

## App Structure

### Pages
1. **HomePage** - Note list with search, create new note
2. **NotePage** - Full-screen note editor with title/content
3. **SettingsPage** - Theme, editor, and sync settings

### State Management (Zustand)
- **notesStore** - Notes CRUD, localStorage persistence
- **appStore** - App settings, sync status

### Routing
```
/                    → HomePage (note list)
/note/:id           → NotePage (editor)
/settings           → SettingsPage
```

## Development Phases

- **Phase 0**: Project Setup & Architecture (COMPLETED)
- **Phase 1**: Core Note-Taking Features
- **Phase 2**: Plugin System
- **Phase 3**: Sync & Collaboration
- **Phase 4**: Mobile Support
- **Phase 5**: Advanced Features

## UI Design System

The app features a clean, professional UI with:

### Design System
- **Design Tokens**: Centralized CSS variables in `src/styles/tokens.css`
- **Theme System**: Light, Dark, and System themes with persistence
- **Typography**: Inter font family with clear hierarchy
- **Components**: Reusable buttons, inputs, toggles, modals

### Layout
- **Top Bar**: Search/command palette, theme toggle, settings
- **Sidebar**: Collapsible file explorer with notes list
- **Main Content**: Note editor with Edit/Preview/Split modes
- **Right Panel**: Optional backlinks/outline panel

### Key Features
- Command palette (⌘K)
- Markdown preview with clean styling
- Auto-save with visual feedback
- Keyboard shortcuts
- Custom CSS support

See [UI Design Documentation](./UI_DESIGN.md) for details.

## Getting Started

```bash
# Install all dependencies
npm install

# Build all packages
npm run build

# Run web app
npm run dev --workspace=@notes-app/web

# Run desktop app (requires Rust toolchain)
cd apps/desktop
npm run tauri dev
```

## Phase 0 Deliverables

- [x] Monorepo setup with Turborepo
- [x] Desktop app: Tauri 2.x configuration
- [x] Frontend: React 18 + TypeScript + Vite
- [x] State Management: Zustand with persistence
- [x] Routing: React Router 6
- [x] UI System: Complete design system with themes
- [x] Package structure defined (core, plugins, sync, shared, ui)
- [x] Architecture documentation
- [x] Working empty app (web builds and runs)
- [x] Clean folder structure

## Next Steps (Phase 1)

1. Implement Vault service for file system operations
2. Add Markdown parsing and rendering
3. Implement real-time search
4. Add file watcher for external changes
5. Implement auto-save functionality
