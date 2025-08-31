import { useMemo } from 'react';

// 自定义Hook，避免每次渲染重新创建函数
export const useCardTypeUtils = () => {
  const getCardTypeName = useMemo(() => (type: string) => {
    switch (type) {
      case 'word': return '单词';
      case 'sentence': return '短句';
      case 'example': return '例句';
      case 'grammar': return '语法';
      case 'image': return '图片';
      case 'audio': return '音频';
      case 'arrange': return '排句';
      default: return '未知';
    }
  }, []);

  return { getCardTypeName };
};