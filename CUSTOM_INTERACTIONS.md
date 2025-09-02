# Custom Interaction System / 自定义互动系统

[English](#english) | [中文](#中文)

---

## English

Japanese Pet comes with a powerful custom interaction system that allows users to create their own interaction logic, set trigger conditions, and define pet reaction behaviors.

### Quick Start

#### 1. Configuration File Location
Place your custom configuration files at:
```
src/assets/interactions/
├── default.json        # Default interaction config (system provided)
├── example_custom.json # Example custom config (for reference)
├── custom.json         # User custom config (loaded first)
├── user.json           # Alternative user config file name
└── my_interactions.json # Another alternative user config file name
```

The system will try to load user config files in order: `custom.json` > `user.json` > `my_interactions.json`

#### 2. Basic Configuration Structure

Create a JSON configuration file:

```json
{
  "version": "1.0.0",
  "name": "My Custom Interactions",
  "description": "Personal desktop pet interaction configuration",
  "author": "Your Name",
  "settings": {
    "enabled": true,
    "debugMode": false,
    "maxConcurrentInteractions": 2
  },
  "attributes": [
    {
      "name": "friendship",
      "displayName": "Friendship",
      "type": "number",
      "defaultValue": 0,
      "min": 0,
      "max": 100,
      "description": "Pet's affection toward user"
    }
  ],
  "interactions": [
    {
      "id": "my_custom_click",
      "name": "Special Click Response",
      "description": "Special response when clicked",
      "triggers": [
        {"type": "click"}
      ],
      "reaction": {
        "text": "Hello! Thanks for clicking!",
        "textDuration": 3000,
        "attributes": [
          {
            "name": "friendship",
            "operation": "add",
            "value": 1
          }
        ]
      },
      "weight": 5,
      "enabled": true
    }
  ]
}
```

---

## 中文

Japanese Pet 应用内置了强大的自定义互动系统，允许用户创建自己的互动逻辑、设置触发条件、并定义桌宠的反应行为。

## 快速开始

### 1. 配置文件位置
将自定义配置文件放在以下路径：
```
src/assets/interactions/
├── default.json        # 默认互动配置（系统提供）
├── example_custom.json # 示例自定义配置（参考用）
├── custom.json         # 用户自定义配置（优先加载）
├── user.json           # 替代的用户配置文件名
└── my_interactions.json # 另一个替代的用户配置文件名
```

系统会按顺序尝试加载用户配置文件：`custom.json` > `user.json` > `my_interactions.json`

### 2. 基本配置结构

创建一个 JSON 配置文件：

```json
{
  "version": "1.0.0",
  "name": "我的自定义互动",
  "description": "个人定制的桌宠互动配置",
  "author": "Your Name",
  "settings": {
    "enabled": true,
    "debugMode": false,
    "maxConcurrentInteractions": 2
  },
  "attributes": [
    {
      "name": "friendship",
      "displayName": "友情度",
      "type": "number",
      "defaultValue": 0,
      "min": 0,
      "max": 100,
      "description": "桌宠对用户的好感度"
    }
  ],
  "interactions": [
    {
      "id": "my_custom_click",
      "name": "特殊点击反应",
      "description": "点击时的特殊反应",
      "triggers": [
        {"type": "click"}
      ],
      "reaction": {
        "text": "你好！感谢你的点击！",
        "textDuration": 3000,
        "attributes": [
          {
            "name": "friendship",
            "operation": "add",
            "value": 1
          }
        ]
      },
      "weight": 5,
      "enabled": true
    }
  ]
}
```

## 详细配置说明

### 全局设置 (Settings)

| 属性 | 类型 | 必需 | 默认值 | 说明 |
|-----|------|------|--------|------|
| `enabled` | boolean | 是 | true | 是否启用自定义互动系统 |
| `debugMode` | boolean | 否 | false | 调试模式，在控制台输出详细日志 |
| `maxConcurrentInteractions` | number | 否 | 1 | 同时允许的最大互动数量 |

### 自定义属性 (Attributes)

自定义属性用于存储桌宠的状态数据，可以在触发条件和反应中使用。

```json
{
  "name": "happiness",           // 属性名称（用于代码引用）
  "displayName": "幸福度",       // 显示名称
  "displayNameJa": "幸福度",     // 日文显示名称（可选）
  "type": "number",              // 数据类型：number | string | boolean
  "defaultValue": 50,            // 默认值
  "min": 0,                      // 最小值（仅数字类型）
  "max": 100,                    // 最大值（仅数字类型）
  "description": "桌宠的心情指数"  // 描述（可选）
}
```

### 互动定义 (Interactions)

每个互动包含触发条件和反应行为：

#### 基本结构
```json
{
  "id": "unique_interaction_id",     // 唯一标识符
  "name": "互动名称",                // 显示名称
  "nameJa": "日文名称",              // 日文名称（可选）
  "description": "互动描述",         // 描述
  "descriptionJa": "日文描述",       // 日文描述（可选）
  "triggers": [...],                 // 触发条件数组
  "reaction": {...},                 // 反应行为
  "cooldown": 5000,                  // 冷却时间（毫秒）
  "weight": 3,                       // 权重（影响随机选择概率）
  "enabled": true                    // 是否启用
}
```

## 触发条件 (Triggers)

### 支持的触发类型

#### 1. 点击触发 (click)
```json
{"type": "click"}
```

#### 2. 悬停触发 (hover)
```json
{"type": "hover"}
```

#### 3. 时间触发 (time)
```json
// 时间范围
{"type": "time", "value": "08:00-18:00"}

// 跨午夜时间范围
{"type": "time", "value": "22:00-06:00"}

// 空闲超时（毫秒）
{"type": "time", "value": "idle_timeout_300000"}
```

#### 4. 状态触发 (state)
```json
{"type": "state", "value": "happy"}
```

#### 5. 道具使用触发 (item_use)
```json
{"type": "item_use", "value": "fish"}
```

#### 6. 键盘触发 (keyboard)
```json
{"type": "keyboard", "value": "KeyI"}
```

#### 7. 随机触发 (random)
```json
// 10% 概率触发
{"type": "random", "value": 0.1}
```

#### 8. 自定义条件 (custom)
```json
// 使用属性值作为条件
{"type": "custom", "value": "happiness > 80"}

// 复杂条件
{"type": "custom", "value": "friendship >= 50 && hour >= 9 && hour <= 17"}
```

### 自定义条件语法

支持的变量：
- `happiness`, `energy` 等自定义属性
- `currentState` - 当前桌宠状态
- `hour`, `minute` - 当前时间

支持的运算符：
- 比较：`>`, `<`, `>=`, `<=`, `==`, `!=`
- 逻辑：`&&` (AND), `||` (OR), `!` (NOT)
- 算术：`+`, `-`, `*`, `/`

## 反应行为 (Reactions)

### 文本消息
```json
{
  "text": "显示的文本内容",
  "textJa": "日文文本内容（可选）",
  "textDuration": 3000,              // 显示时间（毫秒）
  "textStyle": {                     // 文本样式（可选）
    "color": "#ff6b35",
    "fontSize": "14px",
    "fontWeight": "bold",
    "fontStyle": "italic",
    "background": "rgba(255, 255, 255, 0.9)",
    "animation": "bounce"            // fade | slide | bounce | shake
  }
}
```

### 状态变化
```json
{
  "state": "happy",                  // 新状态
  "stateDuration": 5000             // 状态持续时间（毫秒）
}
```

### 媒体文件
```json
{
  "media": {
    // 指定单个文件
    "file": "special_reaction.gif",
    
    // 或指定文件夹（随机选择）
    "folder": "happy_reactions",
    
    // 或使用条件映射
    "conditional": [
      {
        "condition": {
          "type": "attribute",
          "value": "happiness > 70"
        },
        "media": "very_happy"
      },
      {
        "condition": {
          "type": "time",
          "value": "22:00-06:00"
        },
        "media": "sleepy_reaction"
      }
    ],
    "fallback": "default_reaction"   // 回退选项
  }
}
```

### 动画效果
```json
{
  "animation": {
    "type": "bounce",                // shake | bounce | rotate | scale | slide | fade | pulse
    "duration": 2000,               // 动画时长（毫秒）
    "intensity": 1.2,               // 强度（适用于scale等）
    "repeat": 3                     // 重复次数
  }
}
```

### 属性变化
```json
{
  "attributes": [
    {
      "name": "happiness",
      "operation": "add",            // set | add | subtract | multiply
      "value": 10,
      "duration": 30000             // 临时变化的持续时间（可选）
    }
  ]
}
```

### 链式反应
```json
{
  "chain": ["other_interaction_id", "another_interaction_id"]
}
```

### 声音效果
```json
{
  "sound": "notification.wav"       // 声音文件名
}
```

## 完整示例

这里是一个包含多种功能的完整配置示例：

```json
{
  "version": "1.0.0",
  "name": "高级自定义互动包",
  "description": "包含多种高级功能的互动配置",
  "author": "Advanced User",
  "settings": {
    "enabled": true,
    "debugMode": true,
    "maxConcurrentInteractions": 3
  },
  "attributes": [
    {
      "name": "friendship",
      "displayName": "友情度",
      "type": "number",
      "defaultValue": 0,
      "min": 0,
      "max": 100,
      "description": "与桌宠的友情度"
    },
    {
      "name": "study_streak",
      "displayName": "连续学习天数",
      "type": "number",
      "defaultValue": 0,
      "min": 0,
      "max": 365,
      "description": "连续学习的天数"
    },
    {
      "name": "mood",
      "displayName": "心情",
      "type": "string",
      "defaultValue": "normal",
      "description": "当前心情状态"
    }
  ],
  "interactions": [
    {
      "id": "morning_greeting",
      "name": "晨间问候",
      "description": "早晨的特殊问候",
      "triggers": [
        {"type": "time", "value": "07:00-09:00"},
        {"type": "click"}
      ],
      "reaction": {
        "text": "早上好！准备开始新的一天学习吗？",
        "textDuration": 4000,
        "textStyle": {
          "color": "#ff9800",
          "fontWeight": "bold",
          "animation": "fade"
        },
        "state": "cheerful",
        "stateDuration": 10000,
        "media": {
          "conditional": [
            {
              "condition": {
                "type": "attribute",
                "value": "friendship >= 50"
              },
              "media": "morning_happy"
            }
          ],
          "fallback": "morning_normal"
        },
        "attributes": [
          {
            "name": "mood",
            "operation": "set",
            "value": "energetic"
          }
        ]
      },
      "cooldown": 21600000,  // 6小时冷却
      "weight": 8,
      "enabled": true
    },
    {
      "id": "friendship_milestone",
      "name": "友情里程碑",
      "description": "友情度达到特定值时的庆祝",
      "triggers": [
        {
          "type": "custom",
          "value": "friendship >= 25 && friendship % 25 == 0"
        }
      ],
      "reaction": {
        "text": "我们的友情又更进一步了！谢谢你一直陪伴我！",
        "textDuration": 5000,
        "textStyle": {
          "color": "#e91e63",
          "fontSize": "16px",
          "fontWeight": "bold",
          "animation": "bounce"
        },
        "state": "euphoric",
        "stateDuration": 8000,
        "media": {
          "file": "friendship_celebration.gif"
        },
        "animation": {
          "type": "scale",
          "duration": 3000,
          "intensity": 1.3,
          "repeat": 2
        },
        "sound": "success.wav",
        "chain": ["show_friendship_bonus"]
      },
      "cooldown": 86400000,  // 24小时冷却
      "weight": 10,
      "enabled": true
    },
    {
      "id": "show_friendship_bonus",
      "name": "友情奖励提示",
      "description": "显示友情奖励信息",
      "triggers": [],  // 只能通过链式反应触发
      "reaction": {
        "text": "友情奖励：解锁了新的互动内容！",
        "textDuration": 3000,
        "textStyle": {
          "background": "rgba(233, 30, 99, 0.1)",
          "color": "#e91e63"
        }
      },
      "enabled": true
    },
    {
      "id": "late_night_study",
      "name": "深夜学习提醒",
      "description": "深夜时提醒用户休息",
      "triggers": [
        {"type": "time", "value": "23:00-02:00"},
        {"type": "random", "value": 0.3}
      ],
      "reaction": {
        "text": "夜深了，要注意休息哦。身体健康比学习更重要！",
        "textDuration": 6000,
        "textStyle": {
          "color": "#9c27b0",
          "fontStyle": "italic"
        },
        "state": "concerned",
        "stateDuration": 10000,
        "media": {
          "folder": "concerned"
        },
        "attributes": [
          {
            "name": "mood",
            "operation": "set",
            "value": "worried",
            "duration": 300000  // 5分钟
          }
        ]
      },
      "cooldown": 3600000,  // 1小时冷却
      "weight": 5,
      "enabled": true
    },
    {
      "id": "keyboard_shortcut_reaction",
      "name": "快捷键反应",
      "description": "按下特定键的反应",
      "triggers": [
        {"type": "keyboard", "value": "KeyH"}  // H键
      ],
      "reaction": {
        "text": "你按了H键！是想要帮助吗？",
        "textDuration": 2500,
        "media": {
          "folder": "questioning"
        },
        "chain": ["show_help_tip"]
      },
      "cooldown": 10000,
      "weight": 2,
      "enabled": true
    },
    {
      "id": "show_help_tip",
      "name": "显示帮助提示",
      "description": "显示随机的帮助提示",
      "triggers": [],
      "reaction": {
        "text": "提示：可以通过右键菜单访问设置！",
        "textDuration": 4000,
        "textStyle": {
          "background": "rgba(76, 175, 80, 0.1)",
          "color": "#4caf50"
        }
      },
      "enabled": true
    }
  ]
}
```

## 文件管理建议

### 媒体文件组织
建议将自定义媒体文件按以下结构组织：

```
src/assets/pet-media/
├── custom_reactions/
│   ├── morning_happy/
│   │   ├── reaction1.gif
│   │   ├── reaction2.png
│   │   └── reaction3.mp4
│   ├── friendship_celebration/
│   │   └── celebration.gif
│   └── concerned/
│       ├── worried1.png
│       └── worried2.gif
└── sounds/
    ├── success.wav
    └── notification.mp3
```

### 配置文件管理
- 使用有意义的 ID 命名互动
- 添加详细的描述和注释
- 定期备份配置文件
- 测试新配置后再启用

## 调试技巧

### 1. 启用调试模式
在配置中设置 `"debugMode": true` 可以在浏览器控制台看到详细的执行日志。

### 2. 测试单个互动
可以暂时设置其他互动为 `"enabled": false` 来单独测试某个互动。

### 3. 检查属性值
在调试模式下，控制台会显示当前所有属性的值。

### 4. 验证条件语法
自定义条件出错时会在控制台显示警告信息。

## 常见问题

### Q: 为什么我的互动没有触发？
A: 检查以下几点：
1. 配置文件是否正确加载（查看控制台日志）
2. 互动是否启用（`enabled: true`）
3. 是否在冷却时间内
4. 触发条件是否满足
5. 权重设置是否过低

### Q: 如何设置互动的优先级？
A: 使用 `weight` 属性设置权重，数值越高优先级越高。

### Q: 媒体文件找不到怎么办？
A: 确保文件路径正确，文件存在于 `src/assets/pet-media/` 目录下。

### Q: 自定义条件语法有什么限制？
A: 目前支持基本的数学和逻辑运算符，不支持复杂的函数调用或正则表达式。

## 更新日志

- **v1.0.0**: 首次发布，支持基本的触发条件和反应行为
- 持续更新中...

---

更多高级功能和示例请参考 `src/assets/interactions/example_custom.json` 和 `src/assets/interactions/default.json` 文件。