import React, { useEffect, useRef } from 'react';
import { PetTexts } from '../config/petTexts';
import './ContextMenu.css';

interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onQuit: () => void;
  onToggleDebugPanel: () => void;
  onToggleItemPanel: () => void;
  onToggleStatsPanel: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ visible, x, y, onClose, onQuit, onToggleDebugPanel, onToggleItemPanel, onToggleStatsPanel }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ left: x, top: y }}
    >
      <div className="context-menu__item" onClick={() => { onToggleDebugPanel(); onClose(); }}>
        <span className="context-menu__icon">🐛</span>
        <span className="context-menu__text">调试面板</span>
      </div>
      <div className="context-menu__item" onClick={() => { onToggleItemPanel(); onClose(); }}>
        <span className="context-menu__icon">🎁</span>
        <span className="context-menu__text">道具栏</span>
      </div>
      <div className="context-menu__item" onClick={() => { onToggleStatsPanel(); onClose(); }}>
        <span className="context-menu__icon">📊</span>
        <span className="context-menu__text">状态面板</span>
      </div>
      <div className="context-menu__separator"></div>
      <div className="context-menu__item" onClick={onQuit}>
        <span className="context-menu__icon">🚪</span>
        <span className="context-menu__text">{PetTexts.contextMenu.quit}</span>
      </div>
    </div>
  );
};

export default ContextMenu;