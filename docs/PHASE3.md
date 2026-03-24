# Phase 3: Linking & Knowledge Graph Basics

## Overview

This phase adds wikilinks and backlinks to transform the notes app into a knowledge system. Users can now create internal links between notes and see which notes link back to them.

## Features

### 1. Wikilinks
- Syntax: `[[Note Title]]` or `[[Note Title|Display Text]]`
- Automatically parsed from note content
- Clickable links in preview mode
- Visual styling distinguishes existing vs missing links

### 2. Backlinks Panel
- Located in the right sidebar of note pages
- Shows all notes that link to the current note
- Displays context (surrounding text) for each backlink
- Expandable/collapsible panel
- Click to navigate to the linking note

### 3. Automatic Link Resolution
- Links are matched by note title (case-insensitive)
- Backlinks map is automatically rebuilt when:
  - A note is created
  - A note is updated
  - A note is deleted
  - A note is renamed

## File Structure

```
src/
├── utils/
│   └── links.ts           # Link parsing utilities
│
packages/
└── shared/
    └── src/
        └── types.ts      # WikiLink & Backlink interfaces
```

## Implementation Details

### Link Parsing (`src/utils/links.ts`)

```typescript
// Parse all wikilinks from content
parseWikiLinks(content: string): WikiLink[]

// Extract just the titles
extractLinkTitles(content: string): string[]

// Find the note that a link points to
resolveLinkToNote(linkTitle: string, notes: Note[]): Note | undefined

// Build complete backlinks map for all notes
buildBacklinksMap(notes: Note[]): Map<string, Backlink[]>
```

### Store Integration (`src/store/notesStore.ts`)

- `backlinksMap: Map<string, Backlink[]>` - stores all backlinks
- `getBacklinks(noteId: string): Backlink[]` - get backlinks for a note
- `rebuildBacklinks()` - recalculate all backlinks
- Auto-rebuild triggered on: createNote, updateNote, deleteNote, renameNote

### UI Components

#### BacklinksPanel (`packages/ui/src/RightPanel.tsx`)
- Props:
  - `backlinks: Backlink[]`
  - `onBacklinkClick: (noteId: string) => void`
  - `isExpanded?: boolean`
  - `onToggle?: () => void`

#### NotePage Layout (`src/pages/NotePage.tsx`)
- Split layout: editor (left) + backlinks panel (right)
- 280px fixed-width backlinks sidebar

## Usage Examples

### Creating Links

In any note, type wikilinks:

```
My project notes are in [[Project Alpha]].

For details, see [[Getting Started|Getting Started Guide]].
```

The second format `[[Target|Display]]` shows "Getting Started Guide" but links to a note titled "Getting Started".

### Viewing Backlinks

1. Open any note
2. Look at the right sidebar
3. See all notes that reference this one
4. Click any backlink to navigate to that note

### Missing Links

If you link to a note that doesn't exist:
- The link appears styled differently (error color)
- No backlink is created
- You can create the note later and the link will work

## CSS Classes

| Class | Purpose |
|-------|---------|
| `.note-page-layout` | Container for editor + sidebar |
| `.note-page-sidebar` | Backlinks panel container |
| `.backlinks-panel` | Panel wrapper |
| `.backlinks-header` | Collapsible header |
| `.backlinks-list` | List of backlinks |
| `.backlink-item` | Individual backlink |
| `.backlink-title` | Note title in backlink |
| `.backlink-context` | Context preview text |
| `.wikilink` | Wikilink styling |
| `.wikilink-missing` | Unresolved link styling |

## Future Enhancements

- [ ] Graph visualization of note connections
- [ ] `[[#heading]]` links for section linking
- [ ] Backlinks count badge in sidebar file tree
- [ ] Quick-create note from missing wikilink
- [ ] Link suggestions/autocomplete while typing
- [ ] Outgoing links panel (notes this note links to)
