# Japanese Pet Data Structure Documentation / 日语桌宠数据结构文档

[English](#english) | [中文](#中文)

---

## English

### Data Organization

The new data structure separates card types into different JSON files for better management and extensibility:

```
src/data/cards/
├── words.json      # Word card data
├── sentences.json  # Sentence card data  
├── examples.json   # Example card data
├── grammar.json    # Grammar card data
├── images.json     # Image card data
├── audio.json      # Audio card data
├── arrange.json    # Drag-arrange sentence card data
└── index.ts        # Data loading and management module
```

### Card Types and Field Descriptions

#### 1. Word Cards (words.json)
```json
{
  "id": "w001",
  "type": "word",
  "jp": "勉強",
  "kana": "べんきょう", 
  "romaji": "benkyou",
  "cn": "学习",
  "example_jp": "日本語を勉強します。",
  "example_cn": "我学习日语。",
  "jlpt": "N5",
  "difficulty": 1,
  "category": "education",
  "tags": ["verb", "daily-life"]
}
```

#### 2. Sentence Cards (sentences.json)
```json
{
  "id": "s001",
  "type": "sentence",
  "jp": "おはようございます",
  "kana": "おはようございます",
  "romaji": "ohayou gozaimasu", 
  "cn": "Good morning",
  "jlpt": "N5",
  "difficulty": 1,
  "category": "greeting",
  "tags": ["polite", "morning"],
  "usage_context": "formal_greeting"
}
```

#### 3. Example Cards (examples.json)
```json
{
  "id": "e001",
  "type": "example",
  "jp": "部屋が明るいです。",
  "kana": "へやがあかるいです。",
  "romaji": "heya ga akarui desu.",
  "cn": "房间很明亮。",
  "jlpt": "N5", 
  "difficulty": 1,
  "category": "description",
  "tags": ["adjective", "room"],
  "grammar_focus": "い-adjective + です",
  "vocabulary_focus": ["部屋", "明るい"]
}
```

#### 4. Grammar Cards (grammar.json)
```json
{
  "id": "g001",
  "type": "grammar",
  "jp": "〜ている",
  "cn": "continuous state",
  "grammar_pattern": "V-ている",
  "grammar_explanation": "Expresses ongoing action or continuous state. Used to describe things happening now or ongoing conditions.",
  "example_jp": "今、勉強しています。",
  "example_cn": "现在正在学习。",
  "jlpt": "N5",
  "difficulty": 2,
  "category": "verb-form",
  "tags": ["continuous", "present"],
  "usage_notes": "verb te-form + いる",
  "formation_rule": "verb te-form + います (polite form)",
  "related_grammar": ["〜ていた", "〜てある"]
}
```

### Data Management API

#### Basic Import
```typescript
import { allCards, cardsByType, getRandomCard } from './data/cards/index';
```

#### Main Functions

1. **Get All Cards**: `allCards`
2. **Group by Type**: `cardsByType.word`, `cardsByType.grammar`, etc.
3. **Group by JLPT Level**: `cardsByJLPT.N5`, `cardsByJLPT.N4`, etc.
4. **Search Cards**: `searchCards(query, type?, jlpt?)`
5. **Get Random Card**: `getRandomCard(type?, jlpt?)`
6. **Get Related Cards**: `getRelatedCards(card, limit)`

#### Data Statistics
```typescript
import { dataStats } from './data/cards/index';

console.log(dataStats);
// Output:
// {
//   totalCards: 32,
//   cardsByType: { word: 10, sentence: 5, ... },
//   cardsByJLPT: { N5: 25, N4: 7, ... }
// }
```

### Extending Data

#### Adding New Cards
1. Add new card data to corresponding JSON file
2. Ensure all fields are complete and follow type definitions
3. ID naming convention: type prefix + incremental number (e.g., w001, g001, ar001)

#### Adding New Fields
1. Extend `CardData` interface in `src/types/card.ts`
2. Add new fields to corresponding JSON files
3. Update components and styles to support new fields

#### Creating New Card Types
1. Add new type to `type` field in `src/types/card.ts`
2. Create new JSON data file
3. Import and merge data in `src/data/cards/index.ts`
4. Update `StudyCard` component to support rendering of new type

### Data File Maintenance

- All JSON files need to maintain UTF-8 encoding
- Ensure JSON format is correct (use online JSON validators)
- Each card's ID must be unique
- Recommend using appropriate code editors for JSON syntax highlighting and validation

### Performance Considerations

- JSON files are bundled by webpack at build time
- Data is fully loaded into memory at application startup
- For large datasets, consider implementing lazy loading or pagination
- Current data volume is suitable for memory loading, future database storage can be considered

---

## 中文

## 数据组织方式

新的数据结构按卡片类型分离到不同的JSON文件中，更便于管理和扩展：

```
src/data/cards/
├── words.json      # 单词卡片数据
├── sentences.json  # 句子卡片数据  
├── examples.json   # 例句卡片数据
├── grammar.json    # 语法卡片数据
├── images.json     # 图片卡片数据
├── audio.json      # 音频卡片数据
├── arrange.json    # 拖拽拼句卡片数据
└── index.ts        # 数据加载和管理模块
```

## 卡片类型及字段说明

### 1. 单词卡 (words.json)
```json
{
  "id": "w001",
  "type": "word",
  "jp": "勉強",
  "kana": "べんきょう", 
  "romaji": "benkyou",
  "cn": "学习",
  "example_jp": "日本語を勉強します。",
  "example_cn": "我学习日语。",
  "jlpt": "N5",
  "difficulty": 1,
  "category": "education",
  "tags": ["verb", "daily-life"]
}
```

### 2. 句子卡 (sentences.json)
```json
{
  "id": "s001",
  "type": "sentence",
  "jp": "おはようございます",
  "kana": "おはようございます",
  "romaji": "ohayou gozaimasu", 
  "cn": "早上好",
  "jlpt": "N5",
  "difficulty": 1,
  "category": "greeting",
  "tags": ["polite", "morning"],
  "usage_context": "formal_greeting"
}
```

### 3. 例句卡 (examples.json)
```json
{
  "id": "e001",
  "type": "example",
  "jp": "部屋が明るいです。",
  "kana": "へやがあかるいです。",
  "romaji": "heya ga akarui desu.",
  "cn": "房间很明亮。",
  "jlpt": "N5", 
  "difficulty": 1,
  "category": "description",
  "tags": ["adjective", "room"],
  "grammar_focus": "い-adjective + です",
  "vocabulary_focus": ["部屋", "明るい"]
}
```

### 4. 语法卡 (grammar.json)
```json
{
  "id": "g001",
  "type": "grammar",
  "jp": "〜ている",
  "cn": "进行状态",
  "grammar_pattern": "V-ている",
  "grammar_explanation": "表示动作正在进行或状态的持续。用于描述现在正在发生的事情或持续的状态。",
  "example_jp": "今、勉強しています。",
  "example_cn": "现在正在学习。",
  "jlpt": "N5",
  "difficulty": 2,
  "category": "verb-form",
  "tags": ["continuous", "present"],
  "usage_notes": "动词て形 + いる",
  "formation_rule": "动词て形 + います（礼貌形）",
  "related_grammar": ["〜ていた", "〜てある"]
}
```

### 5. 图片卡 (images.json)
```json
{
  "id": "i001",
  "type": "image",
  "jp": "食べ物",
  "kana": "たべもの",
  "romaji": "tabemono",
  "cn": "食物",
  "image_path": "assets/images/food_01.empty.jpg",
  "jlpt": "N5",
  "difficulty": 1,
  "category": "food",
  "tags": ["noun", "daily-life"],
  "description": "各种食物的图片，包括米饭、面包、蔬菜等",
  "related_words": ["食事", "料理", "レストラン"]
}
```

### 6. 音频卡 (audio.json)
```json
{
  "id": "a001",
  "type": "audio",
  "jp": "音声練習",
  "cn": "音频练习",
  "audio_path": "assets/audio/word_01.empty.mp3",
  "choices": ["あかるい", "あかりい", "あかるび", "あかるし"],
  "correct_answer": "あかるい",
  "example_jp": "部屋が明るいです。",
  "example_cn": "房间很明亮。",
  "jlpt": "N5",
  "difficulty": 2,
  "category": "pronunciation",
  "tags": ["listening", "pronunciation"],
  "target_word": "明るい",
  "phonetic_focus": "る音",
  "common_mistakes": ["り音との混同", "濁音の誤解"]
}
```

### 7. 拖拽拼句卡 (arrange.json)
```json
{
  "id": "ar001",
  "type": "arrange",
  "jp": "私は学校に行きます。",
  "cn": "我去学校。",
  "words_to_arrange": ["私は", "学校に", "行きます", "。"],
  "correct_order": [0, 1, 2, 3],
  "jlpt": "N5",
  "difficulty": 1,
  "category": "sentence-structure",
  "tags": ["basic-pattern", "daily-life"],
  "grammar_focus": "主語 + 場所に + 動詞",
  "learning_objective": "基本的な文型の語順を理解する",
  "hints": ["私は（主語）", "学校に（場所）", "行きます（動詞）"]
}
```

## 数据管理API

### 基本导入
```typescript
import { allCards, cardsByType, getRandomCard } from './data/cards/index';
```

### 主要功能

1. **获取所有卡片**: `allCards`
2. **按类型分组**: `cardsByType.word`, `cardsByType.grammar` 等
3. **按JLPT等级分组**: `cardsByJLPT.N5`, `cardsByJLPT.N4` 等
4. **搜索卡片**: `searchCards(query, type?, jlpt?)`
5. **获取随机卡片**: `getRandomCard(type?, jlpt?)`
6. **获取相关卡片**: `getRelatedCards(card, limit)`

### 数据统计
```typescript
import { dataStats } from './data/cards/index';

console.log(dataStats);
// 输出：
// {
//   totalCards: 32,
//   cardsByType: { word: 10, sentence: 5, ... },
//   cardsByJLPT: { N5: 25, N4: 7, ... }
// }
```

## 扩展数据

### 添加新卡片
1. 在对应的JSON文件中添加新的卡片数据
2. 确保字段完整且符合类型定义
3. ID命名规范：类型前缀 + 递增数字（如：w001, g001, ar001）

### 添加新字段
1. 在 `src/types/card.ts` 中扩展 `CardData` 接口
2. 在相应的JSON文件中添加新字段
3. 更新组件和样式以支持新字段

### 创建新卡片类型
1. 在 `src/types/card.ts` 中添加新类型到 `type` 字段
2. 创建新的JSON数据文件
3. 在 `src/data/cards/index.ts` 中导入和合并数据
4. 更新 `StudyCard` 组件以支持新类型的渲染

## 数据文件维护

- 所有JSON文件需要保持UTF-8编码
- 确保JSON格式正确（使用在线JSON验证器）
- 每个卡片的ID必须唯一
- 建议使用合适的代码编辑器以获得JSON语法高亮和验证

## 性能考虑

- JSON文件会在构建时被webpack打包
- 数据在应用启动时全部加载到内存
- 对于大量数据，考虑实现懒加载或分页
- 当前数据量适合内存加载，未来可考虑数据库存储