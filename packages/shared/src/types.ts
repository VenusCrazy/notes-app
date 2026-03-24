// Core types for the notes application

export interface Note {
  id: string;
  title: string;
  content: string;
  path: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface Vault {
  id: string;
  name: string;
  path: string;
  notes: Note[];
  createdAt: Date;
}

export interface WikiLink {
  raw: string;
  title: string;
  startIndex: number;
  endIndex: number;
}

export interface Backlink {
  noteId: string;
  noteTitle: string;
  notePath: string;
  context: string;
}

export interface SearchResult {
  note: Note;
  score: number;
  matches: SearchMatch[];
}

export interface SearchMatch {
  field: string;
  text: string;
  indices: [number, number][];
}

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  enabled: boolean;
  onLoad?: () => void | Promise<void>;
  onUnload?: () => void | Promise<void>;
}

export interface SyncStatus {
  state: 'idle' | 'syncing' | 'error' | 'offline';
  lastSyncedAt: Date | null;
  pendingChanges: number;
  error?: string;
}

export interface SyncProvider {
  id: string;
  name: string;
  sync(): Promise<void>;
  pull(): Promise<void>;
  push(): Promise<void>;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  vaultPath: string;
  syncEnabled: boolean;
  syncProvider?: string;
  editorFontSize: number;
  editorFontFamily: string;
}
