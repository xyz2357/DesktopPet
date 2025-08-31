import { app, BrowserWindow, ipcMain, screen } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

const createWindow = (): void => {
  // 获取主显示器的尺寸
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // 设置窗口为点击穿透，但保留部分区域可点击
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  // 加载HTML文件
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  
  // 开发模式下打开开发者工具
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // 设置窗口可拖拽
  mainWindow.setMovable(true);
  
  // 窗口关闭事件
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// 应用启动
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 阻止应用退出
app.on('window-all-closed', () => {
  // 在macOS上保持应用运行
  if (process.platform !== 'darwin') {
    // 在其他平台上阻止退出，保持桌宠运行
    return;
  }
});

// IPC 通信处理
ipcMain.handle('get-next-card', async () => {
  // 动态导入数据模块
  const { globalCardManager } = await import('./data/cards');
  return globalCardManager.getNextCard();
});

ipcMain.handle('submit-answer', async (event, cardId: string, result: 'know' | 'unknown' | 'later') => {
  const { globalCardManager } = await import('./data/cards');
  globalCardManager.submitAnswer(cardId, result);
  return { success: true };
});

ipcMain.handle('play-tts', async (event, text: string) => {
  // TODO: 实现TTS播放
  console.log(`Playing TTS for: ${text}`);
  return { success: true };
});

ipcMain.handle('quit-app', async () => {
  app.quit();
});

ipcMain.handle('set-ignore-mouse-events', async (event, ignore: boolean) => {
  console.log(`Setting ignore mouse events to: ${ignore}`);
  if (mainWindow) {
    mainWindow.setIgnoreMouseEvents(ignore, { forward: true });
  }
});