import { test, expect, _electron as electron } from '@playwright/test';
import path from 'path';

test.describe('Japanese Pet Desktop App', () => {
  let electronApp;
  let page;

  test.beforeEach(async () => {
    // Launch Electron app
    electronApp = await electron.launch({
      args: [path.join(__dirname, '../dist/main.js')],
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

  test('should show the desktop pet', async () => {
    // Check if the pet element exists
    const pet = await page.locator('.pet');
    await expect(pet).toBeVisible();
    
    // Check if pet has the correct title
    await expect(pet).toHaveAttribute('title', '拖拽移动，点击学习，右键菜单');
  });

  test('should show hover state when mouse enters pet', async () => {
    const pet = await page.locator('.pet');
    
    // Hover over the pet
    await pet.hover();
    
    // Check for hover state - should show different emoji and bubble
    await expect(page.locator('.pet-bubble')).toBeVisible();
    await expect(page.locator('.pet-bubble')).toContainText('拖拽/点击/右键');
  });

  test('should open study card when pet is clicked', async () => {
    const pet = await page.locator('.pet');
    
    // Click on the pet
    await pet.click();
    
    // Wait for study card to appear
    await expect(page.locator('.study-card-overlay')).toBeVisible();
    await expect(page.locator('.study-card')).toBeVisible();
    
    // Check for card content
    await expect(page.locator('.japanese-text')).toBeVisible();
    await expect(page.locator('.action-button')).toHaveCount(3);
  });

  test('should close study card when clicking overlay', async () => {
    const pet = await page.locator('.pet');
    
    // Open study card
    await pet.click();
    await expect(page.locator('.study-card-overlay')).toBeVisible();
    
    // Click on overlay (outside the card)
    await page.locator('.study-card-overlay').click({ position: { x: 50, y: 50 } });
    
    // Card should be closed
    await expect(page.locator('.study-card-overlay')).not.toBeVisible();
  });

  test('should close study card when pressing Escape', async () => {
    const pet = await page.locator('.pet');
    
    // Open study card
    await pet.click();
    await expect(page.locator('.study-card-overlay')).toBeVisible();
    
    // Press Escape key
    await page.keyboard.press('Escape');
    
    // Card should be closed
    await expect(page.locator('.study-card-overlay')).not.toBeVisible();
  });

  test('should show context menu on right click', async () => {
    const pet = await page.locator('.pet');
    
    // Right click on the pet
    await pet.click({ button: 'right' });
    
    // Context menu should appear
    await expect(page.locator('.context-menu')).toBeVisible();
    await expect(page.locator('.context-menu__item')).toContainText('退出桌宠');
  });

  test('should handle study card interactions', async () => {
    const pet = await page.locator('.pet');
    
    // Open study card
    await pet.click();
    await expect(page.locator('.study-card')).toBeVisible();
    
    // Test translation toggle
    const toggleButton = page.locator('.translation-toggle');
    await expect(toggleButton).toContainText('显示翻译');
    
    await toggleButton.click();
    await expect(toggleButton).toContainText('隐藏翻译');
    
    // Test answer buttons
    const knowButton = page.locator('.action-button--know');
    const unknownButton = page.locator('.action-button--unknown');
    const laterButton = page.locator('.action-button--later');
    
    await expect(knowButton).toBeVisible();
    await expect(unknownButton).toBeVisible();
    await expect(laterButton).toBeVisible();
    
    // Click "know" button
    await knowButton.click();
    
    // Card should close after answering
    await expect(page.locator('.study-card-overlay')).not.toBeVisible();
  });

  test('should handle TTS play button', async () => {
    const pet = await page.locator('.pet');
    
    // Open study card
    await pet.click();
    await expect(page.locator('.study-card')).toBeVisible();
    
    // Find and click play button
    const playButton = page.locator('.play-button');
    await expect(playButton).toBeVisible();
    await expect(playButton).toHaveAttribute('title', '播放发音');
    
    // Click play button (we can't test actual audio, but we can test the button works)
    await playButton.click();
    
    // Button should still be visible after clicking
    await expect(playButton).toBeVisible();
  });

  test('should be draggable', async () => {
    const pet = await page.locator('.pet');
    
    // Get initial position
    const initialBox = await pet.boundingBox();
    
    // Drag the pet to a new position
    await pet.dragTo(page.locator('body'), { 
      sourcePosition: { x: 25, y: 25 },
      targetPosition: { x: 200, y: 200 }
    });
    
    // Wait a moment for drag to complete
    await page.waitForTimeout(100);
    
    // Get new position
    const newBox = await pet.boundingBox();
    
    // Position should have changed
    expect(newBox.x).not.toBe(initialBox.x);
    expect(newBox.y).not.toBe(initialBox.y);
  });
});