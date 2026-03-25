import { create } from 'zustand';

export interface StickyNote {
  id: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  minimized: boolean;
  zIndex: number;
}

interface StickyNotesState {
  notes: StickyNote[];
  highestZIndex: number;
  createNote: () => void;
  updateNote: (id: string, updates: Partial<StickyNote>) => void;
  deleteNote: (id: string) => void;
  bringToFront: (id: string) => void;
}

const STORAGE_KEY = 'notes-app-sticky-notes';

const DEFAULT_COLORS = [
  '#fef08a', // yellow
  '#fecaca', // red
  '#bbf7d0', // green
  '#bfdbfe', // blue
  '#fbcfe8', // pink
  '#ddd6fe', // purple
  '#fed7aa', // orange
  '#e5e7eb', // gray
];

function loadNotes(): StickyNote[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const notes = JSON.parse(data);
      return notes.map((note: StickyNote) => ({
        ...note,
        width: note.width || 200,
        height: note.height || 150,
      }));
    }
  } catch (e) {
    console.error('Failed to load sticky notes:', e);
  }
  return [];
}

function saveNotes(notes: StickyNote[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save sticky notes:', e);
  }
}

function generateId(): string {
  return `sticky-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useStickyNotesStore = create<StickyNotesState>((set, get) => ({
  notes: loadNotes(),
  highestZIndex: loadNotes().reduce((max, note) => Math.max(max, note.zIndex), 100),

  createNote: () => {
    const { notes, highestZIndex } = get();
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    const newNote: StickyNote = {
      id: generateId(),
      content: '',
      x: Math.max(20, Math.floor(screenWidth / 2 - 150 + Math.random() * 100)),
      y: Math.max(80, Math.floor(screenHeight / 2 - 150 + Math.random() * 100)),
      width: 300,
      height: 300,
      color: DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
      minimized: false,
      zIndex: highestZIndex + 1,
    };

    const newNotes = [...notes, newNote];
    saveNotes(newNotes);
    
    set({
      notes: newNotes,
      highestZIndex: newNote.zIndex,
    });
  },

  updateNote: (id: string, updates: Partial<StickyNote>) => {
    const { notes } = get();
    const newNotes = notes.map((note) =>
      note.id === id ? { ...note, ...updates } : note
    );
    saveNotes(newNotes);
    set({ notes: newNotes });
  },

  deleteNote: (id: string) => {
    const { notes } = get();
    const newNotes = notes.filter((note) => note.id !== id);
    saveNotes(newNotes);
    set({ notes: newNotes });
  },

  bringToFront: (id: string) => {
    const { notes, highestZIndex } = get();
    const newZIndex = highestZIndex + 1;
    const newNotes = notes.map((note) =>
      note.id === id ? { ...note, zIndex: newZIndex } : note
    );
    saveNotes(newNotes);
    set({ notes: newNotes, highestZIndex: newZIndex });
  },
}));

export { DEFAULT_COLORS };
