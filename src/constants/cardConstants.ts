import { CardType } from '../types/card';

// 卡片类型映射
export const CARD_TYPE_NAMES: Record<CardType, string> = {
  word: '单词',
  sentence: '短句', 
  example: '例句',
  grammar: '语法',
  image: '图片',
  audio: '音频',
  arrange: '排句'
} as const;

// 定时器延迟配置
export const TIMER_DELAYS = {
  AUDIO_AUTO_SUBMIT: 1500, // 音频卡自动提交延迟（毫秒）
  ARRANGE_AUTO_SUBMIT: 2000, // 拖拽拼句自动提交延迟（毫秒）
  TOOLTIP_DEBOUNCE: 100 // 工具提示防抖延迟（毫秒）
} as const;

// 动画持续时间
export const ANIMATION_DURATIONS = {
  SLIDE_IN: 300, // 卡片滑入动画
  FADE_IN: 200,  // 淡入动画
  TOOLTIP: 150   // 工具提示动画
} as const;

// 键盘快捷键
export const KEYBOARD_SHORTCUTS = {
  CLOSE_CARD: 'Escape',
  KNOW: 'ArrowRight',
  UNKNOWN: 'ArrowLeft', 
  LATER: 'ArrowDown'
} as const;