# Supported Interactions List / 支持的互动列表

[English](#english) | [中文](#中文)

---

## English

### 🎭 Default Custom Interactions

The Japanese Pet comes with these built-in custom interactions:

#### 1. **Morning Greeting** 🌅
- **Trigger**: Time (6:00-10:00 AM) + Click
- **Effect**: Shows morning greeting, increases happiness temporarily
- **Message**: "おはよう！今日も一緒に日本語を勉強しよう！"
- **Cooldown**: 1 hour
- **Special**: Different animations based on happiness level

#### 2. **Evening Sleepy** 😴
- **Trigger**: Time (9:00 PM - 11:59 PM) + Random chance
- **Effect**: Shows sleepy behavior, decreases energy slightly
- **Message**: "眠くなってきた... もう寝る時間かな？"
- **State**: Changes to "sleepy" for 10 seconds

#### 3. **High Energy Play** ⚡
- **Trigger**: Click (when energy is high)
- **Effect**: Playful animation, bounce effect
- **Message**: "元気いっぱい！一緒に遊ぼう！"
- **Special**: Extra energetic animation when energy ≥ 80

#### 4. **Rain Day Reaction** 🌧️
- **Trigger**: Hover + Weather condition (custom)
- **Effect**: Contemplative mood, relaxed state
- **Message**: "雨の音が聞こえる... 静かで落ち着くね"
- **Duration**: 15 seconds of relaxed state

#### 5. **Study Encouragement** 📚
- **Trigger**: Idle timeout (5 minutes)
- **Effect**: Encourages studying, chains to study tip
- **Message**: "少し休憩した？また一緒に日本語を勉強しよう！"
- **Cooldown**: 10 minutes

#### 6. **Study Tip Display** 💡
- **Trigger**: Chained from Study Encouragement
- **Effect**: Shows helpful study advice
- **Message**: "コツ: 毎日少しずつでも続けることが大切！"

#### 7. **Keyboard Shortcut (I Key)** ⌨️
- **Trigger**: Press 'I' key
- **Effect**: Mentions inventory, excited animation
- **Message**: "道具箱を開くよ！何か使ってみる？"
- **Cooldown**: 5 seconds

#### 8. **Congratulations Combo** 🎉
- **Trigger**: Custom condition (5+ consecutive correct answers)
- **Effect**: Special celebration with sound, scale animation
- **Message**: "すごい！連続正解！君は日本語の天才だ！"
- **Cooldown**: 30 minutes
- **Special**: Large happiness boost (25 points) for 2 minutes

---

### 🎁 Item-Based Interactions

These interactions are triggered when using items from the inventory:

#### Food Items 🍽️

1. **Fish** 🐟
   - **Effect**: +20 happiness, eating animation
   - **Message**: "おいしい！"
   - **Duration**: 5 seconds

2. **Milk** 🥛
   - **Effect**: +30 energy, drinking animation
   - **Message**: "ごくごく..."
   - **Duration**: 3 seconds

3. **Cake** 🍰
   - **Effect**: +50 happiness, +40 mood boost
   - **Message**: "やったー！"
   - **Duration**: 10 seconds (happiness), 15 seconds (mood)

#### Toy Items 🧸

4. **Ball** ⚽
   - **Effect**: Playful state, energy boost
   - **Message**: "遊ぼう！"
   - **Animation**: Playing animation

5. **Yarn** 🧶
   - **Effect**: Hunting instincts, playful behavior
   - **Message**: "これは何だ？"
   - **Animation**: Hunting/examining

6. **Toy Mouse** 🐭
   - **Effect**: Hunting mode activation
   - **Message**: "狩りの時間だ！"
   - **Animation**: Hunting behavior

#### Tool Items 🔧

7. **Brush** 🪒
   - **Effect**: Relaxation, comfort increase
   - **Message**: "気持ちいい..."
   - **Animation**: Relaxed state

8. **Thermometer** 🌡️
   - **Effect**: Health check, examining state
   - **Message**: "健康チェック中..."
   - **Animation**: Examining animation

#### Medicine Items 💊

9. **Vitamin** 💊
   - **Effect**: Health boost, energy restoration
   - **Message**: "元気になった！"
   - **Duration**: Long-term health benefit

#### Decoration Items ✨

10. **Flower** 🌸
    - **Effect**: Admiring behavior, beauty appreciation
    - **Message**: "きれい..."
    - **Animation**: Admiring animation

11. **Crown** 👑
    - **Effect**: Royal behavior, confidence boost
    - **Message**: "王様気分！"
    - **Animation**: Royal posture

#### Special Items 🎪

12. **Magic Wand** 🪄
    - **Effect**: Magical state, special powers
    - **Message**: "アブラカダブラ！"
    - **Animation**: Sparkle effects
    - **Duration**: 3 minutes magical powers

13. **Rainbow** 🌈
    - **Effect**: Ultimate happiness + energy + mood boost
    - **Message**: "最高の気分！"
    - **Animation**: Rainbow dance
    - **Duration**: 20 seconds euphoric + 5 minutes rainbow aura

---

### 🎯 System Interactions

Built-in system responses that don't require configuration:

- **Click**: Basic interaction, happiness increase
- **Hover**: Attention response, eye tracking
- **Drag**: Movement around screen
- **Right-click**: Context menu with settings
- **Double-click**: Special reactions and easter eggs
- **Idle behavior**: Autonomous activities (walking, sleeping, observing)

---

## 中文

### 🎭 默认自定义互动

日本宠物内置以下自定义互动：

#### 1. **晨间问候** 🌅
- **触发条件**: 时间（上午6:00-10:00）+ 点击
- **效果**: 显示晨间问候，暂时增加幸福度
- **消息**: "おはよう！今日も一緒に日本語を勉強しよう！"
- **冷却时间**: 1小时
- **特殊**: 根据幸福度显示不同动画

#### 2. **夜晚困倦** 😴
- **触发条件**: 时间（晚上9:00-11:59）+ 随机概率
- **效果**: 显示困倦行为，轻微减少能量
- **消息**: "眠くなってきた... もう寝る时间かな？"
- **状态**: 变为"sleepy"状态10秒

#### 3. **高能量游戏** ⚡
- **触发条件**: 点击（当能量较高时）
- **效果**: 游戏动画，弹跳效果
- **消息**: "元気いっぱい！一緒に遊ぼう！"
- **特殊**: 能量≥80时显示额外活跃动画

#### 4. **雨天反应** 🌧️
- **触发条件**: 悬停 + 天气条件（自定义）
- **效果**: 沉思心情，放松状态
- **消息**: "雨の音が聞こえる... 静かで落ち着くね"
- **持续时间**: 15秒放松状态

#### 5. **学习鼓励** 📚
- **触发条件**: 空闲超时（5分钟）
- **效果**: 鼓励学习，连锁触发学习提示
- **消息**: "少し休憩した？また一緒に日本語を勉強しよう！"
- **冷却时间**: 10分钟

#### 6. **学习提示显示** 💡
- **触发条件**: 学习鼓励的连锁反应
- **效果**: 显示有用的学习建议
- **消息**: "コツ: 毎日少しずつでも続けることが大切！"

#### 7. **键盘快捷键（I键）** ⌨️
- **触发条件**: 按下'I'键
- **效果**: 提及道具箱，兴奋动画
- **消息**: "道具箱を開くよ！何か使ってみる？"
- **冷却时间**: 5秒

#### 8. **连击祝贺** 🎉
- **触发条件**: 自定义条件（连续5次或以上正确答案）
- **效果**: 特殊庆祝配音效，缩放动画
- **消息**: "すごい！連続正解！君は日本語の天才だ！"
- **冷却时间**: 30分钟
- **特殊**: 大幅幸福度提升（25点）持续2分钟

---

### 🎁 道具互动

这些互动通过使用道具箱中的道具触发：

#### 食物类 🍽️

1. **鱼** 🐟
   - **效果**: +20幸福度，进食动画
   - **消息**: "おいしい！"
   - **持续时间**: 5秒

2. **牛奶** 🥛
   - **效果**: +30能量，喝水动画
   - **消息**: "ごくごく..."
   - **持续时间**: 3秒

3. **蛋糕** 🍰
   - **效果**: +50幸福度，+40心情提升
   - **消息**: "やったー！"
   - **持续时间**: 10秒（幸福度），15秒（心情）

#### 玩具类 🧸

4. **球** ⚽
   - **效果**: 游戏状态，能量提升
   - **消息**: "遊ぼう！"
   - **动画**: 游戏动画

5. **毛线** 🧶
   - **效果**: 狩猎本能，游戏行为
   - **消息**: "これは何だ？"
   - **动画**: 狩猎/检查

6. **玩具老鼠** 🐭
   - **效果**: 狩猎模式激活
   - **消息**: "狩りの時間だ！"
   - **动画**: 狩猎行为

#### 工具类 🔧

7. **刷子** 🪒
   - **效果**: 放松，舒适度增加
   - **消息**: "気持ちいい..."
   - **动画**: 放松状态

8. **温度计** 🌡️
   - **效果**: 健康检查，检查状态
   - **消息**: "健康チェック中..."
   - **动画**: 检查动画

#### 药品类 💊

9. **维生素** 💊
   - **效果**: 健康提升，能量恢复
   - **消息**: "元気になった！"
   - **持续时间**: 长期健康益处

#### 装饰类 ✨

10. **花朵** 🌸
    - **效果**: 欣赏行为，美感欣赏
    - **消息**: "きれい..."
    - **动画**: 欣赏动画

11. **皇冠** 👑
    - **效果**: 皇家行为，自信提升
    - **消息**: "王様気分！"
    - **动画**: 皇家姿态

#### 特殊类 🎪

12. **魔法棒** 🪄
    - **效果**: 魔法状态，特殊能力
    - **消息**: "アブラカダブラ！"
    - **动画**: 闪光效果
    - **持续时间**: 3分钟魔法能力

13. **彩虹** 🌈
    - **效果**: 终极幸福+能量+心情提升
    - **消息**: "最高の気分！"
    - **动画**: 彩虹舞蹈
    - **持续时间**: 20秒极乐状态+5分钟彩虹光环

---

### 🎯 系统互动

不需要配置的内置系统响应：

- **点击**: 基础互动，幸福度增加
- **悬停**: 注意力响应，眼神追踪
- **拖拽**: 在屏幕上移动
- **右键**: 设置上下文菜单
- **双击**: 特殊反应和彩蛋
- **空闲行为**: 自主活动（行走、睡觉、观察）

---

## 📊 Interaction Statistics / 互动统计

### Default Interactions / 默认互动
- **Total**: 8 custom interactions / 8个自定义互动
- **Trigger Types**: 6 different types / 6种不同触发类型
- **Attributes Tracked**: 3 (happiness, energy, mood) / 跟踪3种属性

### Item Interactions / 道具互动
- **Total Items**: 16 items across 6 categories / 6个类别共16个道具
- **Food Items**: 3 (Fish, Milk, Cake) / 食物类：3个 (鱼、牛奶、蛋糕)
- **Toy Items**: 3 (Ball, Yarn, Toy Mouse) / 玩具类：3个 (球、毛线、玩具老鼠)
- **Tool Items**: 2 (Brush, Thermometer) / 工具类：2个 (刷子、温度计)
- **Medicine Items**: 1 (Vitamin) / 药品类：1个 (维生素)
- **Decoration Items**: 2 (Flower, Crown) / 装饰类：2个 (花朵、皇冠)
- **Special Items**: 2 (Magic Wand, Rainbow) / 特殊类：2个 (魔法棒、彩虹)

### System Interactions / 系统互动
- **Basic Interactions**: 6 types / 基础互动：6种类型
- **Autonomous Behaviors**: 5 states / 自主行为：5种状态
- **Easter Eggs**: Multiple hidden interactions / 多个隐藏互动

---

## 🔮 Customization Potential / 自定义潜力

With the custom interaction system, you can create:
通过自定义互动系统，您可以创建：

- **Unlimited custom interactions** / 无限的自定义互动
- **Personal attributes and stats** / 个人属性和统计
- **Time-based behaviors** / 基于时间的行为
- **Complex conditional logic** / 复杂的条件逻辑
- **Chain reactions** / 连锁反应
- **Custom media and animations** / 自定义媒体和动画
- **Sound effects** / 声音效果
- **Keyboard shortcuts** / 键盘快捷键

**Total Possible Interactions**: Virtually unlimited! / 可能的总互动数：几乎无限！

---

*This list represents the current state of supported interactions. New interactions can be added through the custom interaction system documented in `CUSTOM_INTERACTIONS.md` and `CUSTOM_INTERACTIONS_GUIDE.md`.*

*此列表代表当前支持的互动状态。可以通过`CUSTOM_INTERACTIONS.md`和`CUSTOM_INTERACTIONS_GUIDE.md`中记录的自定义互动系统添加新互动。*