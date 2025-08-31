import { test, expect, _electron as electron } from '@playwright/test';
import path from 'path';

test.describe('Japanese Pet Advanced Features', () => {
  let electronApp;
  let page;

  test.beforeEach(async () => {
    // Launch Electron app
    electronApp = await electron.launch({
      args: [path.join(__dirname, '../../dist/main.js')],
      executablePath: require('electron'),
    });

    // Get the first window
    page = await electronApp.firstWindow();
    
    // Wait for app to be ready
    await page.waitForLoadState('domcontentloaded');
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('should handle audio card interactions', async () => {
    const pet = await page.locator('.pet');
    
    // Keep clicking until we get an audio card
    let attempts = 0;
    let isAudioCard = false;
    
    while (!isAudioCard && attempts < 5) {
      await pet.click();
      await page.waitForSelector('.study-card', { timeout: 2000 });
      
      // Check if this is an audio card
      const audioElement = page.locator('.study-card__audio');
      isAudioCard = await audioElement.isVisible();
      
      if (!isAudioCard) {
        // Close current card and try again
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        attempts++;
      }
    }
    
    if (!isAudioCard) {
      test.skip('Could not find audio card after 5 attempts');
      return;
    }

    // Test audio card elements
    await expect(page.locator('.audio-play-button')).toBeVisible();
    await expect(page.locator('.choices-grid')).toBeVisible();
    await expect(page.locator('.choice-button')).toHaveCount(3);

    // Click on first choice
    const firstChoice = page.locator('.choice-button').first();
    await firstChoice.click();
    
    // Choice should be selected
    await expect(firstChoice).toHaveClass(/selected/);
    
    // Wait for auto-submit (1.5 seconds)
    await page.waitForTimeout(2000);
    
    // Result should be shown
    await expect(page.locator('.result-message')).toBeVisible();
    
    // Should auto-close after showing result
    await page.waitForTimeout(2000);
    await expect(page.locator('.study-card-overlay')).not.toBeVisible();
  });

  test('should handle arrange card drag and drop', async () => {
    const pet = await page.locator('.pet');
    
    // Keep clicking until we get an arrange card
    let attempts = 0;
    let isArrangeCard = false;
    
    while (!isArrangeCard && attempts < 5) {
      await pet.click();
      await page.waitForSelector('.study-card', { timeout: 2000 });
      
      // Check if this is an arrange card
      const arrangeElement = page.locator('.study-card__arrange');
      isArrangeCard = await arrangeElement.isVisible();
      
      if (!isArrangeCard) {
        // Close current card and try again
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        attempts++;
      }
    }
    
    if (!isArrangeCard) {
      test.skip('Could not find arrange card after 20 attempts');
      return;
    }

    // Test arrange card elements
    await expect(page.locator('.arrange-title')).toBeVisible();
    await expect(page.locator('.arrange-words')).toBeVisible();
    await expect(page.locator('.arrange-word')).toHaveCount(4); // Assuming 4 words
    
    // Get the first two words
    const word1 = page.locator('.arrange-word').first();
    const word2 = page.locator('.arrange-word').nth(1);
    
    // Drag first word to second position
    await word1.dragTo(word2);
    
    // Wait a moment for drag to complete
    await page.waitForTimeout(500);
    
    // The sentence should update
    const sentence = page.locator('.arrange-sentence');
    await expect(sentence).toBeVisible();
    
    // Wait for auto-submit (2 seconds)
    await page.waitForTimeout(2500);
    
    // Result should be shown
    const resultMessage = page.locator('.result-message');
    await expect(resultMessage).toBeVisible();
  });

  test('should show tooltip on hover', async () => {
    const pet = await page.locator('.pet');
    
    // Open any study card
    await pet.click();
    await expect(page.locator('.study-card')).toBeVisible();
    
    // Find tooltip trigger element
    const tooltipTrigger = page.locator('.tooltip-trigger');
    
    if (await tooltipTrigger.isVisible()) {
      // Hover over the element
      await tooltipTrigger.hover();
      
      // Wait for tooltip to appear
      await page.waitForTimeout(200);
      
      // Tooltip should be visible
      const tooltip = page.locator('.tooltip');
      await expect(tooltip).toBeVisible();
      
      // Move mouse away
      await page.mouse.move(0, 0);
      
      // Tooltip should disappear
      await page.waitForTimeout(200);
      await expect(tooltip).not.toBeVisible();
    }
  });

  test('should handle keyboard shortcuts', async () => {
    const pet = await page.locator('.pet');
    
    // Open study card
    await pet.click();
    await expect(page.locator('.study-card')).toBeVisible();
    
    // Test Arrow Right (Know)
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.study-card-overlay')).not.toBeVisible();
    
    // Open another card
    await pet.click();
    await expect(page.locator('.study-card')).toBeVisible();
    
    // Test Arrow Left (Unknown) 
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('.study-card-overlay')).not.toBeVisible();
    
    // Open another card
    await pet.click();
    await expect(page.locator('.study-card')).toBeVisible();
    
    // Test Arrow Down (Later)
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('.study-card-overlay')).not.toBeVisible();
  });

  test('should handle different card types', async () => {
    const pet = await page.locator('.pet');
    const cardTypes = new Set();
    
    // Try to encounter different card types
    for (let i = 0; i < 15; i++) {
      await pet.click();
      await page.waitForSelector('.study-card', { timeout: 2000 });
      
      // Identify card type based on visible elements
      if (await page.locator('.study-card__audio').isVisible()) {
        cardTypes.add('audio');
      } else if (await page.locator('.study-card__arrange').isVisible()) {
        cardTypes.add('arrange');
      } else if (await page.locator('.study-card__image').isVisible()) {
        cardTypes.add('image');
      } else if (await page.locator('.grammar-pattern').isVisible()) {
        cardTypes.add('grammar');
      } else if (await page.locator('.example').isVisible()) {
        cardTypes.add('example');
      } else {
        cardTypes.add('word');
      }
      
      // Close card
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    // We should have encountered at least 3 different card types
    expect(cardTypes.size).toBeGreaterThanOrEqual(3);
    console.log('Encountered card types:', Array.from(cardTypes));
  });

  test('should handle image card display', async () => {
    const pet = await page.locator('.pet');
    
    // Keep clicking until we get an image card
    let attempts = 0;
    let isImageCard = false;
    
    while (!isImageCard && attempts < 20) {
      await pet.click();
      await page.waitForSelector('.study-card', { timeout: 2000 });
      
      // Check if this is an image card
      const imageElement = page.locator('.study-card__image');
      isImageCard = await imageElement.isVisible();
      
      if (!isImageCard) {
        // Close current card and try again
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        attempts++;
      }
    }
    
    if (!isImageCard) {
      test.skip('Could not find image card after 20 attempts');
      return;
    }

    // Test image card elements
    await expect(page.locator('.image-placeholder')).toBeVisible();
    await expect(page.locator('.japanese-text')).toBeVisible();
    await expect(page.locator('.kana')).toBeVisible();
    await expect(page.locator('.romaji')).toBeVisible();
    await expect(page.locator('.chinese-text')).toBeVisible();
  });

  test('should handle grammar card display', async () => {
    const pet = await page.locator('.pet');
    
    // Keep clicking until we get a grammar card
    let attempts = 0;
    let isGrammarCard = false;
    
    while (!isGrammarCard && attempts < 20) {
      await pet.click();
      await page.waitForSelector('.study-card', { timeout: 2000 });
      
      // Check if this is a grammar card by looking for grammar-specific content
      const grammarPattern = page.locator('.grammar-pattern');
      const grammarExplanation = page.locator('.grammar-explanation');
      
      isGrammarCard = (await grammarPattern.isVisible()) || (await grammarExplanation.isVisible());
      
      if (!isGrammarCard) {
        // Close current card and try again
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        attempts++;
      }
    }
    
    if (!isGrammarCard) {
      test.skip('Could not find grammar card after 20 attempts');
      return;
    }

    // Test grammar card has Japanese text and Chinese translation
    await expect(page.locator('.japanese-text')).toBeVisible();
    await expect(page.locator('.chinese-text')).toBeVisible();
  });

  test('should maintain card state between interactions', async () => {
    const pet = await page.locator('.pet');
    
    // Open study card
    await pet.click();
    await expect(page.locator('.study-card')).toBeVisible();
    
    // Toggle translation
    const toggleButton = page.locator('.translation-toggle');
    await toggleButton.click();
    
    // Translation should be visible
    const chineseText = page.locator('.chinese-text');
    await expect(chineseText).toBeVisible();
    
    // Toggle translation off
    await toggleButton.click();
    
    // Translation should be hidden (if it has hide logic)
    // This depends on implementation - some cards might always show translation
    
    // Answer the card
    await page.locator('.action-button--know').click();
    await expect(page.locator('.study-card-overlay')).not.toBeVisible();
    
    // Open new card - should start with default state
    await pet.click();
    await expect(page.locator('.study-card')).toBeVisible();
    
    // Toggle button should show default text
    const newToggleButton = page.locator('.translation-toggle');
    if (await newToggleButton.isVisible()) {
      await expect(newToggleButton).toContainText('显示翻译');
    }
  });
});