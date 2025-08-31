import React from 'react';
import { CardData } from '../types/card';
import { AppConfig } from '../config/appConfig';

/**
 * 可访问性增强的StudyCard组件辅助函数
 */

// ARIA标签生成器
export const generateAriaLabels = (card: CardData) => ({
  cardContainer: `${card.type === 'word' ? '单词' : card.type === 'sentence' ? '短句' : '学习'}卡片: ${card.jp}`,
  closeButton: '关闭学习卡片',
  playButton: `播放 ${card.jp} 的发音`,
  translationToggle: (showTranslation: boolean) => showTranslation ? '隐藏中文翻译' : '显示中文翻译',
  answerButton: (type: string) => {
    switch(type) {
      case 'know': return '标记为已掌握';
      case 'unknown': return '标记为未掌握'; 
      case 'later': return '稍后复习';
      default: return '提交答案';
    }
  },
  choiceButton: (choice: string, index: number) => `选择项 ${index + 1}: ${choice}`,
  arrangeWord: (word: string, index: number) => `可拖拽词汇 ${index + 1}: ${word}`
});

// 键盘导航支持
export const useKeyboardNavigation = (onClose: () => void, onAnswer: (result: string) => void) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    // 防止在输入框中触发
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch(event.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowRight':
      case 'Enter':
        onAnswer('know');
        break;
      case 'ArrowLeft':
        onAnswer('unknown');
        break;
      case 'ArrowDown':
        onAnswer('later');
        break;
      case ' ': // 空格键播放音频
        event.preventDefault();
        // 这里可以添加播放音频的逻辑
        break;
    }
  };

  return handleKeyDown;
};

// 焦点管理
export const useFocusManagement = () => {
  const focusFirstInteractiveElement = (container: HTMLElement | null) => {
    if (!container) return;
    
    const focusableElements = container.querySelectorAll(
      AppConfig.accessibility.focusableSelector
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    if (firstElement) {
      firstElement.focus();
    }
  };

  return { focusFirstInteractiveElement };
};