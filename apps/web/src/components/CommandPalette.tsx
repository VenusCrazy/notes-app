import React, { useState, useEffect, useCallback, useRef } from 'react';

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string[];
  action: () => void;
  category?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  items: CommandItem[];
  placeholder?: string;
}

export function CommandPalette({ isOpen, onClose, items, placeholder = 'Type a command...' }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description?.toLowerCase().includes(query.toLowerCase())
  );

  const groupedItems = filteredItems.reduce((acc, item) => {
    const category = item.category || 'Actions';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  const flatItems = Object.values(groupedItems).flat();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (selectedIndex >= flatItems.length) {
      setSelectedIndex(Math.max(0, flatItems.length - 1));
    }
  }, [flatItems.length, selectedIndex]);

  const executeCommand = useCallback((item: CommandItem) => {
    item.action();
    onClose();
  }, [onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, flatItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (flatItems[selectedIndex]) {
          executeCommand(flatItems[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [flatItems, selectedIndex, executeCommand, onClose]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!isOpen) {
          // This would be handled by parent
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  let currentIndex = -1;

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette" onClick={e => e.stopPropagation()}>
        <div className="command-palette-header">
          <svg className="command-palette-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="command-palette-input"
            placeholder={placeholder}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="command-palette-body" ref={listRef}>
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category} className="command-palette-group">
              <div className="command-palette-group-title">{category}</div>
              {categoryItems.map(item => {
                currentIndex++;
                const itemIndex = currentIndex;
                return (
                  <div
                    key={item.id}
                    className={`command-palette-item ${itemIndex === selectedIndex ? 'selected' : ''}`}
                    onClick={() => executeCommand(item)}
                    onMouseEnter={() => setSelectedIndex(itemIndex)}
                  >
                    {item.icon && <span className="command-palette-item-icon">{item.icon}</span>}
                    <div className="command-palette-item-content">
                      <div className="command-palette-item-title">{item.title}</div>
                      {item.description && (
                        <div className="command-palette-item-description">{item.description}</div>
                      )}
                    </div>
                    {item.shortcut && (
                      <div className="command-palette-item-shortcut">
                        {item.shortcut.map((key, i) => (
                          <span key={i} className="command-palette-item-key">{key}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p style={{ color: 'var(--color-text-tertiary)' }}>No commands found</p>
            </div>
          )}
        </div>
        <div className="command-palette-footer">
          <div className="command-palette-hints">
            <span className="command-palette-hint">
              <span className="shortcut-key">↑</span>
              <span className="shortcut-key">↓</span>
              to navigate
            </span>
            <span className="command-palette-hint">
              <span className="shortcut-key">↵</span>
              to select
            </span>
            <span className="command-palette-hint">
              <span className="shortcut-key">esc</span>
              to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
