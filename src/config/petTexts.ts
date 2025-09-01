/**
 * 桌宠UI文本配置
 * 统一管理桌宠相关的所有显示文本
 */

export const PetTexts = {
  // 桌宠状态文字
  bubbleTexts: {
    thinking: '嗯...',
    ready: '又想干什么！',
    dragging: '放开我！',
    hover: '咕...',
    congrats: '啊啊！....',
  },

  // 桌宠交互提示
  interactions: {
    tooltip: '随意玩弄她吧'
  },

  // 右键菜单文字
  contextMenu: {
    quit: '放置Play'
  },

  // 错误和警告信息
  errors: {
    quitFailed: 'Failed to quit app',
    mediaLoadFailed: '媒体文件加载失败，状态',
    pixelReadFailed: '无法读取像素数据'
  },

  // 调试信息（开发环境使用）
  debug: {
    mediaInit: '获取媒体文件，当前状态',
    mediaNotFound: '没有找到状态的媒体文件，使用占位图'
  }
} as const;

// 类型定义
export type PetTextsType = typeof PetTexts;