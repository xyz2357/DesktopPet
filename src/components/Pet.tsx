import React, { useState, useRef, useEffect } from 'react';
import ContextMenu from './ContextMenu';
import { PetConfig } from '../config/appConfig';
import { PetTexts } from '../config/petTexts';
import { mediaManager, PetState, MediaFile } from '../utils/mediaManager';
import { AutonomousBehaviorManager, BehaviorEvent } from '../utils/autonomousBehavior';
import { mouseTracker, MouseTrackingData } from '../utils/mouseTracker';
import { interactionManager, InteractionEvent, TimeBasedEmotion } from '../utils/interactionManager';
import { itemManager } from '../utils/itemManager';
import { dragDropManager, DropZone } from '../utils/dragDropManager';
import { ItemData, PetReaction } from '../types/item';
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
  isCongrats: boolean;
  onHoverChange: (isHovered: boolean) => void;
  onContextMenuChange: (isVisible: boolean) => void;
}

const Pet: React.FC<PetProps> = ({ onClick, isActive, isLoading, isCongrats, onHoverChange, onContextMenuChange }) => {
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

  // 自主行为状态
  const [autonomousState, setAutonomousState] = useState<PetState>('idle');
  const [isFollowingMouse, setIsFollowingMouse] = useState(false);
  const [eyeDirection, setEyeDirection] = useState<{x: number, y: number}>({ x: 0, y: 0 });
  const behaviorManagerRef = useRef<AutonomousBehaviorManager | null>(null);
  const walkingAnimationRef = useRef<number | null>(null);
  const lastUserInteractionRef = useRef<number>(Date.now());

  // 交互管理状态
  const [specialMessage, setSpecialMessage] = useState<string>('');
  const [timeBasedEmotion, setTimeBasedEmotion] = useState<TimeBasedEmotion | null>(null);
  const specialMessageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emotionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 道具系统状态
  const [itemReaction, setItemReaction] = useState<PetReaction | null>(null);
  const [currentItemState, setCurrentItemState] = useState<PetState | null>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const itemReactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const itemStateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const petElementRef = useRef<HTMLDivElement | null>(null);
  
  const getPetState = (): PetState => {
    // 优先级：道具反应状态 > 用户交互状态 > 自主行为状态
    if (currentItemState) return currentItemState;
    if (isCongrats) return 'congrats';
    if (isLoading) return 'loading';
    if (isActive) return 'active';
    if (isDragging) return 'idle'; // 拖拽时保持idle状态
    if (isHovered && !isAutonomousState(autonomousState)) return 'hover';
    
    // 如果没有用户交互，使用自主行为状态
    return autonomousState;
  };

  // 判断是否为自主行为状态
  const isAutonomousState = (state: PetState): boolean => {
    return ['walking', 'sleeping', 'observing', 'yawning', 'stretching'].includes(state);
  };

  // 判断是否为道具相关状态
  const isItemState = (state: PetState): boolean => {
    return ['eating', 'drinking', 'playing', 'playful', 'hunting', 'relaxed', 'examining', 'admiring', 'royal', 'magical', 'euphoric'].includes(state);
  };

  // 媒体管理器初始化和初始媒体文件加载
  useEffect(() => {
    const initializeMedia = async () => {
      await mediaManager.initialize();
      
      // 为所有状态预先获取媒体文件，包括新的自主行为状态和道具状态
      const states: PetState[] = [
        'idle', 'hover', 'active', 'loading', 'congrats', 
        'walking', 'sleeping', 'observing', 'yawning', 'stretching',
        'eating', 'drinking', 'playing', 'playful', 'hunting', 'relaxed', 
        'examining', 'admiring', 'royal', 'magical', 'euphoric'
      ];
      const initialMedia: {[key: string]: MediaFile | null} = {};
      
      states.forEach(state => {
        const mediaFile = mediaManager.getRandomMediaForState(state);
        initialMedia[state] = mediaFile;
      });
      
      setCurrentMedia(initialMedia);
    };
    
    initializeMedia().catch(console.error);
  }, []);

  // 自主行为管理器初始化
  useEffect(() => {
    const behaviorManager = new AutonomousBehaviorManager();
    behaviorManagerRef.current = behaviorManager;

    // 监听行为事件
    const handleBehaviorEvent = (event: BehaviorEvent) => {
      console.log('🎭 收到行为事件:', event);
      
      if (event.type === 'stateChange' && event.state) {
        setAutonomousState(event.state);
        
        // 如果开始新的媒体状态，获取对应的媒体文件
        if (PetConfig.media.randomSelection.changeOnStateSwitch) {
          const mediaFile = mediaManager.getRandomMediaForState(event.state);
          if (mediaFile) {
            setCurrentMedia(prev => ({ ...prev, [event.state as string]: mediaFile }));
          }
        }
      }
      
      if (event.type === 'positionUpdate' && event.position) {
        setPosition(event.position);
      }
    };

    behaviorManager.addEventListener(handleBehaviorEvent);

    // 开始行走动画循环
    const walkingLoop = () => {
      if (behaviorManager.getIsWalking()) {
        const newPosition = behaviorManager.updateWalkingPosition({
          position,
          windowSize: { width: window.innerWidth, height: window.innerHeight },
          petSize: mediaDimensions,
          lastInteractionTime: lastUserInteractionRef.current,
          hasUserInteraction: isHovered || isActive || isDragging,
          mousePosition: mouseTracker.getCurrentMousePosition()
        });

        if (newPosition) {
          setPosition(newPosition);
        }
      }

      walkingAnimationRef.current = requestAnimationFrame(walkingLoop);
    };

    walkingAnimationRef.current = requestAnimationFrame(walkingLoop);

    return () => {
      behaviorManager.removeEventListener(handleBehaviorEvent);
      behaviorManager.destroy();
      if (walkingAnimationRef.current) {
        cancelAnimationFrame(walkingAnimationRef.current);
      }
    };
  }, []);

  // 鼠标跟踪初始化
  useEffect(() => {
    const handleMouseTracking = (data: MouseTrackingData) => {
      setIsFollowingMouse(data.isInTrackingRange);
      setEyeDirection(data.lookDirection);
    };

    mouseTracker.addListener(handleMouseTracking);
    mouseTracker.startTracking(position, mediaDimensions);

    return () => {
      mouseTracker.removeListener(handleMouseTracking);
      mouseTracker.stopTracking();
    };
  }, []);

  // 更新鼠标跟踪的桌宠位置和尺寸
  useEffect(() => {
    mouseTracker.updatePetData(position, mediaDimensions);
  }, [position, mediaDimensions]);

  // 交互管理器初始化
  useEffect(() => {
    // 监听时间感知情绪
    const handleTimeBasedEmotion = (emotion: TimeBasedEmotion) => {
      console.log('😊 收到时间感知情绪:', emotion);
      setTimeBasedEmotion(emotion);
      
      // 清除之前的超时
      if (emotionTimeoutRef.current) {
        clearTimeout(emotionTimeoutRef.current);
      }
      
      // 设置情绪显示时间
      emotionTimeoutRef.current = setTimeout(() => {
        setTimeBasedEmotion(null);
      }, emotion.duration);
    };

    interactionManager.addEmotionListener(handleTimeBasedEmotion);

    return () => {
      interactionManager.removeEmotionListener(handleTimeBasedEmotion);
      if (specialMessageTimeoutRef.current) {
        clearTimeout(specialMessageTimeoutRef.current);
      }
      if (emotionTimeoutRef.current) {
        clearTimeout(emotionTimeoutRef.current);
      }
    };
  }, []);

  // 道具系统初始化
  useEffect(() => {
    // 道具反应监听器
    const handleItemReaction = (reaction: PetReaction) => {
      console.log('🎁 收到道具反应:', reaction);
      
      setItemReaction(reaction);
      
      // 清除之前的道具反应超时
      if (itemReactionTimeoutRef.current) {
        clearTimeout(itemReactionTimeoutRef.current);
      }
      
      // 处理状态变化
      if (reaction.animation) {
        setCurrentItemState(reaction.animation as PetState);
        
        // 清除之前的状态超时
        if (itemStateTimeoutRef.current) {
          clearTimeout(itemStateTimeoutRef.current);
        }
        
        // 设置状态持续时间
        const duration = reaction.duration || 5000;
        itemStateTimeoutRef.current = setTimeout(() => {
          setCurrentItemState(null);
        }, duration);
      }
      
      // 设置反应显示时间
      const reactionDuration = reaction.duration || 3000;
      itemReactionTimeoutRef.current = setTimeout(() => {
        setItemReaction(null);
      }, reactionDuration);
    };

    // 拖拽放置监听器
    const handleItemDrop = async (item: ItemData, dropZone: DropZone, position: { x: number; y: number }) => {
      if (dropZone.id === 'pet') {
        console.log('🎁 道具放置到桌宠:', item.name);
        handleUserInteraction();
        
        // 使用道具
        const reaction = await itemManager.useItem(item.id, position);
        if (reaction) {
          handleItemReaction(reaction);
        }
      }
    };

    itemManager.addReactionListener(handleItemReaction);
    dragDropManager.addDropListener(handleItemDrop);

    return () => {
      itemManager.removeReactionListener(handleItemReaction);
      dragDropManager.removeDropListener(handleItemDrop);
      if (itemReactionTimeoutRef.current) {
        clearTimeout(itemReactionTimeoutRef.current);
      }
      if (itemStateTimeoutRef.current) {
        clearTimeout(itemStateTimeoutRef.current);
      }
    };
  }, []);

  // 注册桌宠为放置区域
  useEffect(() => {
    if (petElementRef.current) {
      dragDropManager.registerDropZone('pet', petElementRef.current);
      
      return () => {
        dragDropManager.unregisterDropZone('pet');
      };
    }
  }, [position, mediaDimensions]);

  // 更新桌宠放置区域位置
  useEffect(() => {
    if (petElementRef.current) {
      dragDropManager.updateDropZone('pet', petElementRef.current);
    }
  }, [position, mediaDimensions]);

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
  }, [isLoading, isActive, isHovered, isCongrats, autonomousState, currentItemState]); // 添加道具状态到依赖数组

  const getCurrentMedia = () => {
    const state = getPetState() as PetState;
    return currentMedia[state];
  };

  const getPetEmoji = () => {
    const state = getPetState();
    
    // 拖动时始终显示特定emoji，不管其他状态
    if (isDragging) {
      return '😵';
    }
    
    switch (state) {
      case 'congrats':
        return '🎉';
      case 'loading':
        return '🤔';
      case 'active':
        return '😊';
      case 'hover':
        return '😸';
      case 'walking':
        return '🚶';
      case 'sleeping':
        return '😴';
      case 'observing':
        return '👀';
      case 'yawning':
        return '🥱';
      case 'stretching':
        return '🤸';
      // 道具状态
      case 'eating':
        return '😋';
      case 'drinking':
        return '😌';
      case 'playing':
        return '😆';
      case 'playful':
        return '😸';
      case 'hunting':
        return '😼';
      case 'relaxed':
        return '😌';
      case 'examining':
        return '🤓';
      case 'admiring':
        return '😍';
      case 'royal':
        return '👑';
      case 'magical':
        return '✨';
      case 'euphoric':
        return '🌈';
      default:
        return isFollowingMouse ? '🧐' : '😊';
    }
  };

  // 处理用户交互，通知行为管理器
  const handleUserInteraction = () => {
    lastUserInteractionRef.current = Date.now();
    if (behaviorManagerRef.current) {
      behaviorManagerRef.current.onUserInteraction();
    }
  };

  // 处理点击交互和彩蛋
  const handlePetClick = () => {
    handleUserInteraction();
    
    // 处理交互管理器的点击事件
    const interactionEvent = interactionManager.handleClick();
    console.log('🎯 点击事件:', interactionEvent);
    
    // 处理彩蛋事件
    if (interactionEvent.data?.easterEgg) {
      setSpecialMessage(interactionEvent.data.message);
      
      // 清除之前的超时
      if (specialMessageTimeoutRef.current) {
        clearTimeout(specialMessageTimeoutRef.current);
      }
      
      // 3秒后清除特殊消息
      specialMessageTimeoutRef.current = setTimeout(() => {
        setSpecialMessage('');
      }, 3000);
      
      // 触发特殊动画或效果
      if (interactionEvent.type === 'rapidClick') {
        console.log('🔥 触发快速点击彩蛋！');
      }
    }
    
    // 调用原有的点击处理
    onClick();
  };

  const handleMediaError = (state: string) => {
    console.warn(`${PetTexts.errors.mediaLoadFailed}: ${state}`);
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
      console.warn(`${PetTexts.errors.pixelReadFailed}:`, error);
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
      console.error(`${PetTexts.errors.quitFailed}:`, error);
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
      handleUserInteraction(); // 通知用户交互
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
          handlePetClick();
        }
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  return (
    <>
      <div
        ref={petElementRef}
        className={`pet pet--${getPetState()} ${isDragging ? 'pet--dragging' : ''} ${isDraggedOver ? 'pet--dragover' : ''}`}
        style={{
          left: position.x,
          top: position.y,
          width: mediaDimensions.width,
          height: mediaDimensions.height,
          // 气泡样式 CSS 变量
          '--bubble-font-size': `${PetConfig.bubble.fontSize}px`,
          '--bubble-padding': `${PetConfig.bubble.padding[0]}px ${PetConfig.bubble.padding[1]}px`,
          '--bubble-border-radius': `${PetConfig.bubble.borderRadius}px`,
          '--bubble-top-offset': `-${PetConfig.bubble.topOffset}px`,
          '--bubble-background': `rgba(255, 255, 255, ${PetConfig.bubble.backgroundOpacity})`,
          '--bubble-border': `1px solid rgba(0, 0, 0, ${PetConfig.bubble.borderOpacity})`,
          '--bubble-shadow': `0 4px ${PetConfig.bubble.shadowBlur}px rgba(0, 0, 0, ${PetConfig.bubble.shadowOpacity})`
        } as React.CSSProperties}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => {
          setIsHovered(true);
          onHoverChange(true);
          handleUserInteraction(); // 通知用户交互
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          onHoverChange(false);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggedOver(true);
        }}
        onDragLeave={() => {
          setIsDraggedOver(false);
        }}
        onDrop={(e) => {
          setIsDraggedOver(false);
          dragDropManager.handleDrop(e.nativeEvent);
        }}
        title={PetTexts.interactions.tooltip}
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
          {/* 优先级：道具反应 > 特殊消息 > 时间感知情绪 > 常规状态 */}
          {itemReaction?.message && <span style={{color: '#ff9800', fontWeight: 'bold'}}>{itemReaction.message}</span>}
          {!itemReaction?.message && specialMessage && <span style={{color: '#ff6b35', fontWeight: 'bold'}}>{specialMessage}</span>}
          {!itemReaction?.message && !specialMessage && timeBasedEmotion && <span style={{color: '#4a90e2', fontStyle: 'italic'}}>{timeBasedEmotion.text}</span>}
          {isDraggedOver && !itemReaction?.message && !specialMessage && !timeBasedEmotion && <span style={{color: '#4a90e2', fontWeight: 'bold'}}>ここに放して！</span>}
          {!itemReaction?.message && !specialMessage && !timeBasedEmotion && !isDraggedOver && isCongrats && <span>{PetTexts.bubbleTexts.congrats}</span>}
          {!itemReaction?.message && !specialMessage && !timeBasedEmotion && !isDraggedOver && isLoading && !isCongrats && <span>{PetTexts.bubbleTexts.thinking}</span>}
          {!itemReaction?.message && !specialMessage && !timeBasedEmotion && !isDraggedOver && isActive && !isCongrats && <span>{PetTexts.bubbleTexts.ready}</span>}
          {!itemReaction?.message && !specialMessage && !timeBasedEmotion && !isDraggedOver && isDragging && !isCongrats && <span>{PetTexts.bubbleTexts.dragging}</span>}
          {!itemReaction?.message && !specialMessage && !timeBasedEmotion && !isDraggedOver && isFollowingMouse && !isDragging && !isActive && !isLoading && !isCongrats && <span>{PetTexts.bubbleTexts.followingMouse}</span>}
          {!itemReaction?.message && !specialMessage && !timeBasedEmotion && !isDraggedOver && autonomousState === 'walking' && !isHovered && !isActive && !isLoading && !isDragging && !isCongrats && <span>{PetTexts.bubbleTexts.walking}</span>}
          {!itemReaction?.message && !specialMessage && !timeBasedEmotion && !isDraggedOver && autonomousState === 'sleeping' && !isHovered && !isActive && !isLoading && !isDragging && !isCongrats && <span>{PetTexts.bubbleTexts.sleeping}</span>}
          {!itemReaction?.message && !specialMessage && !timeBasedEmotion && !isDraggedOver && autonomousState === 'observing' && !isHovered && !isActive && !isLoading && !isDragging && !isCongrats && <span>{PetTexts.bubbleTexts.observing}</span>}
          {!itemReaction?.message && !specialMessage && !timeBasedEmotion && !isDraggedOver && autonomousState === 'yawning' && !isHovered && !isActive && !isLoading && !isDragging && !isCongrats && <span>{PetTexts.bubbleTexts.yawning}</span>}
          {!itemReaction?.message && !specialMessage && !timeBasedEmotion && !isDraggedOver && autonomousState === 'stretching' && !isHovered && !isActive && !isLoading && !isDragging && !isCongrats && <span>{PetTexts.bubbleTexts.stretching}</span>}
          {!itemReaction?.message && !specialMessage && !timeBasedEmotion && !isDraggedOver && isHovered && !isActive && !isLoading && !isDragging && !isCongrats && !isAutonomousState(autonomousState) && <span>{PetTexts.bubbleTexts.hover}</span>}
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