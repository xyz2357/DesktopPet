/**
 * 应用程序统一配置文件
 * 包含所有硬编码的常量和配置项
 */

export const AppConfig = {
  /**
   * 宠物相关配置
   */
  pet: {
    /** 宠物默认位置 */
    defaultPosition: {
      x: 20,
      y: 60
    },
    
    /** 宠物尺寸限制 */
    size: {
      /** 最大宽度 (px) */
      maxWidth: 400,
      /** 最大高度 (px) */
      maxHeight: 400,
      /** 最小宽度 (px) */
      minWidth: 80,
      /** 最小高度 (px) */
      minHeight: 80,
      /** 默认尺寸 (px) */
      default: {
        width: 120,
        height: 120
      }
    },
    
    /** 交互配置 */
    interaction: {
      /** 拖拽检测阈值 (px) - 超过此距离才认为是拖拽 */
      dragThreshold: 5,
      /** 透明度检测阈值 (0-255) - 低于此值的像素被视为透明 */
      alphaThreshold: 50,
      /** 表情符号相对大小比例 */
      emojiSizeRatio: 0.5
    },
    
    /** 动画配置 */
    animation: {
      /** 悬停时的缩放比例 */
      hoverScale: 1.1,
      /** 旋转角度 (度) */
      hoverRotation: 15,
      /** 弹跳动画的垂直偏移 (px) */
      bounceOffset: {
        main: -10,
        secondary: -5
      },
      /** 脉冲动画的缩放比例 */
      pulseScale: 1.05
    },
    
    /** 媒体文件配置 */
    media: {
      /** 支持的媒体格式 */
      supportedFormats: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'webm'],
      /** 视频播放配置 */
      video: {
        /** 静音播放 */
        muted: true,
        /** 循环播放 */
        loop: true,
        /** 自动播放 */
        autoplay: true,
        /** 显示控制条 */
        controls: false
      },
      /** 随机选择配置 */
      randomSelection: {
        /** 是否启用随机选择 */
        enabled: true,
        /** 每个状态切换时都重新选择 */
        changeOnStateSwitch: false,
        /** 定时随机切换间隔 (ms)，0表示不定时切换 */
        autoChangeInterval: 0
      },
      /** 媒体文件路径配置 */
      paths: {
        /** 默认媒体文件夹 */
        baseDirectory: '/assets/pet-media/',
        /** 各状态对应的子文件夹 */
        stateDirectories: {
          idle: 'idle/',
          hover: 'hover/',
          active: 'active/',
          loading: 'loading/'
        }
      }
    }
  },

  /**
   * 学习卡片配置
   */
  studyCard: {
    /** 卡片尺寸 */
    size: {
      /** 最小宽度 (px) */
      minWidth: 320,
      /** 最大宽度 (px) */
      maxWidth: 400,
      /** 音频区域高度 (px) */
      audioHeight: 120,
      /** 按钮最小高度 (px) */
      buttonMinHeight: 48
    },
    
    /** 自动提交延迟时间 (ms) */
    autoSubmitDelay: {
      /** 音频卡片 */
      audio: 1500,
      /** 拖拽排列卡片 */
      arrange: 2000
    },
    
    /** 工具提示配置 */
    tooltip: {
      /** 防抖延迟 (ms) */
      debounceDelay: 100,
      /** 垂直偏移 (px) */
      verticalOffset: -10,
      /** z-index */
      zIndex: 1001
    },

    /** 字体大小配置 (px) */
    fontSize: {
      /** 卡片标题 */
      title: 24,
      /** 日文内容 */
      japanese: 32,
      /** 中文翻译 */
      chinese: 24,
      /** 提示文本 */
      hint: 18,
      /** 按钮文字 */
      button: 16,
      /** 小号按钮文字 */
      buttonSmall: 14,
      /** 说明文字 */
      description: 14,
      /** 选择项文字 */
      choice: 16,
      /** 错误提示 */
      error: 14,
      /** 成功提示 */
      success: 20,
      /** 音频文字 */
      audio: 20,
      /** 标签文字 */
      tag: 12
    }
  },

  /**
   * 上下文菜单配置
   */
  contextMenu: {
    /** 最小宽度 (px) */
    minWidth: 120,
    /** 菜单项字体大小 (px) */
    fontSize: 14,
    /** 图标宽度 (px) */
    iconWidth: 16,
    
    /** 动画配置 */
    animation: {
      /** 显示时透明度 */
      visibleOpacity: 1,
      /** 隐藏时透明度 */
      hiddenOpacity: 0
    }
  },

  /**
   * 学习系统配置
   */
  learning: {
    /** 卡片管理 */
    cards: {
      /** 错误后再次出现的延迟时间 (ms) */
      errorRetryDelay: 5 * 60 * 1000, // 5分钟
      /** 复习延迟时间 (ms) */
      reviewDelay: 30 * 60 * 1000, // 30分钟
      /** 错误卡片再次加入复习池的概率 */
      errorRetryProbability: 0.5, // 50%
      /** 复习卡片的概率 */
      reviewProbability: 0.2, // 20%
      /** 相关卡片推荐数量 */
      relatedCardsLimit: 5,
      /** 同类型卡片比例 */
      sameTypeRatio: 0.5 // Math.floor(limit / 2)
    },
    
    /** 自动提醒配置 */
    reminder: {
      /** 提醒间隔时间 (ms) */
      interval: 60000 // 60秒
    }
  },

  /**
   * 窗口配置
   */
  window: {
    /** 主窗口默认位置 */
    defaultPosition: {
      x: 0,
      y: 0
    }
  },

  /**
   * 媒体处理配置
   */
  media: {
    /** 预加载配置 */
    preloading: {
      /** 是否预加载所有媒体文件 */
      enabled: true,
      /** 预加载的最大文件数量 */
      maxFiles: 20,
      /** 预加载优先级：'idle' > 'hover' > 'active' > 'loading' */
      priority: ['idle', 'hover', 'active', 'loading']
    },
    /** 缓存配置 */
    caching: {
      /** 是否启用缓存 */
      enabled: true,
      /** 缓存超时时间 (ms) */
      ttl: 10 * 60 * 1000, // 10分钟
      /** 最大缓存项数 */
      maxItems: 50
    },
    /** 错误处理 */
    errorHandling: {
      /** 加载失败重试次数 */
      maxRetries: 3,
      /** 重试间隔 (ms) */
      retryDelay: 1000,
      /** 加载超时时间 (ms) */
      loadTimeout: 5000
    }
  },

  /**
   * 动画持续时间配置 (ms)
   */
  animation: {
    /** 快速动画 */
    fast: 150,
    /** 普通动画 */
    normal: 300,
    /** 慢速动画 */
    slow: 500,
    /** 卡片滑入动画 */
    slideIn: 300,
    /** 淡入动画 */
    fadeIn: 200,
    /** 工具提示动画 */
    tooltip: 150
  },

  /**
   * 颜色和样式配置
   */
  style: {
    /** 边框宽度 (px) */
    borderWidth: 5,
    /** 行高 */
    lineHeight: 1.5,
    /** 透明度 */
    opacity: {
      /** 半透明 */
      half: 0.5,
      /** 完全不透明 */
      full: 1,
      /** 完全透明 */
      none: 0
    }
  },

  /**
   * 可访问性配置
   */
  accessibility: {
    /** 焦点选择器 */
    focusableSelector: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  }
};

// 导出类型定义
export type AppConfigType = typeof AppConfig;

// 导出常用的配置子集
export const PetConfig = AppConfig.pet;
export const StudyCardConfig = AppConfig.studyCard;
export const LearningConfig = AppConfig.learning;
export const AnimationConfig = AppConfig.animation;