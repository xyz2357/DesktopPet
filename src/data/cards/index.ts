import { CardData } from '../../types/card';

// 导入所有卡片数据
import wordsData from './words.json';
import sentencesData from './sentences.json';
import examplesData from './examples.json';
import grammarData from './grammar.json';
import imagesData from './images.json';
import audioData from './audio.json';
import arrangeData from './arrange.json';

// 合并所有卡片数据
export const allCards: CardData[] = [
  ...wordsData as CardData[],
  ...sentencesData as CardData[],
  ...examplesData as CardData[],
  ...grammarData as CardData[],
  ...imagesData as CardData[],
  ...audioData as CardData[],
  ...arrangeData as CardData[]
];

// 按类型分组的数据
export const cardsByType = {
  word: wordsData as CardData[],
  sentence: sentencesData as CardData[],
  example: examplesData as CardData[],
  grammar: grammarData as CardData[],
  image: imagesData as CardData[],
  audio: audioData as CardData[],
  arrange: arrangeData as CardData[]
};

// 按JLPT等级分组
export const cardsByJLPT = {
  N5: allCards.filter(card => card.jlpt === 'N5'),
  N4: allCards.filter(card => card.jlpt === 'N4'),
  N3: allCards.filter(card => card.jlpt === 'N3'),
  N2: allCards.filter(card => card.jlpt === 'N2'),
  N1: allCards.filter(card => card.jlpt === 'N1')
};

// 按难度分组
export const cardsByDifficulty = {
  1: allCards.filter(card => (card as any).difficulty === 1),
  2: allCards.filter(card => (card as any).difficulty === 2),
  3: allCards.filter(card => (card as any).difficulty === 3),
  4: allCards.filter(card => (card as any).difficulty === 4),
  5: allCards.filter(card => (card as any).difficulty === 5)
};

// 数据统计
export const dataStats = {
  totalCards: allCards.length,
  cardsByType: {
    word: cardsByType.word.length,
    sentence: cardsByType.sentence.length,
    example: cardsByType.example.length,
    grammar: cardsByType.grammar.length,
    image: cardsByType.image.length,
    audio: cardsByType.audio.length,
    arrange: cardsByType.arrange.length
  },
  cardsByJLPT: {
    N5: cardsByJLPT.N5.length,
    N4: cardsByJLPT.N4.length,
    N3: cardsByJLPT.N3.length,
    N2: cardsByJLPT.N2.length,
    N1: cardsByJLPT.N1.length
  }
};

// 搜索功能
export function searchCards(query: string, type?: string, jlpt?: string): CardData[] {
  let results = allCards;
  
  // 按类型过滤
  if (type) {
    results = results.filter(card => card.type === type);
  }
  
  // 按JLPT等级过滤
  if (jlpt) {
    results = results.filter(card => card.jlpt === jlpt);
  }
  
  // 按内容搜索
  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(card => 
      card.jp.toLowerCase().includes(lowerQuery) ||
      card.cn.toLowerCase().includes(lowerQuery) ||
      (card.kana && card.kana.toLowerCase().includes(lowerQuery)) ||
      (card.romaji && card.romaji.toLowerCase().includes(lowerQuery))
    );
  }
  
  return results;
}

// 获取随机卡片
export function getRandomCard(type?: string, jlpt?: string): CardData {
  let pool = allCards;
  
  if (type) {
    pool = cardsByType[type as keyof typeof cardsByType] || [];
  }
  
  if (jlpt) {
    pool = pool.filter(card => card.jlpt === jlpt);
  }
  
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

// 获取相关卡片（基于标签、类别等）
export function getRelatedCards(card: CardData, limit: number = 5): CardData[] {
  const related: CardData[] = [];
  
  // 同类型的卡片
  const sameType = cardsByType[card.type as keyof typeof cardsByType] || [];
  const sameTypeFiltered = sameType.filter(c => c.id !== card.id);
  
  // 同等级的卡片
  const sameJLPT = cardsByJLPT[card.jlpt] || [];
  const sameJLPTFiltered = sameJLPT.filter(c => c.id !== card.id && c.type !== card.type);
  
  // 合并结果，优先同类型
  related.push(...sameTypeFiltered.slice(0, Math.floor(limit / 2)));
  related.push(...sameJLPTFiltered.slice(0, limit - related.length));
  
  return related.slice(0, limit);
}