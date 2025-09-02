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
│   │   └── *.css          # Component styles
│   ├── data/
│   │   └── cards.ts       # Vocabulary data and management logic
│   ├── types/
│   │   └── card.ts        # TypeScript type definitions
│   ├── App.tsx            # Main application component
│   ├── main.ts            # Electron main process
│   ├── preload.ts         # Preload script
│   └── renderer.tsx       # Renderer process entry
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

Current MVP contains 10 learning items:

**Vocabulary (7 items)**
- 勉強 (benkyou) - study
- 友達 (tomodachi) - friend
- 仕事 (shigoto) - work  
- 美味しい (oishii) - delicious
- 大きい (ookii) - big
- 先生 (sensei) - teacher
- 学校 (gakkou) - school

**Phrases (3 items)**
- おはようございます - Good morning
- ありがとうございます - Thank you
- すみません - Sorry/Excuse me

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
│   │   └── *.css          # 组件样式
│   ├── data/
│   │   └── cards.ts       # 词汇数据和管理逻辑
│   ├── types/
│   │   └── card.ts        # TypeScript 类型定义
│   ├── App.tsx            # 主应用组件
│   ├── main.ts            # Electron 主进程
│   ├── preload.ts         # 预加载脚本
│   └── renderer.tsx       # 渲染进程入口
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

当前 MVP 包含 10 个学习项目：

**词汇 (7个)**
- 勉強 (benkyou) - 学习
- 友達 (tomodachi) - 朋友  
- 仕事 (shigoto) - 工作
- 美味しい (oishii) - 好吃的
- 大きい (ookii) - 大的
- 先生 (sensei) - 老师
- 学校 (gakkou) - 学校

**短句 (3个)**
- おはようございます - 早上好
- ありがとうございます - 谢谢
- すみません - 对不起/不好意思

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