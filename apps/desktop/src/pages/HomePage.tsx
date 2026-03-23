import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotesStore } from '../store/notesStore';
import { Icons } from '@notes-app/ui';

export function HomePage() {
  const navigate = useNavigate();
  const { notes, createNote } = useNotesStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateNote = useCallback(async () => {
    const note = await createNote('Untitled');
    navigate(`/note/${note.id}`);
  }, [createNote, navigate]);

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: 'var(--space-8)', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>
          All Notes
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {notes.length} note{notes.length !== 1 ? 's' : ''} in your vault
        </p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <div className="search-bar" style={{ flex: 1, maxWidth: '400px' }}>
          <Icons.Search className="search-bar-icon" />
          <input
            type="text"
            className="search-bar-input"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 'var(--space-8)' }}
          />
        </div>
        <button className="btn btn-primary" onClick={handleCreateNote}>
          <Icons.Plus />
          New Note
        </button>
      </div>

      {filteredNotes.length === 0 ? (
        <EmptyState onCreateNote={handleCreateNote} hasNotes={notes.length > 0} />
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} onClick={() => navigate(`/note/${note.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

interface NoteCardProps {
  note: { id: string; title: string; content: string; updatedAt: Date };
  onClick: () => void;
}

function NoteCard({ note, onClick }: NoteCardProps) {
  const preview = note.content.slice(0, 120) + (note.content.length > 120 ? '...' : '');
  const formattedDate = new Date(note.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      onClick={onClick}
      style={{
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-accent)';
        e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
        e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
      }}
    >
      <h3 style={{
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-medium)',
        marginBottom: 'var(--space-2)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {note.title || 'Untitled'}
      </h3>
      <p style={{
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-secondary)',
        lineHeight: 'var(--leading-relaxed)',
        marginBottom: 'var(--space-3)',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {preview || 'No content'}
      </p>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
        {formattedDate}
      </span>
    </div>
  );
}

interface EmptyStateProps {
  onCreateNote: () => void;
  hasNotes: boolean;
}

function EmptyState({ onCreateNote, hasNotes }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <Icons.FileText className="empty-state-icon" style={{ width: '64px', height: '64px' }} />
      <h2 className="empty-state-title">
        {hasNotes ? 'No matching notes' : 'Welcome to Notes'}
      </h2>
      <p className="empty-state-description">
        {hasNotes
          ? 'Try adjusting your search terms'
          : 'Create your first note to start organizing your thoughts'}
      </p>
      {!hasNotes && (
        <button className="btn btn-primary btn-lg" onClick={onCreateNote}>
          <Icons.Plus />
          Create your first note
        </button>
      )}
    </div>
  );
}
