import { SlashCommand } from './useSlashMenu';

interface SlashMenuProps {
  position: { x: number; y: number };
  query: string;
  selectedIndex: number;
  commands: SlashCommand[];
  onSelect: (command: SlashCommand) => void;
}

export function SlashMenu({
  position,
  query,
  selectedIndex,
  commands,
  onSelect,
}: SlashMenuProps) {
  if (commands.length === 0) {
    return null;
  }

  return (
    <div
      className="slash-menu"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="slash-menu-header">
        {query ? `Results for "${query}"` : 'Basic blocks'}
      </div>
      <div className="slash-menu-items">
        {commands.map((command, index) => (
          <button
            key={command.id}
            className={`slash-menu-item ${index === selectedIndex ? 'selected' : ''}`}
            onClick={() => onSelect(command)}
            onMouseEnter={(e) => {
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const items = parent.querySelectorAll('.slash-menu-item');
                items.forEach((item, i) => {
                  item.classList.toggle('selected', i === index);
                });
              }
            }}
          >
            <span className="slash-menu-icon">{command.icon}</span>
            <div className="slash-menu-content">
              <span className="slash-menu-label">{command.label}</span>
              {command.preview && (
                <span className="slash-menu-preview">{command.preview}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
