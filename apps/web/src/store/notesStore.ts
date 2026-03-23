import { create } from 'zustand';
import { Note } from '@notes-app/shared';

interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  createNote: (title: string, content?: string) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => Promise<void>;
  setCurrentNote: (note: Note | null) => void;
  loadNotes: () => Promise<void>;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const STORAGE_KEY = 'notes-app-notes';

function loadFromStorage(): Note[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const notes = JSON.parse(data);
      return notes.map((note: Note) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
    }
  } catch (e) {
    console.error('Failed to load notes from storage:', e);
  }
  return [];
}

function saveToStorage(notes: Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes to storage:', e);
  }
}

export const useNotesStore = create<NotesState>((set) => ({
  notes: loadFromStorage(),
  currentNote: null,

  createNote: async (title: string, content: string = '') => {
    const newNote: Note = {
      id: generateId(),
      title,
      content,
      path: `/${title.toLowerCase().replace(/\s+/g, '-')}.md`,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      metadata: {},
    };

    set((state) => {
      const newNotes = [newNote, ...state.notes];
      saveToStorage(newNotes);
      return { notes: newNotes };
    });

    return newNote;
  },

  updateNote: (id: string, updates: Partial<Note>) => {
    set((state) => {
      const newNotes = state.notes.map((note) =>
        note.id === id
          ? { ...note, ...updates, updatedAt: new Date() }
          : note
      );
      saveToStorage(newNotes);
      return { notes: newNotes };
    });
  },

  deleteNote: async (id: string) => {
    set((state) => {
      const newNotes = state.notes.filter((note) => note.id !== id);
      saveToStorage(newNotes);
      return { notes: newNotes };
    });
  },

  setCurrentNote: (note: Note | null) => {
    set({ currentNote: note });
  },

  loadNotes: async () => {
    const notes = loadFromStorage();
    set({ notes });
  },
}));
