// 基础卡片类型
export type CardType = 'word' | 'sentence' | 'example' | 'grammar' | 'image' | 'audio' | 'arrange';
export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
export type AnswerResult = 'know' | 'unknown' | 'later';

// 工具提示状态
export interface TooltipState {
  show: boolean;
  content: string;
  x: number;
  y: number;
}

// 拖拽拼句结果状态
export interface ArrangeResult {
  show: boolean;
  isCorrect: boolean;
}

// 基础卡片接口
interface BaseCard {
  id: string;
  type: CardType;
  jp: string;
  cn: string;
  jlpt: JLPTLevel;
  kana?: string;
  romaji?: string;
  example_jp?: string;
  example_cn?: string;
}

// 语法卡特有字段
interface GrammarCard extends BaseCard {
  type: 'grammar';
  grammar_pattern?: string;
  grammar_explanation?: string;
}

// 图片卡特有字段
interface ImageCard extends BaseCard {
  type: 'image';
  image_path: string;
  kana: string;
  romaji: string;
}

// 音频卡特有字段
interface AudioCard extends BaseCard {
  type: 'audio';
  audio_path: string;
  choices: string[];
  correct_answer: string;
}

// 拖拽拼句卡特有字段
interface ArrangeCard extends BaseCard {
  type: 'arrange';
  words_to_arrange: string[];
  correct_order: number[];
}

// 普通卡片（单词、句子、例句）
interface RegularCard extends BaseCard {
  type: 'word' | 'sentence' | 'example';
  kana: string;
  romaji: string;
}

// 联合类型
export type CardData = RegularCard | GrammarCard | ImageCard | AudioCard | ArrangeCard;