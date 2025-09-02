# Japanese Pet MVP / 日语学习桌宠 MVP

[English](#english) | [中文](#中文)

---

## English

A desktop Japanese learning application built with Electron + React + TypeScript. Features an adorable desktop pet that accompanies users in fragmented Japanese language learning.

### ✅ Implemented Features

- **Desktop Pet Window**: Always-on-top draggable semi-transparent window
- **Smart Learning Cards**: Display Japanese vocabulary and phrases with:
  - Japanese text
  - Kana annotations  
  - Romaji
  - Chinese meanings
  - Example sentences (optional)
- **Three-button Interaction**:
  - ✅ Know it: Reduce repetition frequency, occasional review
  - 😵 Don't know: Add to review pool, increase repetition
  - ⏰ Later: Reappear after 5 minutes delay
- **Hard-coded Vocabulary**: Built-in N5 level common words and phrases
- **Simplified SRS**: Spaced Repetition System based on answer results
- **Timed Push**: Automatically pop up new learning cards every 60 seconds

### 🚧 Features to Implement

- **TTS Voice Playback**: Click play button to hear Japanese pronunciation
- **Tray Menu**: Right-click menu with show/hide, settings, exit
- **Daily Close**: One-click to pause all notifications for the day
- **User Settings**: Adjust push frequency, silent mode, etc.

### Technical Stack

#### Frontend
- **Electron**: Cross-platform desktop application framework
- **React 19**: UI component library
- **TypeScript**: Type-safe JavaScript
- **Webpack**: Module bundler

#### Data Management
- **Local Data**: Hard-coded vocabulary data for quick MVP validation
- **Simplified SRS**: Learning progress management based on answer results
- **IPC Communication**: Data exchange between main and renderer processes

### Project Structure

```
japanese-pet/
├── src/
│   ├── components/          # React components
│   │   ├── Pet.tsx         # Pet main component
│   │   ├── StudyCard.tsx   # Study card component
│   │   ├── ItemPanel.tsx   # Item inventory panel
│   │   ├── ContextMenu.tsx # Right-click context menu
│   │   └── *.css          # Component styles
│   ├── data/
│   │   ├── cards/          # Card data by type
│   │   │   ├── words.json  # Word cards
│   │   │   ├── sentences.json # Sentence cards
│   │   │   ├── examples.json # Example cards
│   │   │   ├── grammar.json # Grammar cards
│   │   │   ├── images.json # Image cards
│   │   │   ├── audio.json  # Audio cards
│   │   │   ├── arrange.json # Arrange cards
│   │   │   └── index.ts    # Data management
│   │   ├── cards.ts        # Card manager (legacy)
│   │   └── items.ts        # Item definitions
│   ├── utils/              # Utility modules
│   │   ├── itemManager.ts  # Item system manager
│   │   ├── mediaManager.ts # Pet media management
│   │   ├── autonomousBehavior.ts # AI behavior system
│   │   ├── mouseTracker.ts # Mouse tracking
│   │   ├── interactionManager.ts # User interactions
│   │   ├── dragDropManager.ts # Drag & drop system
│   │   ├── itemImageManager.ts # Item image loading
│   │   └── customInteractionManager.ts # Custom interactions
│   ├── types/
│   │   ├── card.ts         # Card type definitions
│   │   ├── item.ts         # Item type definitions
│   │   └── customInteraction.ts # Custom interaction types
│   ├── config/
│   │   ├── appConfig.ts    # Application configuration
│   │   └── petTexts.ts     # Pet dialog texts
│   ├── hooks/              # React hooks
│   ├── App.tsx            # Main application component
│   ├── main.ts            # Electron main process
│   ├── preload.ts         # Preload script
│   └── renderer.tsx       # Renderer process entry
├── tests/                  # Test suite
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── e2e/               # End-to-end tests
├── dist/                   # Build output directory
├── public/                 # Static assets
└── webpack.config.js       # Webpack configuration
```

### Quick Start

#### Install Dependencies
```bash
npm install
```

#### Development Run
```bash
npm start
```

#### Build Application
```bash
npm run build
```

#### Package Release
```bash
npm run package
```

### Usage Instructions

1. **Start Application**: Run `npm start` and a small pet will appear in the desktop corner
2. **Active Learning**: Click the pet to manually get new learning cards
3. **Auto Push**: Application automatically pops up new learning content every 60 seconds
4. **Learning Feedback**: Choose "Know it", "Don't know", or "Later" based on mastery
5. **Drag Movement**: Pet can be freely dragged to any position on desktop

### Data Description

Current system includes a comprehensive learning card database with multiple card types:

**Card Types Available**:
- **Word Cards** (words.json) - Japanese vocabulary with kana, romaji, and meanings
- **Sentence Cards** (sentences.json) - Common phrases and expressions  
- **Example Cards** (examples.json) - Usage examples in context
- **Grammar Cards** (grammar.json) - Grammar patterns and rules
- **Image Cards** (images.json) - Visual learning cards
- **Audio Cards** (audio.json) - Pronunciation practice cards
- **Arrange Cards** (arrange.json) - Sentence construction exercises

**Additional Features**:
- JLPT level classification (N5-N1)
- Difficulty rating system
- Category-based organization
- Related card recommendations

### Development Plan

#### Phase 2 Enhanced Features
- [ ] Web Speech API integration for TTS
- [ ] Tray menu and system integration
- [ ] User settings persistence
- [ ] Learning statistics and progress display

#### Phase 3 Advanced Features
- [ ] Cloud vocabulary database
- [ ] Personalized recommendation algorithm
- [ ] Voice recognition practice
- [ ] Community features

### Technical Debt

- [ ] Add unit tests
- [ ] Error boundaries and exception handling
- [ ] Performance optimization and memory management
- [ ] Bundle size optimization
- [ ] Cross-platform compatibility testing

### Contributing

Issues and Pull Requests are welcome!

### License

MIT License

---

## 中文

一个基于 Electron + React + TypeScript 的日语学习桌面应用，通过可爱的桌宠陪伴用户进行碎片化日语学习。

## 功能特性

### ✅ 已实现功能

- **桌宠悬浮窗**: 常驻桌面的可拖拽半透明窗口
- **智能学习卡片**: 显示日语词汇和短句，包含：
  - 日语原文
  - 假名标注
  - 罗马音
  - 中文释义
  - 例句（可选）
- **三按钮交互**: 
  - ✅ 会了：降低复现频率，偶尔复习
  - 😵 不会：加入复习池，增加复现次数
  - ⏰ 稍后：延迟5分钟后重新出现
- **Hard-coded 词汇库**: 内置 N5 级别的常用词汇和短句
- **简化版 SRS**: 基于答题结果的间隔重复系统
- **定时推送**: 每60秒自动弹出新的学习卡片

### 🚧 待实现功能

- **TTS 语音播放**: 点击播放按钮播放日语发音
- **托盘菜单**: 右键菜单，支持显示/隐藏、设置、退出
- **今日打烊**: 一键暂停当天所有推送
- **用户设置**: 推送频率调整、静音模式等

## 技术架构

### 前端
- **Electron**: 跨平台桌面应用框架
- **React 19**: UI 组件库
- **TypeScript**: 类型安全的 JavaScript
- **Webpack**: 模块打包工具

### 数据管理
- **本地数据**: Hard-coded 词汇数据，便于 MVP 快速验证
- **简化 SRS**: 基于答题结果的学习进度管理
- **IPC 通信**: 主进程与渲染进程的数据交换

## 项目结构

```
japanese-pet/
├── src/
│   ├── components/          # React 组件
│   │   ├── Pet.tsx         # 桌宠主体组件
│   │   ├── StudyCard.tsx   # 学习卡片组件
│   │   ├── ItemPanel.tsx   # 道具面板
│   │   ├── ContextMenu.tsx # 右键上下文菜单
│   │   └── *.css          # 组件样式
│   ├── data/
│   │   ├── cards/          # 按类型分类的卡片数据
│   │   │   ├── words.json  # 单词卡
│   │   │   ├── sentences.json # 句子卡
│   │   │   ├── examples.json # 例句卡
│   │   │   ├── grammar.json # 语法卡
│   │   │   ├── images.json # 图片卡
│   │   │   ├── audio.json  # 音频卡
│   │   │   ├── arrange.json # 拖拽卡
│   │   │   └── index.ts    # 数据管理
│   │   ├── cards.ts        # 卡片管理器（旧版）
│   │   └── items.ts        # 道具定义
│   ├── utils/              # 工具模块
│   │   ├── itemManager.ts  # 道具系统管理器
│   │   ├── mediaManager.ts # 桌宠媒体管理
│   │   ├── autonomousBehavior.ts # AI行为系统
│   │   ├── mouseTracker.ts # 鼠标跟踪
│   │   ├── interactionManager.ts # 用户交互
│   │   ├── dragDropManager.ts # 拖拽系统
│   │   ├── itemImageManager.ts # 道具图像加载
│   │   └── customInteractionManager.ts # 自定义互动
│   ├── types/
│   │   ├── card.ts         # 卡片类型定义
│   │   ├── item.ts         # 道具类型定义
│   │   └── customInteraction.ts # 自定义互动类型
│   ├── config/
│   │   ├── appConfig.ts    # 应用配置
│   │   └── petTexts.ts     # 桌宠对话文本
│   ├── hooks/              # React hooks
│   ├── App.tsx            # 主应用组件
│   ├── main.ts            # Electron 主进程
│   ├── preload.ts         # 预加载脚本
│   └── renderer.tsx       # 渲染进程入口
├── tests/                  # 测试套件
│   ├── unit/              # 单元测试
│   ├── integration/       # 集成测试
│   └── e2e/               # 端到端测试
├── dist/                   # 构建输出目录
├── public/                 # 静态资源
└── webpack.config.js       # Webpack 配置
```

## 快速开始

### 安装依赖
```bash
npm install
```

### 开发运行
```bash
npm start
```

### 构建应用
```bash
npm run build
```

### 打包发布
```bash
npm run package
```

## 使用说明

1. **启动应用**: 运行 `npm start` 后会在桌面角落出现一个小桌宠
2. **主动学习**: 点击桌宠可以手动获取新的学习卡片
3. **自动推送**: 应用会每60秒自动弹出新的学习内容
4. **学习反馈**: 根据掌握情况选择"会了"、"不会"或"稍后"
5. **拖拽移动**: 桌宠可以自由拖拽到桌面任意位置

## 数据说明

当前系统包含完整的学习卡片数据库，支持多种卡片类型：

**可用卡片类型**：
- **单词卡** (words.json) - 日语词汇，包含假名、罗马音和释义
- **句子卡** (sentences.json) - 常用短语和表达
- **例句卡** (examples.json) - 上下文中的使用示例
- **语法卡** (grammar.json) - 语法模式和规则
- **图片卡** (images.json) - 视觉学习卡片
- **音频卡** (audio.json) - 发音练习卡片
- **拖拽卡** (arrange.json) - 句子构造练习

**附加功能**：
- JLPT等级分类 (N5-N1)
- 难度评级系统
- 基于类别的组织
- 相关卡片推荐

## 开发计划

### Phase 2 增强功能
- [ ] Web Speech API 集成 TTS
- [ ] 托盘菜单和系统集成
- [ ] 用户设置持久化
- [ ] 学习统计和进度展示

### Phase 3 高级功能
- [ ] 云端词汇库
- [ ] 个性化推荐算法
- [ ] 语音识别练习
- [ ] 社区功能

## 技术债务

- [ ] 添加单元测试
- [ ] 错误边界和异常处理
- [ ] 性能优化和内存管理
- [ ] 打包体积优化
- [ ] 跨平台兼容性测试

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License