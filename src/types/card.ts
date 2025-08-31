export interface CardData {
  id: string;
  type: 'word' | 'sentence';
  jp: string;
  kana: string;
  romaji: string;
  cn: string;
  example_jp?: string;
  example_cn?: string;
  jlpt: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
}

export type AnswerResult = 'know' | 'unknown' | 'later';