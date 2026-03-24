import { useState, useCallback } from 'react';

export interface SlashCommand {
  id: string;
  label: string;
  icon: string;
  insert: string;
  preview?: string;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  { id: 'h1', label: 'Heading 1', icon: 'H1', insert: '# ', preview: 'Large heading' },
  { id: 'h2', label: 'Heading 2', icon: 'H2', insert: '## ', preview: 'Medium heading' },
  { id: 'h3', label: 'Heading 3', icon: 'H3', insert: '### ', preview: 'Small heading' },
  { id: 'bullet', label: 'Bullet List', icon: '•', insert: '- ', preview: 'Unordered list' },
  { id: 'numbered', label: 'Numbered List', icon: '1.', insert: '1. ', preview: 'Ordered list' },
  { id: 'todo', label: 'To-do', icon: '☑', insert: '- [ ] ', preview: 'Task with checkbox' },
  { id: 'quote', label: 'Quote', icon: '"', insert: '> ', preview: 'Blockquote' },
  { id: 'divider', label: 'Divider', icon: '—', insert: '\n---\n', preview: 'Horizontal line' },
  { id: 'code', label: 'Code Block', icon: '</>', insert: '```\n\n```', preview: 'Code snippet' },
];

interface SlashMenuState {
  isOpen: boolean;
  query: string;
  position: { x: number; y: number } | null;
  selectedIndex: number;
  slashPosition: number;
}

export function useSlashMenu(
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  onInsert: (text: string, cursorOffset: number) => void
) {
  const [state, setState] = useState<SlashMenuState>({
    isOpen: false,
    query: '',
    position: null,
    selectedIndex: 0,
    slashPosition: 0,
  });

  const filteredCommands = state.query
    ? SLASH_COMMANDS.filter((cmd) =>
        cmd.label.toLowerCase().includes(state.query.toLowerCase())
      )
    : SLASH_COMMANDS;

  const getCaretPosition = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return null;

    try {
      const textareaRect = textarea.getBoundingClientRect();
      
      const style = window.getComputedStyle(textarea);
      const lineHeight = parseInt(style.lineHeight) || 20;
      const paddingTop = parseInt(style.paddingTop) || 12;
      const paddingLeft = parseInt(style.paddingLeft) || 14;
      
      const text = textarea.value;
      const pos = textarea.selectionStart;
      
      const lines = text.slice(0, pos).split('\n');
      const lineNum = lines.length - 1;
      
      const mirror = document.createElement('div');
      const styles = window.getComputedStyle(textarea);
      mirror.style.cssText = `
        position: absolute;
        top: 0;
        left: -9999px;
        width: ${textarea.clientWidth}px;
        font: ${styles.font};
        font-size: ${styles.fontSize};
        line-height: ${styles.lineHeight};
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow: hidden;
      `;
      
      const textBeforeCursor = text.slice(0, pos);
      mirror.textContent = textBeforeCursor;
      
      const span = document.createElement('span');
      span.textContent = textBeforeCursor.slice(textBeforeCursor.lastIndexOf('\n') + 1) || ' ';
      mirror.appendChild(span);
      
      document.body.appendChild(mirror);
      const spanRect = span.getBoundingClientRect();
      document.body.removeChild(mirror);
      
      const x = textareaRect.left + paddingLeft + spanRect.width;
      const y = textareaRect.top + paddingTop + (lineNum * lineHeight);
      
      return { x, y };
    } catch {
      return null;
    }
  }, [textareaRef]);

  const openMenu = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, value } = textarea;
    const textBeforeCursor = value.slice(0, selectionStart);
    const lastNewline = textBeforeCursor.lastIndexOf('\n');
    const currentLine = textBeforeCursor.slice(lastNewline + 1);

    const slashIndex = currentLine.lastIndexOf('/');
    if (slashIndex === -1) return;

    const query = currentLine.slice(slashIndex + 1);
    const position = getCaretPosition();
    if (!position) return;

    setState({
      isOpen: true,
      query,
      position,
      selectedIndex: 0,
      slashPosition: lastNewline + 1 + slashIndex,
    });
  }, [textareaRef, getCaretPosition]);

  const closeMenu = useCallback(() => {
    setState({
      isOpen: false,
      query: '',
      position: null,
      selectedIndex: 0,
      slashPosition: 0,
    });
  }, []);

  const updateQuery = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, value } = textarea;
    const textBeforeCursor = value.slice(0, selectionStart);
    const lastNewline = textBeforeCursor.lastIndexOf('\n');
    const currentLine = textBeforeCursor.slice(lastNewline + 1);

    const slashIndex = currentLine.lastIndexOf('/');
    if (slashIndex === -1) {
      closeMenu();
      return;
    }

    const query = currentLine.slice(slashIndex + 1);
    const position = getCaretPosition();

    setState((prev) => ({
      ...prev,
      query,
      position,
      selectedIndex: 0,
    }));
  }, [textareaRef, getCaretPosition, closeMenu]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!state.isOpen) {
        if (e.key === '/' && !e.shiftKey) {
          const textarea = textareaRef.current;
          if (textarea) {
            const { selectionStart, value } = textarea;
            const charBefore = value[selectionStart - 1];
            if (!charBefore || charBefore === '\n' || charBefore === ' ') {
              setTimeout(() => openMenu(), 0);
            }
          }
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setState((prev) => ({
            ...prev,
            selectedIndex: (prev.selectedIndex + 1) % filteredCommands.length,
          }));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setState((prev) => ({
            ...prev,
            selectedIndex:
              (prev.selectedIndex - 1 + filteredCommands.length) % filteredCommands.length,
          }));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[state.selectedIndex]) {
            const command = filteredCommands[state.selectedIndex];
            const textarea = textareaRef.current;
            if (textarea) {
              const { selectionStart, value } = textarea;
              const insertText = command.insert;
              const beforeSlash = value.slice(0, state.slashPosition);
              const afterCursor = value.slice(selectionStart);
              const newValue = beforeSlash + insertText + afterCursor;
              onInsert(newValue, beforeSlash.length + insertText.length);
            }
            closeMenu();
          }
          break;
        case 'Escape':
          e.preventDefault();
          closeMenu();
          break;
        case 'Backspace':
          if (state.query === '') {
            closeMenu();
          } else {
            updateQuery();
          }
          break;
        default:
          break;
      }
    },
    [state, filteredCommands, textareaRef, onInsert, closeMenu, openMenu, updateQuery]
  );

  const handleInput = useCallback(() => {
    if (state.isOpen) {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { selectionStart, value } = textarea;
      const textBeforeCursor = value.slice(0, selectionStart);
      const lastNewline = textBeforeCursor.lastIndexOf('\n');
      const currentLine = textBeforeCursor.slice(lastNewline + 1);

      if (!currentLine.includes('/')) {
        closeMenu();
        return;
      }

      const slashIndex = currentLine.lastIndexOf('/');
      if (slashIndex === 0 || currentLine[slashIndex - 1] === ' ') {
        updateQuery();
      } else {
        updateQuery();
      }
    }
  }, [state.isOpen, textareaRef, closeMenu, updateQuery]);

  return {
    isOpen: state.isOpen,
    query: state.query,
    position: state.position,
    selectedIndex: state.selectedIndex,
    filteredCommands,
    handleKeyDown,
    handleInput,
    closeMenu,
  };
}
