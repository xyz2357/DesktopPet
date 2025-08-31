import { CardData } from '../types/card';

/**
 * 检查拖拽拼句是否正确
 */
export const checkArrangementCorrectness = (
  arrangedWords: string[],
  card: CardData
): boolean => {
  if (card.type !== 'arrange' || !('words_to_arrange' in card) || !('correct_order' in card)) {
    return false;
  }

  const correctSequence = card.correct_order.map(index => card.words_to_arrange[index]);
  return JSON.stringify(arrangedWords) === JSON.stringify(correctSequence);
};

/**
 * 检查音频卡答案是否正确
 */
export const checkAudioAnswer = (
  selectedChoice: string,
  card: CardData
): boolean => {
  if (card.type !== 'audio' || !('correct_answer' in card)) {
    return false;
  }

  return selectedChoice === card.correct_answer;
};

/**
 * 生成工具提示内容
 */
export const generateTooltipContent = (card: CardData): string => {
  if ('kana' in card && card.kana) {
    return `${card.kana} / ${card.cn}`;
  }
  return card.cn;
};

/**
 * 检查卡片是否有必需的字段
 */
export const validateCardData = (card: CardData): string[] => {
  const errors: string[] = [];

  if (!card.id) errors.push('缺少卡片ID');
  if (!card.jp) errors.push('缺少日语内容');
  if (!card.cn) errors.push('缺少中文翻译');
  if (!card.jlpt) errors.push('缺少JLPT等级');

  // 类型特定验证
  switch (card.type) {
    case 'audio':
      if (!('choices' in card) || !card.choices?.length) {
        errors.push('音频卡缺少选择项');
      }
      if (!('correct_answer' in card) || !card.correct_answer) {
        errors.push('音频卡缺少正确答案');
      }
      break;

    case 'arrange':
      if (!('words_to_arrange' in card) || !card.words_to_arrange?.length) {
        errors.push('拖拽拼句卡缺少词汇');
      }
      if (!('correct_order' in card) || !card.correct_order?.length) {
        errors.push('拖拽拼句卡缺少正确顺序');
      }
      break;

    case 'image':
      if (!('image_path' in card) || !card.image_path) {
        errors.push('图片卡缺少图片路径');
      }
      break;
  }

  return errors;
};