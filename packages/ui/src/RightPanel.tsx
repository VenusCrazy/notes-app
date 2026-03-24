import { Icons } from './Icons';

interface BacklinksPanelProps {
  backlinks: {
    noteId: string;
    noteTitle: string;
    notePath: string;
    context: string;
  }[];
  onBacklinkClick: (noteId: string) => void;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function BacklinksPanel({ 
  backlinks, 
  onBacklinkClick,
  isExpanded = true,
  onToggle,
}: BacklinksPanelProps) {
  if (backlinks.length === 0) {
    return (
      <div className="backlinks-panel">
        <div className="backlinks-header">
          <div className="backlinks-header-left">
            <Icons.Link style={{ width: 14, height: 14 }} />
            <span>Backlinks</span>
            <span className="backlinks-count">{backlinks.length}</span>
          </div>
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', padding: 'var(--space-2)' }}>
          No backlinks yet
        </p>
      </div>
    );
  }

  return (
    <div className="backlinks-panel">
      <button className="backlinks-header" onClick={onToggle}>
        <div className="backlinks-header-left">
          <Icons.Link style={{ width: 14, height: 14 }} />
          <span>Backlinks</span>
          <span className="backlinks-count">{backlinks.length}</span>
        </div>
        {onToggle && (
          <Icons.ChevronRight
            style={{
              width: 14,
              height: 14,
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 150ms ease',
            }}
          />
        )}
      </button>

      {isExpanded && (
        <div className="backlinks-list">
          {backlinks.map((backlink, index) => (
            <button
              key={`${backlink.noteId}-${index}`}
              className="backlink-item"
              onClick={() => onBacklinkClick(backlink.noteId)}
            >
              <div className="backlink-title">
                <Icons.FileText style={{ width: 12, height: 12 }} />
                <span>{backlink.noteTitle}</span>
              </div>
              {backlink.context && (
                <div className="backlink-context">{backlink.context}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface OutlinePanelProps {
  headings: {
    level: number;
    text: string;
    id: string;
  }[];
  activeId?: string;
  onHeadingClick?: (id: string) => void;
}

export function OutlinePanel({ headings, activeId, onHeadingClick }: OutlinePanelProps) {
  if (headings.length === 0) {
    return (
      <div className="outline-panel">
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>
          No headings found
        </p>
      </div>
    );
  }

  return (
    <div className="outline-panel">
      {headings.map((heading) => (
        <div
          key={heading.id}
          className={`outline-item outline-item-h${heading.level}`}
        >
          <a
            href={`#${heading.id}`}
            className={`outline-link ${activeId === heading.id ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onHeadingClick?.(heading.id);
            }}
          >
            {heading.text}
          </a>
        </div>
      ))}
    </div>
  );
}
