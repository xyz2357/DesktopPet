import { 
  checkArrangementCorrectness, 
  checkAudioAnswer, 
  generateTooltipContent, 
  validateCardData 
} from '../../src/utils/cardUtils';
import { createMockCard, createArrangeCard, createAudioCard } from '../utils/testUtils';

describe('cardUtils', () => {
  describe('checkArrangementCorrectness', () => {
    it('returns true for correct arrangement', () => {
      const card = createArrangeCard({
        words_to_arrange: ['私', 'は', '学生', 'です'],
        correct_order: [0, 1, 2, 3]
      });
      
      const arrangedWords = ['私', 'は', '学生', 'です'];
      expect(checkArrangementCorrectness(arrangedWords, card)).toBe(true);
    });

    it('returns false for incorrect arrangement', () => {
      const card = createArrangeCard({
        words_to_arrange: ['私', 'は', '学生', 'です'], 
        correct_order: [0, 1, 2, 3]
      });
      
      const arrangedWords = ['は', '私', '学生', 'です'];
      expect(checkArrangementCorrectness(arrangedWords, card)).toBe(false);
    });

    it('returns false for non-arrange card type', () => {
      const card = createMockCard({ type: 'word' });
      const arrangedWords = ['test'];
      
      expect(checkArrangementCorrectness(arrangedWords, card)).toBe(false);
    });

    it('handles empty arrangement', () => {
      const card = createArrangeCard();
      expect(checkArrangementCorrectness([], card)).toBe(false);
    });
  });

  describe('checkAudioAnswer', () => {
    it('returns true for correct audio answer', () => {
      const card = createAudioCard({
        choices: ['猫', '犬', '鳥'],
        correct_answer: '猫'
      });
      
      expect(checkAudioAnswer('猫', card)).toBe(true);
    });

    it('returns false for incorrect audio answer', () => {
      const card = createAudioCard({
        choices: ['猫', '犬', '鳥'],
        correct_answer: '猫'
      });
      
      expect(checkAudioAnswer('犬', card)).toBe(false);
    });

    it('returns false for non-audio card type', () => {
      const card = createMockCard({ type: 'word' });
      expect(checkAudioAnswer('answer', card)).toBe(false);
    });
  });

  describe('generateTooltipContent', () => {
    it('generates tooltip with kana and translation', () => {
      const card = createMockCard({
        kana: 'てすと',
        cn: '测试'
      });
      
      expect(generateTooltipContent(card)).toBe('てすと / 测试');
    });

    it('generates tooltip with only translation when no kana', () => {
      const card = {
        id: 'test-grammar',
        type: 'grammar' as const,
        jp: '語法テスト',
        cn: '语法测试',
        jlpt: 'N5' as const
      };
      
      expect(generateTooltipContent(card)).toBe('语法测试');
    });

    it('handles empty kana', () => {
      const card = createMockCard({
        kana: '',
        cn: '测试'
      });
      
      expect(generateTooltipContent(card)).toBe('测试');
    });
  });

  describe('validateCardData', () => {
    it('returns empty array for valid basic card', () => {
      const card = createMockCard();
      const errors = validateCardData(card);
      
      expect(errors).toEqual([]);
    });

    it('detects missing required fields', () => {
      const incompleteCard = {
        id: '',
        type: 'word',
        jp: '',
        cn: 'test',
        jlpt: 'N5'
      } as any;
      
      const errors = validateCardData(incompleteCard);
      
      expect(errors).toContain('缺少卡片ID');
      expect(errors).toContain('缺少日语内容');
    });

    it('validates audio card specific fields', () => {
      const incompleteAudioCard = {
        id: 'test',
        type: 'audio',
        jp: 'test',
        cn: 'test', 
        jlpt: 'N5',
        audio_path: 'test.mp3'
        // missing choices and correct_answer
      } as any;
      
      const errors = validateCardData(incompleteAudioCard);
      
      expect(errors).toContain('音频卡缺少选择项');
      expect(errors).toContain('音频卡缺少正确答案');
    });

    it('validates arrange card specific fields', () => {
      const incompleteArrangeCard = {
        id: 'test',
        type: 'arrange',
        jp: 'test',
        cn: 'test',
        jlpt: 'N5'
        // missing words_to_arrange and correct_order
      } as any;
      
      const errors = validateCardData(incompleteArrangeCard);
      
      expect(errors).toContain('拖拽拼句卡缺少词汇');
      expect(errors).toContain('拖拽拼句卡缺少正确顺序');
    });

    it('validates image card fields', () => {
      const incompleteImageCard = {
        id: 'test',
        type: 'image', 
        jp: 'test',
        cn: 'test',
        jlpt: 'N5'
        // missing image_path
      } as any;
      
      const errors = validateCardData(incompleteImageCard);
      
      expect(errors).toContain('图片卡缺少图片路径');
    });
  });
});