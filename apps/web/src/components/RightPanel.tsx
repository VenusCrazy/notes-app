interface BacklinksPanelProps {
  backlinks: {
    id: string;
    title: string;
    context: string;
  }[];
}

export function BacklinksPanel({ backlinks }: BacklinksPanelProps) {
  return (
    <div className="backlinks-panel">
      <div className="backlinks-count">
        {backlinks.length} backlink{backlinks.length !== 1 ? 's' : ''}
      </div>
      {backlinks.length === 0 ? (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>
          No backlinks yet
        </p>
      ) : (
        backlinks.map((backlink) => (
          <div key={backlink.id} className="backlink-item">
            <div className="backlink-title">{backlink.title}</div>
            <div className="backlink-context">{backlink.context}</div>
          </div>
        ))
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
