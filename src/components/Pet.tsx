import React, { useState, useRef } from 'react';
import ContextMenu from './ContextMenu';
import './Pet.css';

interface PetProps {
  onClick: () => void;
  isActive: boolean;
  isLoading: boolean;
  onHoverChange: (isHovered: boolean) => void;
  onContextMenuChange: (isVisible: boolean) => void;
}

const Pet: React.FC<PetProps> = ({ onClick, isActive, isLoading, onHoverChange, onContextMenuChange }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [contextMenu, setContextMenu] = useState<{visible: boolean; x: number; y: number}>({
    visible: false,
    x: 0,
    y: 0
  });
  
  // 拖拽相关状态
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 60 });
  const dragStartRef = useRef<{ x: number; y: number; mouseX: number; mouseY: number } | null>(null);
  const hasDraggedRef = useRef(false);

  const getPetState = () => {
    if (isLoading) return 'loading';
    if (isActive) return 'active';
    if (isHovered) return 'hover';
    return 'idle';
  };

  const getPetEmoji = () => {
    switch (getPetState()) {
      case 'loading':
        return '🤔';
      case 'active':
        return '😊';
      case 'hover':
        return '😸';
      default:
        return '😴';
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY
    });
    onContextMenuChange(true);
  };

  const handleCloseContextMenu = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
    onContextMenuChange(false);
  };

  const handleQuit = async () => {
    try {
      await window.electronAPI.quitApp();
    } catch (error) {
      console.error('Failed to quit app:', error);
    }
    handleCloseContextMenu();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // 左键
      e.preventDefault();
      hasDraggedRef.current = false;
      dragStartRef.current = {
        x: position.x,
        y: position.y,
        mouseX: e.clientX,
        mouseY: e.clientY
      };
      
      const handleMouseMove = (e: MouseEvent) => {
        if (dragStartRef.current) {
          const deltaX = e.clientX - dragStartRef.current.mouseX;
          const deltaY = e.clientY - dragStartRef.current.mouseY;
          
          // 如果移动距离超过5px，则认为是拖拽
          if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
            if (!hasDraggedRef.current) {
              hasDraggedRef.current = true;
              setIsDragging(true);
            }
          }
          
          if (hasDraggedRef.current) {
            // 添加边界检查，防止桌宠移出屏幕
            const newX = dragStartRef.current.x + deltaX;
            const newY = dragStartRef.current.y + deltaY;
            const petWidth = 120;
            const petHeight = 120;
            
            // 简单的边界检查（这里使用一个大致的屏幕尺寸）
            const maxX = window.innerWidth - petWidth;
            const maxY = window.innerHeight - petHeight;
            
            setPosition({
              x: Math.max(0, Math.min(newX, maxX)),
              y: Math.max(0, Math.min(newY, maxY))
            });
          }
        }
      };
      
      const handleMouseUp = () => {
        const wasDragging = hasDraggedRef.current;
        
        setIsDragging(false);
        dragStartRef.current = null;
        hasDraggedRef.current = false;
        
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        // 如果没有拖拽，则触发点击事件
        if (!wasDragging) {
          onClick();
        }
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  return (
    <>
      <div
        className={`pet pet--${getPetState()} ${isDragging ? 'pet--dragging' : ''}`}
        style={{
          left: position.x,
          top: position.y
        }}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => {
          setIsHovered(true);
          onHoverChange(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          onHoverChange(false);
        }}
        title="拖拽移动，点击学习，右键菜单"
      >
        <div className="pet__emoji">
          {getPetEmoji()}
        </div>
        <div className="pet__bubble">
          {isLoading && <span>思考中...</span>}
          {isActive && <span>来学习吧！</span>}
          {isDragging && <span>拖拽中...</span>}
          {isHovered && !isActive && !isLoading && !isDragging && <span>拖拽/点击/右键</span>}
        </div>
      </div>
      
      <ContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={handleCloseContextMenu}
        onQuit={handleQuit}
      />
    </>
  );
};

export default Pet;