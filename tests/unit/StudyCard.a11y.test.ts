import { generateAriaLabels, useKeyboardNavigation, useFocusManagement } from '../../src/components/StudyCard.a11y';
import { createMockCard } from '../utils/testUtils';

describe('StudyCard.a11y', () => {
  describe('generateAriaLabels', () => {
    it('generates correct labels for word card', () => {
      const card = createMockCard({ 
        type: 'word', 
        jp: 'テスト' 
      });
      
      const labels = generateAriaLabels(card);
      
      expect(labels.cardContainer).toBe('单词卡片: テスト');
      expect(labels.closeButton).toBe('关闭学习卡片');
      expect(labels.playButton).toBe('播放 テスト 的发音');
    });

    it('generates correct labels for sentence card', () => {
      const card = createMockCard({ 
        type: 'sentence', 
        jp: 'こんにちは' 
      });
      
      const labels = generateAriaLabels(card);
      
      expect(labels.cardContainer).toBe('短句卡片: こんにちは');
    });

    it('generates correct labels for other card types', () => {
      const card = createMockCard({ 
        type: 'grammar', 
        jp: 'です/である' 
      });
      
      const labels = generateAriaLabels(card);
      
      expect(labels.cardContainer).toBe('学习卡片: です/である');
    });

    it('generates translation toggle labels correctly', () => {
      const card = createMockCard();
      const labels = generateAriaLabels(card);
      
      expect(labels.translationToggle(false)).toBe('显示中文翻译');
      expect(labels.translationToggle(true)).toBe('隐藏中文翻译');
    });

    it('generates answer button labels correctly', () => {
      const card = createMockCard();
      const labels = generateAriaLabels(card);
      
      expect(labels.answerButton('know')).toBe('标记为已掌握');
      expect(labels.answerButton('unknown')).toBe('标记为未掌握');
      expect(labels.answerButton('later')).toBe('稍后复习');
      expect(labels.answerButton('other')).toBe('提交答案');
    });

    it('generates choice button labels correctly', () => {
      const card = createMockCard();
      const labels = generateAriaLabels(card);
      
      expect(labels.choiceButton('选项A', 0)).toBe('选择项 1: 选项A');
      expect(labels.choiceButton('选项B', 1)).toBe('选择项 2: 选项B');
    });

    it('generates arrange word labels correctly', () => {
      const card = createMockCard();
      const labels = generateAriaLabels(card);
      
      expect(labels.arrangeWord('私', 0)).toBe('可拖拽词汇 1: 私');
      expect(labels.arrangeWord('は', 1)).toBe('可拖拽词汇 2: は');
    });
  });

  describe('useKeyboardNavigation', () => {
    let mockOnClose: jest.Mock;
    let mockOnAnswer: jest.Mock;
    let handleKeyDown: (event: KeyboardEvent) => void;

    beforeEach(() => {
      mockOnClose = jest.fn();
      mockOnAnswer = jest.fn();
      handleKeyDown = useKeyboardNavigation(mockOnClose, mockOnAnswer);
    });

    it('handles Escape key for closing', () => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      handleKeyDown(event);
      
      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnAnswer).not.toHaveBeenCalled();
    });

    it('handles ArrowRight for know answer', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      handleKeyDown(event);
      
      expect(mockOnAnswer).toHaveBeenCalledWith('know');
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('handles Enter for know answer', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      handleKeyDown(event);
      
      expect(mockOnAnswer).toHaveBeenCalledWith('know');
    });

    it('handles ArrowLeft for unknown answer', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      handleKeyDown(event);
      
      expect(mockOnAnswer).toHaveBeenCalledWith('unknown');
    });

    it('handles ArrowDown for later answer', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      handleKeyDown(event);
      
      expect(mockOnAnswer).toHaveBeenCalledWith('later');
    });

    it('handles space key and prevents default', () => {
      const event = new KeyboardEvent('keydown', { key: ' ' });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      
      handleKeyDown(event);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('ignores events from input elements', () => {
      const inputElement = document.createElement('input');
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      Object.defineProperty(event, 'target', { value: inputElement, enumerable: true });
      
      handleKeyDown(event);
      
      expect(mockOnClose).not.toHaveBeenCalled();
      expect(mockOnAnswer).not.toHaveBeenCalled();
    });

    it('ignores events from textarea elements', () => {
      const textareaElement = document.createElement('textarea');
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      Object.defineProperty(event, 'target', { value: textareaElement, enumerable: true });
      
      handleKeyDown(event);
      
      expect(mockOnClose).not.toHaveBeenCalled();
      expect(mockOnAnswer).not.toHaveBeenCalled();
    });

    it('ignores unknown keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      handleKeyDown(event);
      
      expect(mockOnClose).not.toHaveBeenCalled();
      expect(mockOnAnswer).not.toHaveBeenCalled();
    });
  });

  describe('useFocusManagement', () => {
    it('focuses first interactive element', () => {
      const { focusFirstInteractiveElement } = useFocusManagement();
      
      const container = document.createElement('div');
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      const input = document.createElement('input');
      
      button1.textContent = 'First';
      button2.textContent = 'Second';
      
      container.appendChild(button1);
      container.appendChild(button2);
      container.appendChild(input);
      
      document.body.appendChild(container);
      
      const focusSpy = jest.spyOn(button1, 'focus');
      
      focusFirstInteractiveElement(container);
      
      expect(focusSpy).toHaveBeenCalled();
      
      document.body.removeChild(container);
    });

    it('handles container with no focusable elements', () => {
      const { focusFirstInteractiveElement } = useFocusManagement();
      
      const container = document.createElement('div');
      const span = document.createElement('span');
      span.textContent = 'No focusable elements';
      container.appendChild(span);
      
      document.body.appendChild(container);
      
      // Should not throw error
      expect(() => focusFirstInteractiveElement(container)).not.toThrow();
      
      document.body.removeChild(container);
    });

    it('handles null container', () => {
      const { focusFirstInteractiveElement } = useFocusManagement();
      
      // Should not throw error
      expect(() => focusFirstInteractiveElement(null)).not.toThrow();
    });

    it('finds various focusable element types', () => {
      const { focusFirstInteractiveElement } = useFocusManagement();
      
      const container = document.createElement('div');
      
      // Add a link first (should be focused)
      const link = document.createElement('a');
      link.href = '#';
      container.appendChild(link);
      
      // Add other focusable elements
      const select = document.createElement('select');
      const textarea = document.createElement('textarea');
      const tabIndexDiv = document.createElement('div');
      tabIndexDiv.tabIndex = 0;
      
      container.appendChild(select);
      container.appendChild(textarea);
      container.appendChild(tabIndexDiv);
      
      document.body.appendChild(container);
      
      const focusSpy = jest.spyOn(link, 'focus');
      
      focusFirstInteractiveElement(container);
      
      expect(focusSpy).toHaveBeenCalled();
      
      document.body.removeChild(container);
    });
  });
});