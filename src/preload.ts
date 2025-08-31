import { contextBridge, ipcRenderer } from 'electron';

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

export interface ElectronAPI {
  getNextCard: () => Promise<CardData>;
  submitAnswer: (cardId: string, result: 'know' | 'unknown' | 'later') => Promise<{ success: boolean }>;
  playTTS: (text: string) => Promise<{ success: boolean }>;
  quitApp: () => Promise<void>;
  setIgnoreMouseEvents: (ignore: boolean) => Promise<void>;
}

contextBridge.exposeInMainWorld('electronAPI', {
  getNextCard: () => ipcRenderer.invoke('get-next-card'),
  submitAnswer: (cardId: string, result: 'know' | 'unknown' | 'later') => 
    ipcRenderer.invoke('submit-answer', cardId, result),
  playTTS: (text: string) => ipcRenderer.invoke('play-tts', text),
  quitApp: () => ipcRenderer.invoke('quit-app'),
  setIgnoreMouseEvents: (ignore: boolean) => ipcRenderer.invoke('set-ignore-mouse-events', ignore)
} as ElectronAPI);

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}