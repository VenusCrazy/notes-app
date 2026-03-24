---
title: "PHASE2"
created: 2026-03-24T03:54:18.059311817+00:00
---

# Phase 2: Markdown Editor

## Overview

This phase focuses on building a robust core editing experience with a split-view markdown editor, live preview rendering, syntax highlighting, auto-save functionality, and drag & drop image support.

## Features Implemented

### 1. Split View Editor

The editor now supports three view modes:

- **Edit Mode** - Full-width markdown text editor
- **Preview Mode** - Full-width rendered markdown preview
- **Split Mode** (Default) - Side-by-side editor and live preview

**Implementation:**
- View mode toggle in the toolbar
- Responsive split view with proper flex layout
- Visual divider between editor and preview panes

### 2. Live Preview Rendering

Real-time markdown rendering with full GitHub Flavored Markdown (GFM) support.

**Supported Elements:**
- Headers (h1-h6)
- Bold, italic, strikethrough text
- Links and images
- Code blocks (inline and fenced)
- Blockquotes
- Ordered and unordered lists
- Task lists with checkboxes
- Tables
- Horizontal rules

**Libraries Used:**
- `react-markdown` - Markdown parsing and rendering
- `remark-gfm` - GitHub Flavored Markdown support

### 3. Syntax Highlighting

Code blocks are automatically highlighted with language detection.

**Features:**
- Automatic language detection from code fence (e.g., ` ```javascript `)
- Dark theme styling (oneDark theme)
- Proper line wrapping for long code
- Inline code styling distinct from block code

**Supported Languages:**
All languages supported by `prism-react-renderer` including: JavaScript, TypeScript, Python, Rust, Go, HTML, CSS, JSON, YAML, SQL, Bash, and many more.

### 4. Auto-Save

Notes are automatically saved after 1 second of inactivity.

**Behavior:**
- Debounced save (1 second delay after last edit)
- Visual indicator shows save status
- Saves both title and content
- Persists to filesystem via Tauri IPC

**Save States:**
- `Saving...` - Currently saving
- `Saved Xm ago` - Successfully saved with relative time
- `Not saved` - Initial state before first save

### 5. Drag & Drop Image Support

Users can drag and drop images directly into the editor.

**Flow:**
1. User drags image file over editor
2. Visual drop overlay appears
3. User drops image
4. Image is copied to vault's `images/` directory
5. Markdown image syntax is inserted at cursor position

**Supported Formats:**
- PNG, JPG, JPEG, GIF, WebP, SVG

**File Storage:**
- Images stored in `{vault}/images/` directory
- Filenames sanitized (special characters removed)
- Duplicate filenames get numeric suffixes

## Architecture

### Component Structure

```
NoteEditor (packages/ui/src/NoteEditor.tsx)
├── EditorToolbar
│   └── Mode toggle buttons (Edit/Preview/Split)
├── Editor Area
│   ├── Title input
│   ├── Content textarea / Preview
│   └── Drop overlay (when dragging)
└── EditorFooter
    └── Save status indicator
```

### File Flow

```
User Action (drag/drop)
    ↓
NotePage.tsx (handler)
    ↓
invoke('copy_image_to_vault')
    ↓
Rust Backend (lib.rs)
    ↓
File System (vault/images/)
    ↓
Insert markdown reference into editor
```

## API Reference

### Frontend Props

```typescript
interface NoteEditorProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onSave: () => void;
  onDelete?: () => void;
  onDropImage?: (file: File) => Promise<string | null>;
  lastSaved?: Date | null;
}
```

### Backend Commands

#### `copy_image_to_vault`

Copies an image file to the vault's images directory.

**Parameters:**
```rust
fn copy_image_to_vault(
    vault_path: String,   // Path to the vault
    file_name: String,    // Original filename
    data: Vec<u8>,        // Image data as bytes
) -> Result<String, String>  // Returns new file path
```

**Returns:**
- Full path to the copied image on success
- Error string on failure

**Example:**
```typescript
const imagePath = await invoke('copy_image_to_vault', {
  vaultPath: '/path/to/vault',
  fileName: 'screenshot.png',
  data: [...uint8Array],
});
```

## Configuration

### Editor Modes

The default mode is `split`. Users can toggle between modes using the toolbar buttons.

### Auto-Save Settings

Auto-save delay is configured in `NotePage.tsx`:
```typescript
const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
// ...
saveTimeoutRef.current = setTimeout(() => {
  handleSave();
}, 1000); // 1 second delay
```

## Styling

### CSS Variables Used

```css
--color-accent         /* Accent color for interactive elements */
--color-border        /* Border and divider color */
--color-text          /* Primary text color */
--color-text-secondary /* Secondary text */
--color-text-tertiary  /* Tertiary/muted text */
--color-bg            /* Background color */
--color-bg-secondary  /* Secondary background */
--color-bg-tertiary   /* Tertiary background */
--font-mono           /* Monospace font for code */
--space-*             /* Spacing scale */
--radius-*            /* Border radius scale */
```

### Key CSS Classes

| Class | Purpose |
|-------|---------|
| `.split-view` | Container for split editor layout |
| `.split-editor` | Left pane with textarea |
| `.split-preview` | Right pane with rendered markdown |
| `.split-divider` | Visual divider between panes |
| `.drop-overlay` | Full-screen overlay when dragging |
| `.save-indicator` | Status text with animated dot |

## Dependencies Added

```json
{
  "react-markdown": "^9.x",       // Markdown rendering
  "remark-gfm": "^4.x",          // GFM support
  "react-syntax-highlighter": "^15.x",  // Syntax highlighting
  "@types/react-syntax-highlighter": "^15.x"  // TypeScript types
}
```

## Testing Checklist

- [ ] Split view displays editor and preview side-by-side
- [ ] Preview updates in real-time as user types
- [ ] Code blocks are syntax highlighted
- [ ] Tables render correctly
- [ ] Task lists with checkboxes work
- [ ] Drag & drop overlay appears when dragging image
- [ ] Dropped images are saved to `vault/images/`
- [ ] Image markdown syntax inserted at cursor position
- [ ] Auto-save triggers after editing stops
- [ ] Save status indicator shows correct state
- [ ] Cmd+S / Ctrl+S manual save works
- [ ] All three view modes toggle correctly

## Future Enhancements

Potential improvements for future phases:

1. **Editor enhancements** - Line numbers, code folding, search & replace
2. **Image management** - Image gallery, delete unused images
3. **Export options** - Export to PDF, HTML, DOCX
4. **Keyboard shortcuts** - Markdown shortcuts (e.g., `**bold**`)
5. **Settings** - Configurable auto-save delay, default view mode
