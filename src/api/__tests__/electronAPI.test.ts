import { mockElectronAPI } from '../../setupTests';
import { CardData } from '../../types/card';

const mockCard: CardData = {
  id: 'test-card-1',
  type: 'word',
  jp: 'テスト',
  kana: 'てすと',
  romaji: 'tesuto',
  cn: '测试',
  jlpt: 'N5',
};

describe('ElectronAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNextCard', () => {
    it('should call the electron API and return a card', async () => {
      mockElectronAPI.getNextCard.mockResolvedValue(mockCard);

      const result = await window.electronAPI.getNextCard();

      expect(mockElectronAPI.getNextCard).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCard);
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Failed to get card');
      mockElectronAPI.getNextCard.mockRejectedValue(error);

      await expect(window.electronAPI.getNextCard()).rejects.toThrow('Failed to get card');
    });
  });

  describe('submitAnswer', () => {
    it('should submit answer with correct parameters', async () => {
      const expectedResult = { success: true };
      mockElectronAPI.submitAnswer.mockResolvedValue(expectedResult);

      const result = await window.electronAPI.submitAnswer('card-123', 'know');

      expect(mockElectronAPI.submitAnswer).toHaveBeenCalledWith('card-123', 'know');
      expect(result).toEqual(expectedResult);
    });

    it('should handle different answer types', async () => {
      const expectedResult = { success: true };
      mockElectronAPI.submitAnswer.mockResolvedValue(expectedResult);

      await window.electronAPI.submitAnswer('card-123', 'unknown');
      expect(mockElectronAPI.submitAnswer).toHaveBeenCalledWith('card-123', 'unknown');

      await window.electronAPI.submitAnswer('card-123', 'later');
      expect(mockElectronAPI.submitAnswer).toHaveBeenCalledWith('card-123', 'later');
    });

    it('should handle submission errors', async () => {
      const expectedResult = { success: false };
      mockElectronAPI.submitAnswer.mockResolvedValue(expectedResult);

      const result = await window.electronAPI.submitAnswer('card-123', 'know');

      expect(result.success).toBe(false);
    });
  });

  describe('playTTS', () => {
    it('should call TTS with Japanese text', async () => {
      const expectedResult = { success: true };
      mockElectronAPI.playTTS.mockResolvedValue(expectedResult);

      const result = await window.electronAPI.playTTS('こんにちは');

      expect(mockElectronAPI.playTTS).toHaveBeenCalledWith('こんにちは');
      expect(result).toEqual(expectedResult);
    });

    it('should handle empty text', async () => {
      const expectedResult = { success: false };
      mockElectronAPI.playTTS.mockResolvedValue(expectedResult);

      const result = await window.electronAPI.playTTS('');

      expect(mockElectronAPI.playTTS).toHaveBeenCalledWith('');
      expect(result.success).toBe(false);
    });

    it('should handle TTS errors', async () => {
      const error = new Error('TTS service unavailable');
      mockElectronAPI.playTTS.mockRejectedValue(error);

      await expect(window.electronAPI.playTTS('テスト')).rejects.toThrow('TTS service unavailable');
    });
  });

  describe('quitApp', () => {
    it('should call quit app function', async () => {
      mockElectronAPI.quitApp.mockResolvedValue(undefined);

      await window.electronAPI.quitApp();

      expect(mockElectronAPI.quitApp).toHaveBeenCalledTimes(1);
    });
  });

  describe('setIgnoreMouseEvents', () => {
    it('should set mouse events to ignore', async () => {
      mockElectronAPI.setIgnoreMouseEvents.mockResolvedValue(undefined);

      await window.electronAPI.setIgnoreMouseEvents(true);

      expect(mockElectronAPI.setIgnoreMouseEvents).toHaveBeenCalledWith(true);
    });

    it('should set mouse events to not ignore', async () => {
      mockElectronAPI.setIgnoreMouseEvents.mockResolvedValue(undefined);

      await window.electronAPI.setIgnoreMouseEvents(false);

      expect(mockElectronAPI.setIgnoreMouseEvents).toHaveBeenCalledWith(false);
    });
  });

  describe('API availability', () => {
    it('should have all required methods available', () => {
      expect(window.electronAPI).toBeDefined();
      expect(typeof window.electronAPI.getNextCard).toBe('function');
      expect(typeof window.electronAPI.submitAnswer).toBe('function');
      expect(typeof window.electronAPI.playTTS).toBe('function');
      expect(typeof window.electronAPI.quitApp).toBe('function');
      expect(typeof window.electronAPI.setIgnoreMouseEvents).toBe('function');
    });
  });
});