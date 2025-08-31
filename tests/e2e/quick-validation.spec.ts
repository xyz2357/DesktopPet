import { test, expect, _electron as electron } from '@playwright/test';
import path from 'path';

test.describe('Quick E2E Validation', () => {
  let electronApp;
  let page;

  test.beforeEach(async () => {
    electronApp = await electron.launch({
      args: [path.join(__dirname, '../../dist/main.js')],
      executablePath: require('electron'),
    });

    page = await electronApp.firstWindow();
    await page.waitForLoadState('domcontentloaded');
  });

  test.afterEach(async () => {
    await electronApp.close();
  });

  test('should handle multiple card types in sequence', async () => {
    const pet = await page.locator('.pet');
    const encounterTypes = new Set();
    
    // Quick sampling of different card types
    for (let i = 0; i < 8; i++) {
      await pet.click();
      await page.waitForSelector('.study-card', { timeout: 1000 });
      
      // Quick identification of card type
      if (await page.locator('.choices-grid').isVisible()) {
        encounterTypes.add('audio');
      } else if (await page.locator('.arrange-words').isVisible()) {
        encounterTypes.add('arrange');  
      } else if (await page.locator('.image-placeholder').isVisible()) {
        encounterTypes.add('image');
      } else if (await page.locator('.grammar-pattern').first().isVisible() || await page.locator('.grammar-explanation').first().isVisible()) {
        encounterTypes.add('grammar');
      } else {
        encounterTypes.add('basic');
      }
      
      // Quick close and continue
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    }
    
    // Should encounter at least 2 different types
    expect(encounterTypes.size).toBeGreaterThanOrEqual(2);
    console.log('Card types encountered:', Array.from(encounterTypes));
  });

  test('should handle keyboard shortcuts correctly', async () => {
    const pet = await page.locator('.pet');
    
    // Test each keyboard shortcut
    const shortcuts = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'Escape'];
    
    for (const key of shortcuts) {
      await pet.click();
      await page.waitForSelector('.study-card', { timeout: 1000 });
      
      await page.keyboard.press(key);
      
      // All shortcuts should close the card
      await expect(page.locator('.study-card-overlay')).not.toBeVisible();
      await page.waitForTimeout(200);
    }
  });

  test('should handle tooltip functionality', async () => {
    const pet = await page.locator('.pet');
    
    await pet.click();
    await page.waitForSelector('.study-card', { timeout: 1000 });
    
    // Look for tooltip triggers
    const tooltipTrigger = page.locator('.tooltip-trigger').first();
    
    if (await tooltipTrigger.isVisible()) {
      await tooltipTrigger.hover();
      await page.waitForTimeout(300);
      
      // Tooltip should appear
      const tooltip = page.locator('.tooltip');
      if (await tooltip.count() > 0) {
        await expect(tooltip).toBeVisible();
      }
    }
  });

  test('should maintain responsive interactions', async () => {
    const pet = await page.locator('.pet');
    
    // Rapid click test
    for (let i = 0; i < 5; i++) {
      await pet.click();
      await page.waitForSelector('.study-card', { timeout: 1000 });
      
      // Should be able to close quickly
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);
      
      // Should be ready for next interaction
      await expect(pet).toBeVisible();
    }
  });

  test('should handle special card features', async () => {
    const pet = await page.locator('.pet');
    let foundSpecialCard = false;
    
    // Try to find a card with special features
    for (let i = 0; i < 5; i++) {
      await pet.click();
      await page.waitForSelector('.study-card', { timeout: 1000 });
      
      // Check for audio card
      if (await page.locator('.choice-button').isVisible()) {
        foundSpecialCard = true;
        
        // Test choice selection
        await page.locator('.choice-button').first().click();
        await page.waitForTimeout(500);
        
        // Should show selection
        await expect(page.locator('.choice-button.selected')).toBeVisible();
        break;
      }
      
      // Check for arrange card
      if (await page.locator('.arrange-word').isVisible()) {
        foundSpecialCard = true;
        
        // Test drag (simplified)
        const words = page.locator('.arrange-word');
        if (await words.count() >= 2) {
          const word1 = words.first();
          const word2 = words.nth(1);
          await word1.dragTo(word2);
        }
        break;
      }
      
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    }
    
    // Record if we found special features
    console.log('Found special card features:', foundSpecialCard);
  });
});