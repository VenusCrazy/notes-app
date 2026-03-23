import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@notes-app/ui';
import App from './App';
import { useNotesStore } from './store/notesStore';
import './index.css';

function AppInitializer({ children }: { children: React.ReactNode }) {
  const loadNotes = useNotesStore((state) => state.loadNotes);
  
  React.useEffect(() => {
    loadNotes();
  }, [loadNotes]);
  
  return <>{children}</>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AppInitializer>
          <App />
        </AppInitializer>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
