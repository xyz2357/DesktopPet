import React, { useState, useEffect } from 'react';
import Pet from './components/Pet';
import StudyCard from './components/StudyCard';
import { CardData } from './types/card';
import { LearningConfig } from './config/appConfig';
import './App.css';

const App: React.FC = () => {
  const [showCard, setShowCard] = useState(false);
  const [currentCard, setCurrentCard] = useState<CardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPetHovered, setIsPetHovered] = useState(false);
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);

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

  // 处理学习卡片答案
  const handleAnswer = async (result: 'know' | 'unknown' | 'later') => {
    if (!currentCard) return;

    try {
      await window.electronAPI.submitAnswer(currentCard.id, result);
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

  // 管理点击穿透状态
  useEffect(() => {
    const setMouseEvents = async () => {
      if (showCard || isPetHovered || isContextMenuVisible) {
        // 显示学习卡片、鼠标悬停桌宠或显示右键菜单时禁用点击穿透
        console.log('Disabling mouse events for study card, pet hover, or context menu');
        await window.electronAPI.setIgnoreMouseEvents(false);
      } else {
        // 其他情况启用点击穿透
        console.log('Enabling mouse events passthrough');
        await window.electronAPI.setIgnoreMouseEvents(true);
      }
    };
    
    setMouseEvents();
  }, [showCard, isPetHovered, isContextMenuVisible]);

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
        onHoverChange={setIsPetHovered}
        onContextMenuChange={setIsContextMenuVisible}
      />
      {showCard && currentCard && (
        <StudyCard
          card={currentCard}
          onAnswer={handleAnswer}
          onPlayTTS={handlePlayTTS}
          onClose={handleCloseCard}
        />
      )}
    </div>
  );
};

export default App;