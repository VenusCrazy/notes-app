import { SyncStatus, SyncProvider } from '@notes-app/shared';

export interface SyncService {
  getStatus(): SyncStatus;
  setProvider(provider: SyncProvider): void;
  sync(): Promise<void>;
  pull(): Promise<void>;
  push(): Promise<void>;
}
