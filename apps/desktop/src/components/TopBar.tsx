import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNotesStore } from '../store/notesStore';
import { Icons } from '@notes-app/ui';
import { Window } from '@tauri-apps/api/window';

interface MenuItem {
  label: string;
  shortcut?: string;
  action?: () => void;
  divider?: boolean;
  disabled?: boolean;
}

interface Menu {
  label: string;
  items: MenuItem[];
}

interface TopBarProps {
  onOpenCommandPalette: () => void;
  onToggleTheme: () => void;
  resolvedTheme: 'light' | 'dark';
  onNavigateSettings: () => void;
  onToggleSidebar: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
  onGoHome: () => void;
  onCreateNote: () => void;
  onSave?: () => void;
}

export function TopBar({
  onOpenCommandPalette,
  onToggleTheme,
  resolvedTheme,
  onNavigateSettings,
  onToggleSidebar,
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
  onGoHome,
  onCreateNote,
  onSave,
}: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { notes } = useNotesStore();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMaximized = async () => {
      try {
        const win = Window.getCurrent();
        setIsMaximized(await win.isMaximized());
      } catch {
        setIsMaximized(false);
      }
    };
    checkMaximized();

    const unlisten = Window.getCurrent().onResized(async () => {
      try {
        const win = Window.getCurrent();
        setIsMaximized(await win.isMaximized());
      } catch {
        setIsMaximized(false);
      }
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (menuLabel: string) => {
    setActiveMenu(activeMenu === menuLabel ? null : menuLabel);
  };

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.action && !item.disabled) {
      item.action();
    }
    setActiveMenu(null);
  };

  const handleMinimize = async () => {
    try {
      const win = Window.getCurrent();
      await win.minimize();
    } catch (e) {
      console.error('Failed to minimize:', e);
    }
  };

  const handleMaximize = async () => {
    try {
      const win = Window.getCurrent();
      const maximized = await win.isMaximized();
      if (maximized) {
        await win.unmaximize();
      } else {
        await win.maximize();
      }
      setIsMaximized(!maximized);
    } catch (e) {
      console.error('Failed to toggle maximize:', e);
    }
  };

  const handleClose = async () => {
    try {
      const win = Window.getCurrent();
      await win.close();
    } catch (e) {
      console.error('Failed to close:', e);
    }
  };

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Notes';
    if (location.pathname === '/settings') return 'Settings';
    if (location.pathname.startsWith('/note/')) {
      const noteId = location.pathname.split('/note/')[1];
      const note = notes.find((n) => n.id === noteId);
      return note?.title || 'Untitled';
    }
    return 'Notes';
  };

  const menus: Menu[] = [
    {
      label: 'File',
      items: [
        { label: 'New Note', shortcut: '⌘N', action: onCreateNote },
        { label: 'New Window', shortcut: '⇧⌘N', action: () => {}, disabled: true },
        { divider: true, label: '' },
        { label: 'Save', shortcut: '⌘S', action: () => { onSave?.(); onOpenCommandPalette(); }, disabled: !onSave },
        { divider: true, label: '' },
        { label: 'Exit', shortcut: 'Alt+F4', action: handleClose },
      ],
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: '⌘Z', action: () => document.execCommand('undo') },
        { label: 'Redo', shortcut: '⇧⌘Z', action: () => document.execCommand('redo') },
        { divider: true, label: '' },
        { label: 'Cut', shortcut: '⌘X', action: () => document.execCommand('cut') },
        { label: 'Copy', shortcut: '⌘C', action: () => document.execCommand('copy') },
        { label: 'Paste', shortcut: '⌘V', action: () => document.execCommand('paste') },
        { divider: true, label: '' },
        { label: 'Select All', shortcut: '⌘A', action: () => document.execCommand('selectAll') },
      ],
    },
    {
      label: 'Selection',
      items: [
        { label: 'Select All', shortcut: '⌘A', action: () => document.execCommand('selectAll') },
        { divider: true, label: '' },
        { label: 'Find', shortcut: '⌘F', action: onOpenCommandPalette },
      ],
    },
    {
      label: 'View',
      items: [
        { label: 'Toggle Sidebar', shortcut: '⌘B', action: onToggleSidebar },
        { label: 'Toggle Fullscreen', shortcut: 'F11', action: () => {} },
        { divider: true, label: '' },
        { label: 'Zoom In', shortcut: '⌘+', action: () => {} },
        { label: 'Zoom Out', shortcut: '⌘-', action: () => {} },
        { label: 'Reset Zoom', shortcut: '⌘0', action: () => {} },
      ],
    },
    {
      label: 'Go',
      items: [
        { label: 'Go to Home', shortcut: '⌘⇧H', action: onGoHome },
        { label: 'Go Back', shortcut: '⌘[', action: onGoBack, disabled: !canGoBack },
        { label: 'Go Forward', shortcut: '⌘]', action: onGoForward, disabled: !canGoForward },
        { divider: true, label: '' },
        { label: 'Go to Settings', shortcut: '⌘,', action: onNavigateSettings },
      ],
    },
    {
      label: 'Run',
      items: [
        { label: 'Save & Run', shortcut: '⇧⌘R', action: () => {}, disabled: true },
        { label: 'Stop', shortcut: '⌘.', action: () => {}, disabled: true },
      ],
    },
    {
      label: 'Terminal',
      items: [
        { label: 'New Terminal', shortcut: '⌘`', action: () => {}, disabled: true },
        { label: 'Toggle Terminal', shortcut: '⌘J', action: () => {}, disabled: true },
      ],
    },
    {
      label: 'Help',
      items: [
        { label: 'About Notes App', action: () => navigate('/settings') },
        { label: 'Documentation', action: () => {} },
        { divider: true, label: '' },
        { label: 'Keyboard Shortcuts', shortcut: '⌘K ⌘S', action: onOpenCommandPalette },
      ],
    },
  ];

  return (
    <header className="topbar" ref={menuRef} data-tauri-drag-region>
      <div className="topbar-drag-region">
        <div className="topbar-menu-bar">
          <div className="topbar-logo" onClick={onGoHome} title="Notes App">
            <Icons.FileText style={{ width: 16, height: 16 }} />
          </div>

          {menus.map((menu) => (
            <div key={menu.label} className="topbar-menu-item-wrapper">
              <button
                className={`topbar-menu-button ${activeMenu === menu.label ? 'active' : ''}`}
                onClick={() => handleMenuClick(menu.label)}
                onMouseEnter={() => activeMenu && setActiveMenu(menu.label)}
              >
                {menu.label}
              </button>
              {activeMenu === menu.label && (
                <div className="topbar-dropdown">
                  {menu.items.map((item, idx) =>
                    item.divider ? (
                      <div key={idx} className="topbar-dropdown-divider" />
                    ) : (
                      <button
                        key={item.label}
                        className={`topbar-dropdown-item ${item.disabled ? 'disabled' : ''}`}
                        onClick={() => handleMenuItemClick(item)}
                        disabled={item.disabled}
                      >
                        <span className="topbar-dropdown-item-label">{item.label}</span>
                        {item.shortcut && (
                          <span className="topbar-dropdown-item-shortcut">{item.shortcut}</span>
                        )}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="topbar-center">
          <button className="topbar-title" onClick={onOpenCommandPalette}>
            {getPageTitle()}
          </button>
        </div>
      </div>

      <div className="topbar-right">
        <button
          className="topbar-icon-btn"
          onClick={onOpenCommandPalette}
          title="Search (⌘K)"
        >
          <Icons.Search style={{ width: 14, height: 14 }} />
        </button>
        <button
          className="topbar-icon-btn"
          onClick={onToggleTheme}
          title={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
        >
          {resolvedTheme === 'light' ? <Icons.Moon style={{ width: 14, height: 14 }} /> : <Icons.Sun style={{ width: 14, height: 14 }} />}
        </button>
        <button
          className="topbar-icon-btn"
          onClick={onNavigateSettings}
          title="Settings (⌘,)"
        >
          <Icons.Settings style={{ width: 14, height: 14 }} />
        </button>

        <div className="topbar-window-controls">
          <button
            className="topbar-window-btn minimize"
            onClick={handleMinimize}
            title="Minimize"
          >
            <svg width="10" height="1" viewBox="0 0 10 1">
              <rect width="10" height="1" fill="currentColor" />
            </svg>
          </button>
          <button
            className="topbar-window-btn maximize"
            onClick={handleMaximize}
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path fill="none" stroke="currentColor" strokeWidth="1" d="M2,3 L2,9 L8,9 L8,3 L2,3 M4,3 L4,1 L9,1 L9,6 L8,6" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <rect width="8" height="8" x="1" y="1" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            )}
          </button>
          <button
            className="topbar-window-btn close"
            onClick={handleClose}
            title="Close"
          >
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path stroke="currentColor" strokeWidth="1.2" d="M1,1 L9,9 M9,1 L1,9" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
