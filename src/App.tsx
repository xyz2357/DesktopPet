import React, { useState, useEffect, useRef } from 'react';
import Pet from './components/Pet';
import StudyCard from './components/StudyCard';
import ItemPanel from './components/ItemPanel';
import { CardData } from './types/card';
import { ItemData } from './types/item';
import { LearningConfig, PetConfig } from './config/appConfig';
import { dragDropManager } from './utils/dragDropManager';
import './App.css';

const App: React.FC = () => {
  const [showCard, setShowCard] = useState(false);
  const [currentCard, setCurrentCard] = useState<CardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPetHovered, setIsPetHovered] = useState(false);
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [isCongrats, setIsCongrats] = useState(false);
  const congratsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 道具面板状态
  const [showItemPanel, setShowItemPanel] = useState(false);
  
  // 调试面板状态
  const [isDebugPanelVisible, setIsDebugPanelVisible] = useState(false);
  
  // 状态面板状态
  const [isStatsPanelVisible, setIsStatsPanelVisible] = useState(false);

  // 获取新的学习卡片
  const fetchNewCard = async () => {
    setIsLoading(true);
    try {
      const card = await window.electronAPI.getNextCard();
      setCurrentCard(card);
      setShowCard(true);
      // 显示学习卡片时禁用点击穿透
      await window.electronAPI.setIgnoreMouseEvents(false);
    } catch (error) {
      console.error('Failed to fetch card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 触发祝贺状态
  const triggerCongrats = () => {
    // 清除之前的超时
    if (congratsTimeoutRef.current) {
      clearTimeout(congratsTimeoutRef.current);
    }
    
    setIsCongrats(true);
    
    // 设置超时自动退出祝贺状态
    congratsTimeoutRef.current = setTimeout(() => {
      setIsCongrats(false);
      congratsTimeoutRef.current = null;
    }, PetConfig.states.congrats.duration);
  };

  // 处理学习卡片答案
  const handleAnswer = async (result: 'know' | 'unknown' | 'later') => {
    if (!currentCard) return;

    try {
      await window.electronAPI.submitAnswer(currentCard.id, result);
      
      // 如果回答正确，触发祝贺状态
      if (result === 'know') {
        triggerCongrats();
      }
      
      setShowCard(false);
      setCurrentCard(null);
      // 关闭学习卡片时恢复点击穿透
      await window.electronAPI.setIgnoreMouseEvents(true);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  // 播放语音
  const handlePlayTTS = async (text: string) => {
    try {
      await window.electronAPI.playTTS(text);
    } catch (error) {
      console.error('Failed to play TTS:', error);
    }
  };

  // 关闭学习卡片
  const handleCloseCard = async () => {
    setShowCard(false);
    setCurrentCard(null);
    // 关闭学习卡片时恢复点击穿透
    await window.electronAPI.setIgnoreMouseEvents(true);
  };

  // 道具拖拽处理
  const handleItemDragStart = (item: ItemData, event: React.DragEvent) => {
    console.log('🎁 开始拖拽道具:', item.name);
    dragDropManager.startDrag(item, event.nativeEvent);
  };

  // 管理点击穿透状态
  useEffect(() => {
    const setMouseEvents = async () => {
      if (showCard || isPetHovered || isContextMenuVisible || showItemPanel || isDebugPanelVisible || isStatsPanelVisible) {
        // 显示学习卡片、鼠标悬停桌宠、显示右键菜单、显示道具面板、调试面板或状态面板时禁用点击穿透
        console.log('Disabling mouse events for UI elements');
        await window.electronAPI.setIgnoreMouseEvents(false);
      } else {
        // 其他情况启用点击穿透
        console.log('Enabling mouse events passthrough');
        await window.electronAPI.setIgnoreMouseEvents(true);
      }
    };
    
    setMouseEvents();
  }, [showCard, isPetHovered, isContextMenuVisible, showItemPanel, isDebugPanelVisible, isStatsPanelVisible]);

  // 键盘快捷键处理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 按 I 键打开/关闭道具面板
      if (event.key === 'i' || event.key === 'I') {
        event.preventDefault();
        setShowItemPanel(prev => !prev);
      }
      // 按 Escape 键关闭道具面板
      if (event.key === 'Escape' && showItemPanel) {
        event.preventDefault();
        setShowItemPanel(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showItemPanel]);

  // 清理祝贺超时
  useEffect(() => {
    return () => {
      if (congratsTimeoutRef.current) {
        clearTimeout(congratsTimeoutRef.current);
      }
    };
  }, []);

  // 定时推送（简化版，每60秒推送一次）
  useEffect(() => {
    const interval = setInterval(() => {
      if (!showCard) {
        fetchNewCard();
      }
    }, LearningConfig.reminder.interval);

    return () => clearInterval(interval);
  }, [showCard]);

  return (
    <div className="app">
      <Pet 
        onClick={fetchNewCard}
        isActive={showCard}
        isLoading={isLoading}
        isCongrats={isCongrats}
        onHoverChange={setIsPetHovered}
        onContextMenuChange={setIsContextMenuVisible}
        onItemPanelToggle={() => setShowItemPanel(!showItemPanel)}
        onDebugPanelChange={setIsDebugPanelVisible}
        onStatsPanelChange={setIsStatsPanelVisible}
      />
      {showCard && currentCard && (
        <StudyCard
          card={currentCard}
          onAnswer={handleAnswer}
          onPlayTTS={handlePlayTTS}
          onClose={handleCloseCard}
        />
      )}
      <ItemPanel
        visible={showItemPanel}
        onClose={() => setShowItemPanel(false)}
        onItemDragStart={handleItemDragStart}
      />
    </div>
  );
};

export default App;