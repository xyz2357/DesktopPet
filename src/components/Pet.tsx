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
import { customInteractionManager } from '../utils/customInteractionManager';
import { InteractionContext, InteractionResult } from '../types/customInteraction';
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
  
  // 自定义互动状态
  const [customInteractionMessage, setCustomInteractionMessage] = useState<string>('');
  const [customInteractionState, setCustomInteractionState] = useState<PetState | null>(null);
  const customMessageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const customStateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 道具系统状态
  const [itemReaction, setItemReaction] = useState<PetReaction | null>(null);
  
  // 调试：追踪itemReaction的变化
  useEffect(() => {
    console.log('🔍 [DEBUG] itemReaction 状态变化:', itemReaction?.message || '(null)');
  }, [itemReaction]);
  const [currentItemState, setCurrentItemState] = useState<PetState | null>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const itemReactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const itemStateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const petElementRef = useRef<HTMLDivElement | null>(null);
  
  const getPetState = (): PetState => {
    // 优先级：自定义互动状态 > 道具反应状态 > 用户交互状态 > 自主行为状态
    if (customInteractionState) return customInteractionState;
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
  const isItemRelatedState = (state: PetState): boolean => {
    return ['eating', 'drinking', 'playing', 'playful', 'hunting', 'relaxed', 
            'examining', 'admiring', 'royal', 'magical', 'euphoric'].includes(state);
  };

  // 判断气泡是否应该显示
  const shouldShowBubble = (): boolean => {
    // 优先级：道具反应 > 拖拽悬停 > 其他消息状态 > 常规交互状态
    if (itemReaction?.message) return true;
    if (isDraggedOver) return true;
    if (customInteractionMessage) return true;
    if (specialMessage) return true;
    if (timeBasedEmotion) return true;
    if (isCongrats || isLoading || isActive || isDragging) return true;
    if (isFollowingMouse) return true;
    if (isHovered && !isAutonomousState(autonomousState)) return true;
    
    // 自主行为状态和道具相关状态也显示气泡
    const currentState = getPetState();
    if (isAutonomousState(currentState) || isItemRelatedState(currentState)) return true;
    
    return false;
  };

  // 获取气泡的内联样式
  const getBubbleStyle = (): React.CSSProperties => {
    return {
      opacity: shouldShowBubble() ? 1 : 0,
      transition: 'opacity 0.3s ease'
    };
  };

  // 获取桌宠头像的动画样式
  const getPetAvatarStyle = (): React.CSSProperties => {
    const currentState = getPetState();
    const baseStyle: React.CSSProperties = {
      transition: 'transform 0.3s ease, filter 0.3s ease'
    };

    // 根据状态添加不同的动画
    switch (currentState) {
      case 'loading':
        return {
          ...baseStyle,
          animation: 'bounce 1s infinite'
        };
      case 'active':
        return {
          ...baseStyle,
          animation: 'pulse 2s infinite'
        };
      case 'congrats':
        return {
          ...baseStyle,
          animation: 'celebrate 0.6s ease-in-out'
        };
      case 'walking':
        return {
          ...baseStyle,
          animation: 'walk 2s infinite ease-in-out'
        };
      case 'sleeping':
        return {
          ...baseStyle,
          animation: 'sleep 4s infinite ease-in-out',
          opacity: 0.8
        };
      case 'observing':
        return {
          ...baseStyle,
          animation: 'observe 3s infinite ease-in-out'
        };
      case 'yawning':
        return {
          ...baseStyle,
          animation: 'yawn 2s ease-out'
        };
      case 'stretching':
        return {
          ...baseStyle,
          animation: 'stretch 3s ease-in-out'
        };
      case 'eating':
        return {
          ...baseStyle,
          animation: 'eating 2s ease-in-out'
        };
      case 'drinking':
        return {
          ...baseStyle,
          animation: 'drinking 1.5s ease-in-out'
        };
      case 'playing':
        return {
          ...baseStyle,
          animation: 'playing 2s infinite ease-in-out'
        };
      case 'playful':
        return {
          ...baseStyle,
          animation: 'playful 1s infinite ease-in-out'
        };
      case 'hunting':
        return {
          ...baseStyle,
          animation: 'hunting 1.5s ease-out'
        };
      case 'relaxed':
        return {
          ...baseStyle,
          animation: 'relaxed 4s infinite ease-in-out'
        };
      case 'examining':
        return {
          ...baseStyle,
          animation: 'examining 2s ease-in-out'
        };
      case 'admiring':
        return {
          ...baseStyle,
          animation: 'admiring 3s ease-in-out'
        };
      case 'royal':
        return {
          ...baseStyle,
          animation: 'royal 3s ease-in-out'
        };
      case 'magical':
        return {
          ...baseStyle,
          animation: 'magical 2s infinite ease-in-out'
        };
      case 'euphoric':
        return {
          ...baseStyle,
          animation: 'euphoric 1.5s infinite ease-in-out'
        };
      default:
        if (isDragging) {
          return {
            ...baseStyle,
            transform: 'rotate(15deg) scale(1.1)',
            transition: 'none'
          };
        }
        if (isHovered && !isDragging) {
          return {
            ...baseStyle,
            animation: 'hover-bounce 0.6s ease-out'
          };
        }
        if (isFollowingMouse) {
          return {
            ...baseStyle,
            transition: 'transform 0.3s ease-out'
          };
        }
        return {
          ...baseStyle,
          animation: 'idle-breathe 6s infinite ease-in-out'
        };
    }
  };

  // 获取桌宠容器的样式
  const getPetContainerStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      left: position.x,
      top: position.y,
      width: mediaDimensions.width,
      height: mediaDimensions.height,
      transition: isDragging ? 'none' : 'all 0.3s ease',
      zIndex: isDragging ? 9999 : 1001,
      cursor: isDragging ? 'grabbing' : 'pointer'
    };

    // 拖拽悬停效果
    if (isDraggedOver) {
      return {
        ...baseStyle,
        boxShadow: '0 0 20px rgba(74, 144, 226, 0.8)',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(74, 144, 226, 0.1) 0%, transparent 70%)'
      };
    }

    return baseStyle;
  };

  // 最近使用的道具跟踪
  const [lastUsedItem, setLastUsedItem] = useState<string | undefined>(undefined);
  const lastUsedItemTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 道具使用期间禁用自定义互动
  const [customInteractionsBlocked, setCustomInteractionsBlocked] = useState(false);
  const customInteractionsBlockTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 构建互动上下文
  const buildInteractionContext = (): InteractionContext => {
    const now = new Date();
    const currentState = getPetState();
    
    return {
      currentState,
      mousePosition: { x: 0, y: 0 }, // 会在实际使用时更新
      petPosition: position,
      time: {
        hour: now.getHours(),
        minute: now.getMinutes(),
        dayOfWeek: now.getDay(),
        timestamp: now.getTime()
      },
      timestamp: now.getTime(),
      lastInteraction: lastUserInteractionRef.current,
      attributes: customInteractionManager.getAllAttributes(),
      lastUsedItem: lastUsedItem
    };
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

  // 自定义互动管理器初始化
  useEffect(() => {
    const initCustomInteractions = async () => {
      await customInteractionManager.initialize();
      
      // 监听自定义互动结果
      const handleCustomInteractionResult = (result: InteractionResult) => {
        if (result.success && result.reaction) {
          const reaction = result.reaction;
          
          // 如果自定义互动被阻止，则不处理
          if (customInteractionsBlocked) {
            console.log('🚫 自定义互动被阻止，因为正在使用道具');
            return;
          }
          
          // 设置文本消息
          if (reaction.text) {
            console.log('🎭 自定义互动触发, text:', reaction.text, 'itemReaction存在:', !!itemReaction?.message);
            setCustomInteractionMessage(reaction.text);
            
            if (customMessageTimeoutRef.current) {
              clearTimeout(customMessageTimeoutRef.current);
            }
            
            customMessageTimeoutRef.current = setTimeout(() => {
              console.log('🎭 清除CustomInteractionMessage');
              setCustomInteractionMessage('');
            }, reaction.textDuration || 3000);
          }
          
          // 设置状态变化
          if (reaction.state) {
            setCustomInteractionState(reaction.state as PetState);
            
            if (customStateTimeoutRef.current) {
              clearTimeout(customStateTimeoutRef.current);
            }
            
            customStateTimeoutRef.current = setTimeout(() => {
              setCustomInteractionState(null);
            }, reaction.stateDuration || 5000);
          }
          
          // 获取新的媒体文件（如果状态改变）
          if (reaction.state) {
            const mediaFile = mediaManager.getRandomMediaForState(reaction.state as PetState);
            if (mediaFile) {
              setCurrentMedia(prev => ({ ...prev, [reaction.state as string]: mediaFile }));
            }
          }
          
          // 处理链式反应
          if (result.nextInteractions && result.nextInteractions.length > 0) {
            // 延迟执行链式互动
            setTimeout(() => {
              const context = buildInteractionContext();
              result.nextInteractions!.forEach(async (interactionId) => {
                await customInteractionManager.triggerInteraction('custom', context, interactionId);
              });
            }, 1000);
          }
        }
      };
      
      customInteractionManager.addListener(handleCustomInteractionResult);
    };
    
    initCustomInteractions().catch(console.error);
    
    return () => {
      if (customMessageTimeoutRef.current) {
        clearTimeout(customMessageTimeoutRef.current);
      }
      if (customStateTimeoutRef.current) {
        clearTimeout(customStateTimeoutRef.current);
      }
    };
  }, []);

  // 键盘事件监听器
  useEffect(() => {
    const handleKeyPress = async (event: KeyboardEvent) => {
      // 触发自定义互动 - 键盘事件
      try {
        const context = buildInteractionContext();
        await customInteractionManager.triggerInteraction('keyboard', {
          ...context,
          userInput: event.code
        });
      } catch (error) {
        console.warn('键盘自定义互动触发失败:', error);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // 时间触发器 - 定期检查时间相关的自定义互动
  useEffect(() => {
    const checkTimeBasedInteractions = async () => {
      try {
        const context = buildInteractionContext();
        await customInteractionManager.triggerInteraction('time', context);
      } catch (error) {
        console.warn('时间触发互动失败:', error);
      }
    };

    // 每30秒检查一次时间触发条件
    const intervalId = setInterval(checkTimeBasedInteractions, 30000);
    
    // 初始检查
    checkTimeBasedInteractions();
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

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
      console.log('🎁 设置ItemReaction, 当前CustomInteractionMessage:', customInteractionMessage);
      
      setItemReaction(reaction);
      
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
    };

    // 拖拽放置监听器
    const handleItemDrop = async (item: ItemData, dropZone: DropZone, position: { x: number; y: number }) => {
      if (dropZone.id === 'pet') {
        console.log('🎁 道具放置到桌宠:', item.name);
        handleUserInteraction();
        
        // 设置最近使用的道具，用于自定义互动条件判断
        setLastUsedItem(item.id);
        
        // 阻止自定义互动在道具使用期间触发
        setCustomInteractionsBlocked(true);
        
        // 清除之前的超时
        if (lastUsedItemTimeoutRef.current) {
          clearTimeout(lastUsedItemTimeoutRef.current);
        }
        if (customInteractionsBlockTimeoutRef.current) {
          clearTimeout(customInteractionsBlockTimeoutRef.current);
        }
        
        // 10秒后清除最近使用的道具记录
        lastUsedItemTimeoutRef.current = setTimeout(() => {
          setLastUsedItem(undefined);
        }, 10000);
        
        // 8秒后解除自定义互动阻止（比道具消息略长一点）
        customInteractionsBlockTimeoutRef.current = setTimeout(() => {
          setCustomInteractionsBlocked(false);
        }, 8000);
        
        // 使用道具
        const reaction = await itemManager.useItem(item.id, position);
        if (reaction) {
          console.log('🎁 道具反应:', item.id, 'message:', reaction.message, 'duration:', reaction.duration);
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
      if (lastUsedItemTimeoutRef.current) {
        clearTimeout(lastUsedItemTimeoutRef.current);
      }
      if (customInteractionsBlockTimeoutRef.current) {
        clearTimeout(customInteractionsBlockTimeoutRef.current);
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

  // 管理道具反应显示超时
  useEffect(() => {
    if (itemReaction) {
      const reactionDuration = itemReaction.duration || 3000;
      const startTime = Date.now();
      const problemItems = ['cake', 'magic_wand', 'rainbow'];
      const isProbleItem = problemItems.some(item => itemReaction.message?.includes('やったー') || itemReaction.message?.includes('アブラカダブラ') || itemReaction.message?.includes('最高の気分'));
      
      console.log(`🎁 [useEffect] ItemReaction 设置超时 ${reactionDuration}ms，消息: "${itemReaction.message}"${isProbleItem ? ' ⚠️ [问题道具]' : ''}，开始时间:`, startTime);
      
      // 清除之前的超时
      if (itemReactionTimeoutRef.current) {
        clearTimeout(itemReactionTimeoutRef.current);
        console.log('🎁 [useEffect] 清除了之前的超时');
      }
      
      // 设置新的超时
      itemReactionTimeoutRef.current = setTimeout(() => {
        const endTime = Date.now();
        const actualDuration = endTime - startTime;
        console.log(`🎁 [useEffect] 清除ItemReaction，预期: ${reactionDuration}ms，实际: ${actualDuration}ms${isProbleItem ? ' ⚠️ [问题道具]' : ''}`);
        setItemReaction(null);
      }, reactionDuration);
      
      // 清理函数
      return () => {
        if (itemReactionTimeoutRef.current) {
          const cleanupTime = Date.now();
          const cleanupDuration = cleanupTime - startTime;
          console.log(`🎁 [useEffect] 清理函数调用，已经过去: ${cleanupDuration}ms${isProbleItem ? ' ⚠️ [问题道具]' : ''}`);
          clearTimeout(itemReactionTimeoutRef.current);
          itemReactionTimeoutRef.current = null;
        }
      };
    }
  }, [itemReaction]);

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
  const handlePetClick = async () => {
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
    
    // 触发自定义互动 - 点击事件
    try {
      const context = buildInteractionContext();
      await customInteractionManager.triggerInteraction('click', context);
    } catch (error) {
      console.warn('自定义互动触发失败:', error);
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
        className="pet"
        style={{
          ...getPetContainerStyle(),
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
        onMouseEnter={async () => {
          setIsHovered(true);
          onHoverChange(true);
          handleUserInteraction(); // 通知用户交互
          
          // 触发自定义互动 - 悬停事件
          try {
            const context = buildInteractionContext();
            await customInteractionManager.triggerInteraction('hover', context);
          } catch (error) {
            console.warn('自定义互动触发失败:', error);
          }
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
                ...getPetAvatarStyle(),
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
                      ...getPetAvatarStyle(),
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
                      style={getPetAvatarStyle()}
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
                      style={getPetAvatarStyle()}
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
        <div className="pet__bubble" style={getBubbleStyle()}>
          {/* 优先级：道具反应 > 自定义互动消息 > 特殊消息 > 时间感知情绪 > 常规状态 */}
          {itemReaction?.message && <span style={{color: '#ff9800', fontWeight: 'bold'}}>{itemReaction.message}</span>}
          {!itemReaction?.message && customInteractionMessage && <span style={{color: '#e91e63', fontWeight: 'bold'}}>{customInteractionMessage}</span>}
          {!itemReaction?.message && !customInteractionMessage && specialMessage && <span style={{color: '#ff6b35', fontWeight: 'bold'}}>{specialMessage}</span>}
          {!itemReaction?.message && !customInteractionMessage && !specialMessage && timeBasedEmotion && <span style={{color: '#4a90e2', fontStyle: 'italic'}}>{timeBasedEmotion.text}</span>}
          {isDraggedOver && !itemReaction?.message && !customInteractionMessage && !specialMessage && !timeBasedEmotion && <span style={{color: '#4a90e2', fontWeight: 'bold'}}>ここに放して！</span>}
          {!itemReaction?.message && !customInteractionMessage && !specialMessage && !timeBasedEmotion && !isDraggedOver && isCongrats && <span>{PetTexts.bubbleTexts.congrats}</span>}
          {!itemReaction?.message && !customInteractionMessage && !specialMessage && !timeBasedEmotion && !isDraggedOver && isLoading && !isCongrats && <span>{PetTexts.bubbleTexts.thinking}</span>}
          {!itemReaction?.message && !customInteractionMessage && !specialMessage && !timeBasedEmotion && !isDraggedOver && isActive && !isCongrats && <span>{PetTexts.bubbleTexts.ready}</span>}
          {!itemReaction?.message && !customInteractionMessage && !specialMessage && !timeBasedEmotion && !isDraggedOver && isDragging && !isCongrats && <span>{PetTexts.bubbleTexts.dragging}</span>}
          {!itemReaction?.message && !customInteractionMessage && !specialMessage && !timeBasedEmotion && !isDraggedOver && isFollowingMouse && !isDragging && !isActive && !isLoading && !isCongrats && <span>{PetTexts.bubbleTexts.followingMouse}</span>}
          {!itemReaction?.message && !customInteractionMessage && !specialMessage && !timeBasedEmotion && !isDraggedOver && autonomousState === 'walking' && !isHovered && !isActive && !isLoading && !isDragging && !isCongrats && <span>{PetTexts.bubbleTexts.walking}</span>}
          {!itemReaction?.message && !customInteractionMessage && !specialMessage && !timeBasedEmotion && !isDraggedOver && autonomousState === 'sleeping' && !isHovered && !isActive && !isLoading && !isDragging && !isCongrats && <span>{PetTexts.bubbleTexts.sleeping}</span>}
          {!itemReaction?.message && !customInteractionMessage && !specialMessage && !timeBasedEmotion && !isDraggedOver && autonomousState === 'observing' && !isHovered && !isActive && !isLoading && !isDragging && !isCongrats && <span>{PetTexts.bubbleTexts.observing}</span>}
          {!itemReaction?.message && !customInteractionMessage && !specialMessage && !timeBasedEmotion && !isDraggedOver && autonomousState === 'yawning' && !isHovered && !isActive && !isLoading && !isDragging && !isCongrats && <span>{PetTexts.bubbleTexts.yawning}</span>}
          {!itemReaction?.message && !customInteractionMessage && !specialMessage && !timeBasedEmotion && !isDraggedOver && autonomousState === 'stretching' && !isHovered && !isActive && !isLoading && !isDragging && !isCongrats && <span>{PetTexts.bubbleTexts.stretching}</span>}
          {!itemReaction?.message && !customInteractionMessage && !specialMessage && !timeBasedEmotion && !isDraggedOver && isHovered && !isActive && !isLoading && !isDragging && !isCongrats && !isAutonomousState(autonomousState) && <span>{PetTexts.bubbleTexts.hover}</span>}
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