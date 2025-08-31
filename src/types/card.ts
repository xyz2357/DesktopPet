export interface CardData {
  id: string;
  type: 'word' | 'sentence' | 'example' | 'grammar' | 'image' | 'audio' | 'arrange';
  jp: string;
  kana?: string;
  romaji?: string;
  cn: string;
  example_jp?: string;
  example_cn?: string;
  jlpt: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  // 新增字段
  grammar_pattern?: string; // 语法模式
  grammar_explanation?: string; // 语法说明
  image_path?: string; // 图片路径
  audio_path?: string; // 音频路径
  choices?: string[]; // 选择题选项
  correct_answer?: string; // 正确答案
  words_to_arrange?: string[]; // 拖拽拼句的词汇
  correct_order?: number[]; // 正确顺序的索引
}

export type AnswerResult = 'know' | 'unknown' | 'later';