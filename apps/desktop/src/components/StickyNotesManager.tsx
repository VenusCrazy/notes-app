import { useStickyNotesStore } from '../store/stickyNotesStore';
import { StickyNoteComponent } from './StickyNote';

export function StickyNotesManager() {
  const notes = useStickyNotesStore((state) => state.notes);

  return (
    <div className="sticky-notes-container">
      {notes.map((note) => (
        <StickyNoteComponent key={note.id} note={note} />
      ))}
    </div>
  );
}
