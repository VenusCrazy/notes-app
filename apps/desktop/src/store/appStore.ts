import { create } from 'zustand';
import { AppSettings, SyncStatus } from '@notes-app/shared';

interface AppState {
  settings: AppSettings;
  syncStatus: SyncStatus;
  updateSettings: (updates: Partial<AppSettings>) => void;
  setSyncStatus: (status: Partial<SyncStatus>) => void;
}

const SETTINGS_KEY = 'notes-app-settings';

function loadSettings(): AppSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return {
    theme: 'system',
    vaultPath: '',
    syncEnabled: false,
    editorFontSize: 16,
    editorFontFamily: 'Inter',
  };
}

function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export const useAppStore = create<AppState>((set) => ({
  settings: loadSettings(),
  syncStatus: {
    state: 'idle',
    lastSyncedAt: null,
    pendingChanges: 0,
  },

  updateSettings: (updates: Partial<AppSettings>) => {
    set((state) => {
      const newSettings = { ...state.settings, ...updates };
      saveSettings(newSettings);
      return { settings: newSettings };
    });
  },

  setSyncStatus: (status: Partial<SyncStatus>) => {
    set((state) => ({
      syncStatus: { ...state.syncStatus, ...status },
    }));
  },
}));
