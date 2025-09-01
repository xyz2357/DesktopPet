# Pet Media Files

这个文件夹包含桌宠的媒体文件，按状态分组：

## 目录结构

```
pet-media/
├── idle/          # 闲置状态媒体文件
├── hover/         # 悬停状态媒体文件
├── active/        # 激活状态媒体文件
├── loading/       # 加载状态媒体文件
├── congrats/      # 祝贺状态媒体文件
├── walking/       # 行走状态媒体文件 (PRD v0.3新增)
├── sleeping/      # 睡眠状态媒体文件 (PRD v0.3新增)
├── observing/     # 观察状态媒体文件 (PRD v0.3新增)
├── yawning/       # 打哈欠状态媒体文件 (PRD v0.3新增)
└── stretching/    # 伸展状态媒体文件 (PRD v0.3新增)
```

## 支持的格式

- **图片**: PNG, JPG, JPEG, WebP
- **动画**: GIF
- **视频**: MP4, WebM

## 文件命名

- 文件名可以任意，系统会自动扫描所有支持格式的文件
- 建议使用描述性名称，如: `pet-happy.gif`, `pet-thinking.mp4`

## 替换Placeholder

当前文件都是placeholder，请替换为实际的媒体文件：

1. **图片文件**: 直接替换为相应格式的真实图片
2. **视频文件**: 
   - 建议尺寸: 200x200像素以下
   - 建议时长: 1-5秒
   - 格式: MP4 (H.264) 或 WebM
   - 静音，因为桌宠会设置muted=true

## 随机选择

- 系统会随机选择对应状态文件夹中的媒体文件
- 可以放置多个文件增加变化性
- 通过配置文件可以控制随机行为

## 自主行为状态 (PRD v0.3)

新增的自主行为状态会让桌宠更加生动：

- **walking**: 桌宠会在屏幕上行走移动 (持续8秒)
- **sleeping**: 长时间无交互后进入睡眠 (持续15秒)
- **observing**: 好奇地四处观察 (持续5秒)
- **yawning**: 困倦时打哈欠 (持续2秒)
- **stretching**: 伸展放松身体 (持续3秒)

这些状态会自动触发，让桌宠显得更"活着"。

## 配置选项

在 `src/config/appConfig.ts` 中可以调整：
- `randomSelection.enabled`: 是否启用随机选择
- `randomSelection.changeOnStateSwitch`: 状态切换时是否重新选择
- `video.*`: 视频播放相关配置
- `states.autonomous.*`: 自主行为的时间间隔和持续时间
