import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { Note } from '@notes-app/shared';

interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  isLoading: boolean;
  error: string | null;
  createNote: (title: string, content?: string) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => Promise<void>;
  setCurrentNote: (note: Note | null) => void;
  loadNotes: () => Promise<void>;
  saveNotes: () => Promise<void>;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const STORAGE_KEY = 'notes-app-notes';

function loadFromLocalStorage(): Note[] {
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
    console.error('Failed to load notes from localStorage:', e);
  }
  return [];
}

function saveToLocalStorage(notes: Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes to localStorage:', e);
  }
}

function migrateLocalStorageToFile(): Promise<Note[]> {
  return new Promise((resolve) => {
    const localNotes = loadFromLocalStorage();
    if (localNotes.length > 0) {
      invoke<Note[]>('load_notes')
        .then((fileNotes) => {
          if (fileNotes.length === 0 && localNotes.length > 0) {
            invoke('save_notes', { notes: localNotes })
              .then(() => {
                localStorage.removeItem(STORAGE_KEY);
                resolve(localNotes);
              })
              .catch(() => resolve(localNotes));
          } else {
            resolve(fileNotes);
          }
        })
        .catch(() => resolve(localNotes));
    } else {
      resolve([]);
    }
  });
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: loadFromLocalStorage(),
  currentNote: null,
  isLoading: false,
  error: null,

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
      saveToLocalStorage(newNotes);
      get().saveNotes();
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
      saveToLocalStorage(newNotes);
      return { notes: newNotes };
    });
    get().saveNotes();
  },

  deleteNote: async (id: string) => {
    set((state) => {
      const newNotes = state.notes.filter((note) => note.id !== id);
      saveToLocalStorage(newNotes);
      return { notes: newNotes };
    });
    get().saveNotes();
  },

  setCurrentNote: (note: Note | null) => {
    set({ currentNote: note });
  },

  loadNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const notes = await invoke<Note[]>('load_notes');
      if (notes.length > 0) {
        set({ notes, isLoading: false });
      } else {
        const migratedNotes = await migrateLocalStorageToFile();
        set({ notes: migratedNotes.length > 0 ? migratedNotes : notes, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load notes from Tauri:', error);
      const localNotes = loadFromLocalStorage();
      set({ notes: localNotes, isLoading: false, error: String(error) });
    }
  },

  saveNotes: async () => {
    const { notes } = get();
    try {
      await invoke('save_notes', { notes });
    } catch (error) {
      console.error('Failed to save notes to Tauri:', error);
    }
  },
}));
