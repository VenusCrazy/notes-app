# UI Design System - Notes App

A clean, minimal, and professional user interface for the cross-platform note-taking application.

## Design Principles

1. **Minimal & Distraction-Free** - Clean interface that lets content shine
2. **High Readability** - Clear typography optimized for long-form writing
3. **Smooth Interactions** - Fast, responsive animations (150-250ms)
4. **Accessibility** - WCAG compliant contrast ratios
5. **Customizable** - Easy theming and extensibility

## Design Tokens

Located in `src/styles/tokens.css`, design tokens provide a centralized system for:

### Typography
```css
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'Fira Code', monospace;
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
```

### Spacing
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
```

### Colors

#### Light Theme
| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#ffffff` | Main background |
| `--color-bg-secondary` | `#f8fafc` | Sidebar, panels |
| `--color-bg-tertiary` | `#f1f5f9` | Hover states, cards |
| `--color-text` | `#0f172a` | Primary text |
| `--color-text-secondary` | `#475569` | Secondary text |
| `--color-text-tertiary` | `#94a3b8` | Muted text |
| `--color-accent` | `#3b82f6` | Links, active states |
| `--color-border` | `#e2e8f0` | Borders |

#### Dark Theme
| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#0f0f0f` | Main background |
| `--color-bg-secondary` | `#171717` | Sidebar, panels |
| `--color-bg-tertiary` | `#1f1f1f` | Hover states, cards |
| `--color-text` | `#f1f5f9` | Primary text |
| `--color-text-secondary` | `#94a3b8` | Secondary text |
| `--color-text-tertiary` | `#64748b` | Muted text |
| `--color-accent` | `#60a5fa` | Links, active states |
| `--color-border` | `#2e2e2e` | Borders |

### Layout
```css
--sidebar-width: 260px;
--sidebar-collapsed-width: 48px;
--right-panel-width: 280px;
--topbar-height: 48px;
--editor-max-width: 720px;
```

### Transitions
```css
--transition-fast: 150ms ease;
--transition-normal: 200ms ease;
--transition-slow: 300ms ease;
```

## Theme System

### Implementation
- Located in `src/hooks/useTheme.tsx`
- Supports: Light, Dark, System (auto-detect)
- Persists preference to localStorage
- Automatic switching when system preference changes

### Usage
```tsx
import { useTheme } from './hooks/useTheme';

function MyComponent() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Switch to {resolvedTheme === 'light' ? 'dark' : 'light'}
    </button>
  );
}
```

## Layout Structure

```
┌─────────────────────────────────────────────────────┐
│ Topbar (48px)                                       │
│ [Logo] [Search Bar ───────] [Theme] [Settings]      │
├──────────┬──────────────────────────────────────────┤
│ Sidebar  │ Main Content                             │
│ (260px)  │                                          │
│          │ ┌────────────────────────────────────┐   │
│ Explorer │ │ Editor                             │   │
│          │ │ - Title                            │   │
│ • Notes  │ │ - Content / Preview               │   │
│   ├─...  │ │ - Toolbar                         │   │
│   └─...  │ └────────────────────────────────────┘   │
│          │                                          │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

## Components

### Buttons
```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-ghost">Ghost</button>
<button class="btn btn-icon">Icon</button>
```

### Inputs
```html
<input class="input" placeholder="Enter text..." />
<textarea class="textarea">Textarea</textarea>
<select class="select">
  <option>Option 1</option>
</select>
```

### Toggle Switch
```html
<label class="toggle">
  <input type="checkbox" />
  <span class="toggle-slider"></span>
</label>
```

### Search Bar
```html
<div class="search-bar">
  <svg class="search-bar-icon">...</svg>
  <input class="search-bar-input" placeholder="Search..." />
  <span class="search-bar-shortcut">⌘K</span>
</div>
```

## Editor Features

### Modes
- **Edit** - Plain text editing
- **Preview** - Rendered Markdown
- **Split** - Side-by-side edit and preview

### Features
- Auto-save (1 second debounce)
- Markdown rendering with syntax highlighting
- Clean typography for headings, lists, code blocks
- Customizable font size and family
- Keyboard shortcut (⌘S to save)

## Command Palette

Press `⌘K` to open the command palette with quick access to:
- Create new note
- Toggle theme
- Toggle sidebar
- Toggle right panel
- Open settings

## File Structure

```
src/
├── styles/
│   ├── tokens.css       # Design tokens (variables)
│   ├── global.css       # Base styles, reset
│   ├── components.css   # UI components
│   ├── layout.css       # Layout structures
│   ├── editor.css       # Editor styling
│   ├── overlays.css     # Modals, dropdowns
│   ├── settings.css     # Settings page
│   └── main.css         # Entry point (imports all)
├── components/
│   ├── Layout.tsx       # Main layout with sidebar
│   ├── Icons.tsx        # SVG icon components
│   ├── CommandPalette.tsx
│   ├── NoteEditor.tsx
│   └── RightPanel.tsx
├── hooks/
│   └── useTheme.tsx     # Theme context & hook
├── pages/
│   ├── HomePage.tsx
│   ├── NotePage.tsx
│   └── SettingsPage.tsx
└── store/
    ├── notesStore.ts
    └── appStore.ts
```

## Customization

### Custom CSS
Users can add custom CSS in Settings to override:
```css
/* Change accent color */
.app-layout {
  --color-accent: #8b5cf6;
}

/* Custom font */
body {
  --font-sans: 'Your Font', sans-serif;
}
```

### Extending Themes
Add new theme variants by extending the data-theme attribute:
```css
[data-theme="high-contrast"] {
  --color-bg: #000000;
  --color-text: #ffffff;
  --color-accent: #ffff00;
}
```

## Accessibility

- All interactive elements are keyboard accessible
- Focus states are clearly visible
- Color contrast meets WCAG AA standards
- Screen reader friendly markup
- Reduced motion support via `prefers-reduced-motion`

## Performance

- CSS variables for efficient theming
- No runtime CSS-in-JS overhead
- Minimal bundle size (~60KB gzipped JS)
- Fast transitions (150-250ms)
- Lazy loading for components
