import React, { useState, useRef, useEffect } from 'react';
import ContextMenu from './ContextMenu';
import { PetConfig } from '../config/appConfig';
import { mediaManager, PetState, MediaFile } from '../utils/mediaManager';
import './Pet.css';

// Import placeholder images
import petIdleEmpty from '../assets/images/pet-idle.png';
import petHoverEmpty from '../assets/images/pet-hover.png';
import petActiveEmpty from '../assets/images/pet-active.png';
import petLoadingEmpty from '../assets/images/pet-loading.png';

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
  const [position, setPosition] = useState(PetConfig.defaultPosition);
  const dragStartRef = useRef<{ x: number; y: number; mouseX: number; mouseY: number } | null>(null);
  const hasDraggedRef = useRef(false);
  
  // 媒体加载状态
  const [mediaLoadError, setMediaLoadError] = useState<{[key: string]: boolean}>({});
  const [currentMedia, setCurrentMedia] = useState<{[key: string]: MediaFile | null}>({});
  
  // 媒体尺寸状态
  const [mediaDimensions, setMediaDimensions] = useState<{width: number, height: number}>(PetConfig.size.default);
  
  // Canvas引用用于像素检测
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);
  
  const getPetState = () => {
    if (isLoading) return 'loading';
    if (isActive) return 'active';
    if (isHovered) return 'hover';
    return 'idle';
  };

  // 媒体管理器初始化和初始媒体文件加载
  useEffect(() => {
    const initializeMedia = async () => {
      await mediaManager.initialize();
      
      // 为所有状态预先获取媒体文件
      const states: PetState[] = ['idle', 'hover', 'active', 'loading'];
      const initialMedia: {[key: string]: MediaFile | null} = {};
      
      states.forEach(state => {
        const mediaFile = mediaManager.getRandomMediaForState(state);
        initialMedia[state] = mediaFile;
      });
      
      setCurrentMedia(initialMedia);
    };
    
    initializeMedia().catch(console.error);
  }, []);

  // 当状态改变时更新媒体文件（如果需要的话）
  useEffect(() => {
    const state = getPetState() as PetState;
    
    // 如果设置了状态切换时重新选择媒体文件
    if (PetConfig.media.randomSelection.changeOnStateSwitch) {
      const mediaFile = mediaManager.getRandomMediaForState(state);
      if (mediaFile) {
        setCurrentMedia(prev => ({ ...prev, [state]: mediaFile }));
      }
    }
  }, [isLoading, isActive, isHovered]);

  const getCurrentMedia = () => {
    const state = getPetState() as PetState;
    return currentMedia[state];
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

  const handleMediaError = (state: string) => {
    console.warn(`媒体文件加载失败，状态: ${state}`);
    setMediaLoadError(prev => ({ ...prev, [state]: true }));
  };

  // 计算基于最大尺寸的实际尺寸
  const calculateDimensions = (naturalWidth: number, naturalHeight: number) => {
    const { maxWidth, maxHeight, minWidth, minHeight } = PetConfig.size;
    
    let width = naturalWidth;
    let height = naturalHeight;
    
    // 如果超过最大尺寸，按比例缩小
    if (width > maxWidth || height > maxHeight) {
      const widthRatio = maxWidth / width;
      const heightRatio = maxHeight / height;
      const ratio = Math.min(widthRatio, heightRatio);
      
      width = width * ratio;
      height = height * ratio;
    }
    
    // 如果小于最小尺寸，按比例放大
    if (width < minWidth || height < minHeight) {
      const widthRatio = minWidth / width;
      const heightRatio = minHeight / height;
      const ratio = Math.max(widthRatio, heightRatio);
      
      width = width * ratio;
      height = height * ratio;
    }
    
    return { width: Math.round(width), height: Math.round(height) };
  };

  const handleMediaLoad = (e: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement>) => {
    const element = e.target as HTMLImageElement | HTMLVideoElement;
    let width: number, height: number;
    
    if (element instanceof HTMLVideoElement) {
      width = element.videoWidth || PetConfig.size.default.width;
      height = element.videoHeight || PetConfig.size.default.height;
    } else {
      width = element.naturalWidth || PetConfig.size.default.width;
      height = element.naturalHeight || PetConfig.size.default.height;
    }
    
    const dimensions = calculateDimensions(width, height);
    setMediaDimensions(dimensions);
    
    // 为图片创建canvas用于像素检测（视频暂不支持像素检测）
    if (element instanceof HTMLImageElement && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = element.naturalWidth;
        canvas.height = element.naturalHeight;
        ctx.drawImage(element, 0, 0);
      }
    }
  };

  // 检查点击位置是否在非透明像素上
  const isPixelOpaque = (x: number, y: number): boolean => {
    const canvas = canvasRef.current;
    const mediaElement = mediaRef.current;
    
    // 对于视频元素，默认允许所有交互
    if (mediaElement instanceof HTMLVideoElement) {
      return true;
    }
    
    if (!canvas || !mediaElement || !(mediaElement instanceof HTMLImageElement)) return true;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;
    
    // 将屏幕坐标转换为图片坐标
    const rect = mediaElement.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const imageX = Math.floor((x - rect.left) * scaleX);
    const imageY = Math.floor((y - rect.top) * scaleY);
    
    if (imageX < 0 || imageY < 0 || imageX >= canvas.width || imageY >= canvas.height) {
      return false;
    }
    
    try {
      const pixel = ctx.getImageData(imageX, imageY, 1, 1);
      const alpha = pixel.data[3];
      return alpha > PetConfig.interaction.alphaThreshold;
    } catch (error) {
      console.warn('无法读取像素数据:', error);
      return true; // 出错时默认允许交互
    }
  };

  const shouldUseEmoji = (state: string) => {
    return mediaLoadError[state] || !currentMedia[state];
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
      // 如果使用的是媒体文件且点击在透明区域，不处理
      if (!shouldUseEmoji(getPetState()) && !isPixelOpaque(e.clientX, e.clientY)) {
        return;
      }
      
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
          
          // 如果移动距离超过阈值，则认为是拖拽
          if (Math.abs(deltaX) > PetConfig.interaction.dragThreshold || Math.abs(deltaY) > PetConfig.interaction.dragThreshold) {
            if (!hasDraggedRef.current) {
              hasDraggedRef.current = true;
              setIsDragging(true);
            }
          }
          
          if (hasDraggedRef.current) {
            // 添加边界检查，防止桌宠移出屏幕
            const newX = dragStartRef.current.x + deltaX;
            const newY = dragStartRef.current.y + deltaY;
            const petWidth = mediaDimensions.width;
            const petHeight = mediaDimensions.height;
            
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
          top: position.y,
          width: mediaDimensions.width,
          height: mediaDimensions.height
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
        <div className="pet__avatar">
          {shouldUseEmoji(getPetState()) ? (
            <div 
              className="pet__emoji"
              style={{
                fontSize: Math.min(
                  mediaDimensions.width * PetConfig.interaction.emojiSizeRatio, 
                  mediaDimensions.height * PetConfig.interaction.emojiSizeRatio
                ),
                lineHeight: `${mediaDimensions.height}px`
              }}
            >
              {getPetEmoji()}
            </div>
          ) : (
            <>
              {(() => {
                const mediaFile = getCurrentMedia();
                if (!mediaFile) {
                  return (
                    <div className="pet__emoji" style={{
                      fontSize: Math.min(
                        mediaDimensions.width * PetConfig.interaction.emojiSizeRatio, 
                        mediaDimensions.height * PetConfig.interaction.emojiSizeRatio
                      ),
                      lineHeight: `${mediaDimensions.height}px`
                    }}>
                      {getPetEmoji()}
                    </div>
                  );
                }
                
                if (mediaManager.isVideoFile(mediaFile)) {
                  return (
                    <video
                      ref={mediaRef as React.RefObject<HTMLVideoElement>}
                      src={mediaFile.url}
                      className="pet__video"
                      muted={PetConfig.media.video.muted}
                      loop={PetConfig.media.video.loop}
                      autoPlay={PetConfig.media.video.autoplay}
                      controls={PetConfig.media.video.controls}
                      onError={() => handleMediaError(getPetState())}
                      onLoadedData={handleMediaLoad}
                    />
                  );
                } else {
                  return (
                    <img 
                      ref={mediaRef as React.RefObject<HTMLImageElement>}
                      src={mediaFile.url} 
                      alt={`Pet ${getPetState()}`}
                      className="pet__image"
                      onError={() => handleMediaError(getPetState())}
                      onLoad={handleMediaLoad}
                    />
                  );
                }
              })()}
              <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
              />
            </>
          )}
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