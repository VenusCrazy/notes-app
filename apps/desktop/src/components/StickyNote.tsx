import { useState, useRef, useCallback, useEffect } from 'react';
import { useStickyNotesStore, StickyNote, DEFAULT_COLORS } from '../store/stickyNotesStore';
import { Icons, useSlashMenu, SlashMenu } from '@notes-app/ui';

interface StickyNoteProps {
  note: StickyNote;
}

export function StickyNoteComponent({ note }: StickyNoteProps) {
  const { updateNote, deleteNote, bringToFront } = useStickyNotesStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.sticky-note-controls') || 
        (e.target as HTMLElement).closest('.sticky-note-textarea') ||
        (e.target as HTMLElement).closest('.sticky-note-resize')) {
      return;
    }
    
    bringToFront(note.id);
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - note.x,
      y: e.clientY - note.y,
    };
  }, [note.id, note.x, note.y, bringToFront]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    bringToFront(note.id);
    setIsResizing(true);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: note.width,
      height: note.height,
    };
  }, [note.id, note.width, note.height, bringToFront]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = Math.max(0, Math.min(window.innerWidth - 150, e.clientX - dragOffset.current.x));
      const newY = Math.max(52, Math.min(window.innerHeight - 100, e.clientY - dragOffset.current.y));
      updateNote(note.id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, note.id, updateNote]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.current.x;
      const deltaY = e.clientY - resizeStart.current.y;
      const newWidth = Math.max(200, Math.min(600, resizeStart.current.width + deltaX));
      const newHeight = Math.max(200, Math.min(600, resizeStart.current.height + deltaY));
      updateNote(note.id, { width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, note.id, updateNote]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNote(note.id, { content: e.target.value });
  };

  const handleInsertText = useCallback((newContent: string, cursorPos: number) => {
    updateNote(note.id, { content: newContent });
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = cursorPos;
        textareaRef.current.selectionEnd = cursorPos;
        textareaRef.current.focus();
      }
    }, 0);
  }, [note.id, updateNote]);

  const {
    isOpen: slashMenuOpen,
    query: slashQuery,
    position: slashPosition,
    selectedIndex: slashSelectedIndex,
    filteredCommands,
    handleKeyDown: handleSlashKeyDown,
    handleInput: handleSlashInput,
    closeMenu: closeSlashMenu,
  } = useSlashMenu(textareaRef as React.RefObject<HTMLTextAreaElement>, handleInsertText);

  const handleDelete = () => {
    deleteNote(note.id);
  };

  const handleMinimize = () => {
    updateNote(note.id, { minimized: !note.minimized });
  };

  const handleColorChange = (color: string) => {
    updateNote(note.id, { color });
    setShowColorPicker(false);
  };

  const getContrastColor = (hexColor: string) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.9)';
  };

  const textColor = getContrastColor(note.color);

  return (
    <div
      ref={noteRef}
      className={`sticky-note ${note.minimized ? 'minimized' : ''} ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''}`}
      style={{
        left: note.x,
        top: note.y,
        width: note.minimized ? 180 : note.width,
        height: note.minimized ? 32 : note.height,
        zIndex: note.zIndex,
        backgroundColor: note.color,
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="sticky-note-header" style={{ color: textColor }}>
        <div className="sticky-note-drag-handle" style={{ color: textColor }}>
          <Icons.GripHorizontal style={{ width: 14, height: 14 }} />
        </div>
        
        {showControls && (
          <div className="sticky-note-controls">
            <button
              className="sticky-note-btn"
              onClick={handleMinimize}
              title={note.minimized ? 'Expand' : 'Minimize'}
              style={{ color: textColor }}
            >
              {note.minimized ? (
                <Icons.Maximize2 style={{ width: 12, height: 12 }} />
              ) : (
                <Icons.Minimize2 style={{ width: 12, height: 12 }} />
              )}
            </button>
            
            <div className="sticky-note-color-wrapper">
              <button
                className="sticky-note-btn"
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="Change color"
                style={{ color: textColor }}
              >
                <Icons.Palette style={{ width: 12, height: 12 }} />
              </button>
              
              {showColorPicker && (
                <div className="sticky-note-color-picker">
                  {DEFAULT_COLORS.map((color) => (
                    <button
                      key={color}
                      className={`color-option ${note.color === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <button
              className="sticky-note-btn sticky-note-btn-delete"
              onClick={handleDelete}
              title="Delete"
              style={{ color: textColor }}
            >
              <Icons.X style={{ width: 12, height: 12 }} />
            </button>
          </div>
        )}
      </div>

      {!note.minimized && (
        <>
          <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <textarea
              ref={textareaRef}
              className="sticky-note-textarea"
              value={note.content}
              onChange={(e) => {
                handleContentChange(e);
                handleSlashInput();
              }}
              onKeyDown={(e) => {
                handleSlashKeyDown(e);
              }}
              placeholder="Type / for commands..."
              style={{ color: textColor, flex: 1 }}
            />
            {slashMenuOpen && slashPosition && (
              <SlashMenu
                position={slashPosition}
                query={slashQuery}
                selectedIndex={slashSelectedIndex}
                commands={filteredCommands}
                onSelect={(cmd) => {
                  const textarea = textareaRef.current;
                  if (textarea) {
                    const { selectionStart, value } = textarea;
                    const textBeforeCursor = value.slice(0, selectionStart);
                    const lastNewline = textBeforeCursor.lastIndexOf('\n');
                    const slashPos = textBeforeCursor.lastIndexOf('/');
                    const beforeSlash = value.slice(0, lastNewline + 1 + slashPos);
                    const afterCursor = value.slice(selectionStart);
                    const newValue = beforeSlash + cmd.insert + afterCursor;
                    handleInsertText(newValue, beforeSlash.length + cmd.insert.length);
                    closeSlashMenu();
                  }
                }}
              />
            )}
          </div>
          <div
            className="sticky-note-resize"
            onMouseDown={handleResizeMouseDown}
            style={{ color: textColor }}
          >
            <Icons.CornerDownRight style={{ width: 10, height: 10, opacity: 0.5 }} />
          </div>
        </>
      )}
    </div>
  );
}
