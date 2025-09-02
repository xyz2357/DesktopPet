import { ItemData } from '../types/item';

export const defaultItems: ItemData[] = [
  // 食物类
  {
    id: 'fish',
    name: 'Fish',
    nameJa: '魚',
    description: 'A delicious fish that makes your pet happy',
    descriptionJa: 'ペットを喜ばせる美味しい魚',
    emoji: '🐟',
    type: 'food',
    rarity: 'common',
    effects: [
      { type: 'happiness_increase', value: 20, duration: 5000 },
      { type: 'text_display', value: 'おいしい！', duration: 3000 },
      { type: 'animation_trigger', value: 'eating' }
    ]
  },
  {
    id: 'milk',
    name: 'Milk',
    nameJa: 'ミルク',
    description: 'Fresh milk that restores energy',
    descriptionJa: 'エネルギーを回復する新鮮なミルク',
    emoji: '🥛',
    type: 'food',
    rarity: 'common',
    effects: [
      { type: 'energy_restore', value: 30, duration: 3000 },
      { type: 'text_display', value: 'ごくごく...', duration: 2000 },
      { type: 'state_change', value: 'drinking', duration: 2000 }
    ]
  },
  {
    id: 'cake',
    name: 'Cake',
    nameJa: 'ケーキ',
    description: 'A special cake for celebrations',
    descriptionJa: 'お祝い用の特別なケーキ',
    emoji: '🍰',
    type: 'food',
    rarity: 'uncommon',
    effects: [
      { type: 'happiness_increase', value: 50, duration: 10000 },
      { type: 'mood_boost', value: 40, duration: 15000 },
      { type: 'text_display', value: 'やったー！', duration: 3000 },
      { type: 'animation_trigger', value: 'party' }
    ]
  },

  // 玩具类
  {
    id: 'ball',
    name: 'Ball',
    nameJa: 'ボール',
    description: 'A fun ball to play with',
    descriptionJa: '一緒に遊ぶ楽しいボール',
    emoji: '⚽',
    type: 'toy',
    rarity: 'common',
    effects: [
      { type: 'mood_boost', value: 25, duration: 8000 },
      { type: 'text_display', value: '遊ぼう！', duration: 2000 },
      { type: 'state_change', value: 'playing', duration: 5000 }
    ]
  },
  {
    id: 'yarn',
    name: 'Yarn',
    nameJa: '毛糸',
    description: 'Soft yarn that pets love to play with',
    descriptionJa: 'ペットが遊ぶのが大好きな柔らかい毛糸',
    emoji: '🧶',
    type: 'toy',
    rarity: 'common',
    effects: [
      { type: 'happiness_increase', value: 15, duration: 12000 },
      { type: 'text_display', value: 'ふわふわ〜', duration: 2000 },
      { type: 'state_change', value: 'playful', duration: 8000 }
    ]
  },
  {
    id: 'toy_mouse',
    name: 'Toy Mouse',
    nameJa: 'おもちゃのネズミ',
    description: 'A cute toy mouse that triggers hunting instincts',
    descriptionJa: '狩猟本能を刺激するかわいいおもちゃのネズミ',
    emoji: '🐭',
    type: 'toy',
    rarity: 'uncommon',
    effects: [
      { type: 'state_change', value: 'hunting', duration: 6000 },
      { type: 'text_display', value: 'にゃー！', duration: 2000 },
      { type: 'behavior_modify', value: 'increased_activity', duration: 30000 }
    ]
  },

  // 工具类
  {
    id: 'brush',
    name: 'Brush',
    nameJa: 'ブラシ',
    description: 'A soft brush for grooming',
    descriptionJa: 'グルーミング用の柔らかいブラシ',
    emoji: '🪥',
    type: 'tool',
    rarity: 'common',
    effects: [
      { type: 'mood_boost', value: 30, duration: 5000 },
      { type: 'text_display', value: '気持ちいい〜', duration: 3000 },
      { type: 'state_change', value: 'relaxed', duration: 8000 }
    ]
  },
  {
    id: 'thermometer',
    name: 'Thermometer',
    nameJa: '体温計',
    description: 'Check your pet\'s health status',
    descriptionJa: 'ペットの健康状態をチェック',
    emoji: '🌡️',
    type: 'tool',
    rarity: 'uncommon',
    effects: [
      { type: 'text_display', value: '健康チェック中...', duration: 3000 },
      { type: 'state_change', value: 'examining', duration: 4000 }
    ]
  },

  // 药品类
  {
    id: 'vitamin',
    name: 'Vitamin',
    nameJa: 'ビタミン',
    description: 'Healthy vitamins to boost immunity',
    descriptionJa: '免疫力を高める健康的なビタミン',
    emoji: '💊',
    type: 'medicine',
    rarity: 'common',
    effects: [
      { type: 'energy_restore', value: 40, duration: 2000 },
      { type: 'text_display', value: '元気になった！', duration: 3000 },
      { type: 'temporary_ability', value: 'energy_boost', duration: 60000 }
    ],
    cooldown: 30000 // 30秒冷却时间
  },

  // 装饰类
  {
    id: 'flower',
    name: 'Flower',
    nameJa: '花',
    description: 'A beautiful flower that brings joy',
    descriptionJa: '喜びをもたらす美しい花',
    emoji: '🌸',
    type: 'decoration',
    rarity: 'common',
    effects: [
      { type: 'mood_boost', value: 20, duration: 15000 },
      { type: 'text_display', value: 'きれい〜', duration: 2000 },
      { type: 'state_change', value: 'admiring', duration: 6000 }
    ]
  },
  {
    id: 'crown',
    name: 'Crown',
    nameJa: '王冠',
    description: 'A majestic crown that makes your pet feel royal',
    descriptionJa: 'ペットを王族のような気分にさせる威厳のある王冠',
    emoji: '👑',
    type: 'decoration',
    rarity: 'rare',
    effects: [
      { type: 'happiness_increase', value: 60, duration: 20000 },
      { type: 'mood_boost', value: 50, duration: 25000 },
      { type: 'text_display', value: '私は王様だ！', duration: 4000 },
      { type: 'state_change', value: 'royal', duration: 15000 },
      { type: 'temporary_ability', value: 'royal_aura', duration: 120000 }
    ],
    cooldown: 60000 // 1分钟冷却时间
  },

  // 特殊类
  {
    id: 'magic_wand',
    name: 'Magic Wand',
    nameJa: '魔法の杖',
    description: 'A mysterious wand with magical powers',
    descriptionJa: '魔力を持つ神秘的な杖',
    emoji: '🪄',
    type: 'special',
    rarity: 'epic',
    effects: [
      { type: 'state_change', value: 'magical', duration: 10000 },
      { type: 'text_display', value: 'アブラカダブラ！', duration: 3000 },
      { type: 'animation_trigger', value: 'sparkle' },
      { type: 'temporary_ability', value: 'magic_powers', duration: 180000 }
    ],
    cooldown: 120000, // 2分钟冷却时间
    usageLimit: 3 // 限制使用3次
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    nameJa: '虹',
    description: 'A beautiful rainbow that brings ultimate happiness',
    descriptionJa: '究極の幸福をもたらす美しい虹',
    emoji: '🌈',
    type: 'special',
    rarity: 'legendary',
    effects: [
      { type: 'happiness_increase', value: 100, duration: 30000 },
      { type: 'mood_boost', value: 80, duration: 45000 },
      { type: 'energy_restore', value: 100, duration: 5000 },
      { type: 'text_display', value: '最高の気分！', duration: 5000 },
      { type: 'state_change', value: 'euphoric', duration: 20000 },
      { type: 'animation_trigger', value: 'rainbow_dance' },
      { type: 'temporary_ability', value: 'rainbow_aura', duration: 300000 }
    ],
    cooldown: 300000, // 5分钟冷却时间
    usageLimit: 1 // 限制使用1次
  }
];