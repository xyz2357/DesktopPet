/**
 * 生成placeholder媒体文件的脚本
 */

const fs = require('fs');
const path = require('path');

// Base64编码的1x1透明PNG图片
const transparentPNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

// Base64编码的简单GIF动画（2帧，透明背景）
const transparentGIF = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// 创建一个简单的WebP（1x1透明像素）
const transparentWebP = 'UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';

const states = ['idle', 'hover', 'active', 'loading'];
const mediaDir = path.join(__dirname, '../src/assets/pet-media');

// 生成图片文件
function generateImagePlaceholders() {
    console.log('生成placeholder图片文件...');
    
    states.forEach(state => {
        const stateDir = path.join(mediaDir, state);
        
        // PNG文件
        ['pet-1.png', 'pet-2.png', 'pet-3.png'].forEach(filename => {
            const filePath = path.join(stateDir, filename);
            fs.writeFileSync(filePath, Buffer.from(transparentPNG, 'base64'));
            console.log(`创建: ${filePath}`);
        });
        
        // JPEG文件（使用PNG数据作为placeholder）
        ['pet-4.jpg', 'pet-5.jpeg'].forEach(filename => {
            const filePath = path.join(stateDir, filename);
            fs.writeFileSync(filePath, Buffer.from(transparentPNG, 'base64'));
            console.log(`创建: ${filePath}`);
        });
        
        // GIF文件
        const gifPath = path.join(stateDir, 'pet-animated.gif');
        fs.writeFileSync(gifPath, Buffer.from(transparentGIF, 'base64'));
        console.log(`创建: ${gifPath}`);
        
        // WebP文件
        const webpPath = path.join(stateDir, 'pet-modern.webp');
        fs.writeFileSync(webpPath, Buffer.from(transparentWebP, 'base64'));
        console.log(`创建: ${webpPath}`);
    });
}

// 生成视频文件placeholder（创建空文件，实际应用中需要真实视频）
function generateVideoPlaceholders() {
    console.log('生成placeholder视频文件...');
    
    states.forEach(state => {
        const stateDir = path.join(mediaDir, state);
        
        // 创建空的视频文件（placeholder）
        ['pet-video1.mp4', 'pet-video2.webm'].forEach(filename => {
            const filePath = path.join(stateDir, filename);
            fs.writeFileSync(filePath, '# Placeholder video file\n# Replace with actual video content\n');
            console.log(`创建: ${filePath}`);
        });
    });
}

// 生成README文件说明如何替换
function generateReadme() {
    const readmeContent = `# Pet Media Files

这个文件夹包含桌宠的媒体文件，按状态分组：

## 目录结构

\`\`\`
pet-media/
├── idle/       # 闲置状态媒体文件
├── hover/      # 悬停状态媒体文件
├── active/     # 激活状态媒体文件
└── loading/    # 加载状态媒体文件
\`\`\`

## 支持的格式

- **图片**: PNG, JPG, JPEG, WebP
- **动画**: GIF
- **视频**: MP4, WebM

## 文件命名

- 文件名可以任意，系统会自动扫描所有支持格式的文件
- 建议使用描述性名称，如: \`pet-happy.gif\`, \`pet-thinking.mp4\`

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

## 配置选项

在 \`src/config/appConfig.ts\` 中可以调整：
- \`randomSelection.enabled\`: 是否启用随机选择
- \`randomSelection.changeOnStateSwitch\`: 状态切换时是否重新选择
- \`video.*\`: 视频播放相关配置
`;

    const readmePath = path.join(mediaDir, 'README.md');
    fs.writeFileSync(readmePath, readmeContent);
    console.log(`创建: ${readmePath}`);
}

// 执行生成
try {
    generateImagePlaceholders();
    generateVideoPlaceholders();
    generateReadme();
    console.log('\n✅ Placeholder文件生成完成！');
    console.log('\n📝 接下来你可以：');
    console.log('1. 将真实的图片/GIF文件替换对应状态文件夹中的文件');
    console.log('2. 将真实的MP4/WebM视频文件替换视频placeholder');
    console.log('3. 运行 npm run build 测试加载');
} catch (error) {
    console.error('生成placeholder文件时出错:', error);
    process.exit(1);
}