import { useState, useEffect, useRef } from 'react';
import { CardData, TooltipState, ArrangeResult } from '../types/card';

/**
 * 学习卡片状态管理Hook
 * 将StudyCard组件的状态逻辑提取出来，提高可测试性和复用性
 */
export const useStudyCardState = (card: CardData) => {
  // 基础状态
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  // Tooltip状态
  const [tooltip, setTooltip] = useState<TooltipState>({
    show: false,
    content: '',
    x: 0,
    y: 0
  });
  
  // 拖拽相关状态
  const [arrangedWords, setArrangedWords] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [arrangeResult, setArrangeResult] = useState<ArrangeResult>({
    show: false,
    isCorrect: false
  });

  // 定时器引用
  const audioTimerRef = useRef<NodeJS.Timeout | null>(null);
  const arrangeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 重置状态当卡片变化时
  useEffect(() => {
    setShowTranslation(false);
    setSelectedChoice(null);
    setShowResult(false);
    setTooltip({ show: false, content: '', x: 0, y: 0 });
    setArrangeResult({ show: false, isCorrect: false });
    setDraggedIndex(null);

    // 初始化拖拽拼句数据
    if (card.type === 'arrange' && 'words_to_arrange' in card) {
      const shuffled = [...card.words_to_arrange];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setArrangedWords(shuffled);
    }

    // 清理定时器
    return () => {
      if (audioTimerRef.current) {
        clearTimeout(audioTimerRef.current);
        audioTimerRef.current = null;
      }
      if (arrangeTimerRef.current) {
        clearTimeout(arrangeTimerRef.current);
        arrangeTimerRef.current = null;
      }
    };
  }, [card.id]);

  // 清理所有定时器的函数
  const clearAllTimers = () => {
    if (audioTimerRef.current) {
      clearTimeout(audioTimerRef.current);
      audioTimerRef.current = null;
    }
    if (arrangeTimerRef.current) {
      clearTimeout(arrangeTimerRef.current);
      arrangeTimerRef.current = null;
    }
  };

  return {
    // 状态
    showTranslation,
    selectedChoice,
    showResult,
    tooltip,
    arrangedWords,
    draggedIndex,
    arrangeResult,
    
    // 状态设置函数
    setShowTranslation,
    setSelectedChoice,
    setShowResult,
    setTooltip,
    setArrangedWords,
    setDraggedIndex,
    setArrangeResult,
    
    // 定时器引用
    audioTimerRef,
    arrangeTimerRef,
    
    // 工具函数
    clearAllTimers
  };
};