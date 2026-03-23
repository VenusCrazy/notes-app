import { Note, Vault, SearchResult } from '@notes-app/shared';

export interface VaultService {
  createVault(name: string, path: string): Promise<Vault>;
  openVault(path: string): Promise<Vault>;
  closeVault(): Promise<void>;
  getVault(): Vault | null;
}

export interface NoteService {
  createNote(title: string, content?: string): Promise<Note>;
  updateNote(id: string, updates: Partial<Note>): Promise<Note>;
  deleteNote(id: string): Promise<void>;
  getNote(id: string): Note | null;
  getAllNotes(): Note[];
}

export interface SearchService {
  indexVault(vault: Vault): Promise<void>;
  search(query: string): Promise<SearchResult[]>;
}
