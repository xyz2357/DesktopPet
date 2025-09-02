# Custom Interactions Guide / 自定义互动指南

[English](#english) | [中文](#中文)

---

## English

### Quick Start

Japanese Pet now supports custom interactions! You can create your own interaction patterns, triggers, and responses to make your pet more personalized.

#### Step 1: Create Configuration File
Create a new file at: `src/assets/interactions/custom.json`

#### Step 2: Basic Configuration
Here's a simple example to get you started:

```json
{
  "version": "1.0.0",
  "name": "My Custom Interactions",
  "description": "Personal pet interactions",
  "author": "Your Name",
  "settings": {
    "enabled": true,
    "debugMode": false,
    "maxConcurrentInteractions": 2
  },
  "interactions": [
    {
      "id": "hello_click",
      "name": "Hello Click",
      "description": "Pet says hello when clicked",
      "triggers": [
        {"type": "click"}
      ],
      "reaction": {
        "text": "Hello! Nice to see you!",
        "textDuration": 3000
      },
      "enabled": true
    }
  ]
}
```

### Common Use Cases

#### 1. Time-Based Interactions
Make your pet react to different times of day:

```json
{
  "id": "morning_greeting",
  "name": "Morning Greeting",
  "triggers": [
    {"type": "time", "value": "07:00-10:00"},
    {"type": "click"}
  ],
  "reaction": {
    "text": "Good morning! Ready for a productive day?",
    "textDuration": 4000,
    "state": "cheerful",
    "stateDuration": 8000
  }
}
```

#### 2. Keyboard Shortcuts
Create reactions for specific key presses:

```json
{
  "id": "help_key",
  "name": "Help Key Response",
  "triggers": [
    {"type": "keyboard", "value": "KeyH"}
  ],
  "reaction": {
    "text": "You pressed H! Need help?",
    "textDuration": 2500
  }
}
```

#### 3. Custom Attributes
Track custom stats and use them in interactions:

```json
{
  "attributes": [
    {
      "name": "friendship",
      "displayName": "Friendship",
      "type": "number",
      "defaultValue": 0,
      "min": 0,
      "max": 100
    }
  ],
  "interactions": [
    {
      "id": "friendship_boost",
      "triggers": [{"type": "hover"}],
      "reaction": {
        "text": "Thanks for hovering! Our friendship grows!",
        "attributes": [
          {
            "name": "friendship",
            "operation": "add",
            "value": 1
          }
        ]
      }
    }
  ]
}
```

#### 4. Media and Animations
Add visual reactions with custom media files:

```json
{
  "reaction": {
    "text": "I'm so happy!",
    "media": {
      "file": "my_happy_animation.gif"
    },
    "animation": {
      "type": "bounce",
      "duration": 2000,
      "repeat": 3
    }
  }
}
```

### Trigger Types
- `"click"` - When pet is clicked
- `"hover"` - When mouse hovers over pet
- `"time"` - Time-based triggers (e.g., `"08:00-18:00"`)
- `"keyboard"` - Keyboard events (e.g., `"KeyI"`)
- `"random"` - Random chance (e.g., `0.1` for 10%)
- `"custom"` - Custom conditions (e.g., `"friendship >= 50"`)

### Debugging
Set `"debugMode": true` in settings to see detailed logs in the browser console (F12).

---

## 中文

### 快速开始

日本宠物现在支持自定义互动！您可以创建自己的互动模式、触发条件和反应，让您的桌宠更加个性化。

#### 步骤1：创建配置文件
在以下路径创建新文件：`src/assets/interactions/custom.json`

#### 步骤2：基础配置
这里是一个简单的入门示例：

```json
{
  "version": "1.0.0",
  "name": "我的自定义互动",
  "description": "个人桌宠互动配置",
  "author": "你的名字",
  "settings": {
    "enabled": true,
    "debugMode": false,
    "maxConcurrentInteractions": 2
  },
  "interactions": [
    {
      "id": "hello_click",
      "name": "问候点击",
      "description": "点击时桌宠说你好",
      "triggers": [
        {"type": "click"}
      ],
      "reaction": {
        "text": "你好！很高兴见到你！",
        "textDuration": 3000
      },
      "enabled": true
    }
  ]
}
```

### 常用场景

#### 1. 时间触发互动
让你的桌宠根据不同时间段做出反应：

```json
{
  "id": "morning_greeting",
  "name": "晨间问候",
  "triggers": [
    {"type": "time", "value": "07:00-10:00"},
    {"type": "click"}
  ],
  "reaction": {
    "text": "早上好！准备开始充实的一天吗？",
    "textDuration": 4000,
    "state": "cheerful",
    "stateDuration": 8000
  }
}
```

#### 2. 键盘快捷键
为特定按键创建反应：

```json
{
  "id": "help_key",
  "name": "帮助键反应",
  "triggers": [
    {"type": "keyboard", "value": "KeyH"}
  ],
  "reaction": {
    "text": "你按了H键！需要帮助吗？",
    "textDuration": 2500
  }
}
```

#### 3. 自定义属性
跟踪自定义数据并在互动中使用：

```json
{
  "attributes": [
    {
      "name": "friendship",
      "displayName": "友情度",
      "type": "number",
      "defaultValue": 0,
      "min": 0,
      "max": 100
    }
  ],
  "interactions": [
    {
      "id": "friendship_boost",
      "triggers": [{"type": "hover"}],
      "reaction": {
        "text": "谢谢你的悬停！我们的友情增加了！",
        "attributes": [
          {
            "name": "friendship",
            "operation": "add",
            "value": 1
          }
        ]
      }
    }
  ]
}
```

#### 4. 媒体和动画
用自定义媒体文件添加视觉反应：

```json
{
  "reaction": {
    "text": "我好开心！",
    "media": {
      "file": "my_happy_animation.gif"
    },
    "animation": {
      "type": "bounce",
      "duration": 2000,
      "repeat": 3
    }
  }
}
```

### 触发类型说明
- `"click"` - 点击桌宠时
- `"hover"` - 鼠标悬停在桌宠上时
- `"time"` - 时间触发（如 `"08:00-18:00"`）
- `"keyboard"` - 键盘事件（如 `"KeyI"`）
- `"random"` - 随机概率（如 `0.1` 表示10%）
- `"custom"` - 自定义条件（如 `"friendship >= 50"`）

### 调试技巧
在设置中设置 `"debugMode": true`，然后在浏览器控制台（F12）中查看详细日志。

---

## Advanced Examples / 高级示例

### Complex Time-Based Interaction / 复杂时间互动
```json
{
  "id": "late_night_reminder",
  "name": "Late Night Reminder / 深夜提醒",
  "triggers": [
    {"type": "time", "value": "23:00-02:00"},
    {"type": "random", "value": 0.3}
  ],
  "reaction": {
    "text": "It's getting late! Don't forget to rest. / 夜深了！别忘了休息哦。",
    "textDuration": 6000,
    "textStyle": {
      "color": "#9c27b0",
      "fontStyle": "italic"
    },
    "state": "concerned",
    "stateDuration": 10000
  },
  "cooldown": 3600000,
  "weight": 5
}
```

### Friendship Milestone System / 友情里程碑系统
```json
{
  "attributes": [
    {
      "name": "friendship",
      "displayName": "Friendship / 友情度",
      "type": "number",
      "defaultValue": 0,
      "min": 0,
      "max": 100
    }
  ],
  "interactions": [
    {
      "id": "friendship_milestone",
      "name": "Friendship Milestone / 友情里程碑",
      "triggers": [
        {
          "type": "custom",
          "value": "friendship >= 25 && friendship % 25 == 0"
        }
      ],
      "reaction": {
        "text": "Our friendship has grown stronger! Thank you! / 我们的友情更进一步了！谢谢！",
        "textDuration": 5000,
        "textStyle": {
          "color": "#e91e63",
          "fontWeight": "bold",
          "animation": "bounce"
        },
        "state": "euphoric",
        "stateDuration": 8000,
        "animation": {
          "type": "scale",
          "duration": 3000,
          "intensity": 1.3
        }
      },
      "cooldown": 86400000,
      "weight": 10
    }
  ]
}
```

### Study Encouragement System / 学习鼓励系统
```json
{
  "interactions": [
    {
      "id": "study_encouragement",
      "name": "Study Encouragement / 学习鼓励",
      "triggers": [
        {"type": "time", "value": "idle_timeout_300000"}
      ],
      "reaction": {
        "text": "Ready to continue studying Japanese? / 准备继续学习日语吗？",
        "textDuration": 4000,
        "textStyle": {
          "color": "#4caf50",
          "fontWeight": "bold"
        },
        "chain": ["show_study_tip"]
      },
      "cooldown": 600000
    },
    {
      "id": "show_study_tip",
      "name": "Study Tip / 学习小贴士",
      "triggers": [],
      "reaction": {
        "text": "Tip: Consistency is key! / 小贴士：坚持是关键！",
        "textDuration": 3000,
        "textStyle": {
          "background": "rgba(76, 175, 80, 0.1)"
        }
      }
    }
  ]
}
```

## File Organization / 文件组织

### Media Files / 媒体文件
Place your custom media files in: / 将自定义媒体文件放在：
```
src/assets/pet-media/
├── custom_reactions/
│   ├── happy/
│   │   ├── happy1.gif
│   │   └── happy2.png
│   └── excited/
│       └── excited.mp4
```

### Sound Files / 声音文件  
```
src/assets/sounds/
├── success.wav
└── notification.mp3
```

## Troubleshooting / 故障排除

### Common Issues / 常见问题

**Q: My interactions aren't triggering / 我的互动没有触发**
- Check if `"enabled": true` is set / 检查是否设置了 `"enabled": true`
- Verify the file is named correctly: `custom.json` / 确认文件名正确：`custom.json`
- Enable debug mode to see console logs / 启用调试模式查看控制台日志

**Q: Media files not loading / 媒体文件加载失败**
- Ensure files are in `src/assets/pet-media/` / 确保文件在 `src/assets/pet-media/` 目录
- Check file names match exactly / 检查文件名完全匹配
- Supported formats: PNG, JPG, GIF, MP4, WEBP / 支持的格式：PNG, JPG, GIF, MP4, WEBP

**Q: Custom conditions not working / 自定义条件不起作用**
- Use simple operators: `>`, `<`, `>=`, `<=`, `==`, `!=` / 使用简单运算符
- Reference attributes by name: `friendship`, `happiness` / 通过名称引用属性
- Check syntax carefully / 仔细检查语法

### Getting Help / 获取帮助

1. Enable debug mode: `"debugMode": true` / 启用调试模式
2. Open browser console (F12) / 打开浏览器控制台
3. Look for error messages / 查看错误信息
4. Check the complete documentation in `CUSTOM_INTERACTIONS.md` / 查看完整文档

---

**Happy customizing! / 祝您定制愉快！** 🎭✨