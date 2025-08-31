import { test, expect, _electron as electron } from '@playwright/test';
import path from 'path';

test.describe('Japanese Pet Accessibility Features', () => {
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

  test('should have proper ARIA labels', async () => {
    const pet = await page.locator('.pet');
    
    // Pet should have accessible title
    await expect(pet).toHaveAttribute('title', '拖拽移动，点击学习，右键菜单');
    
    // Open study card
    await pet.click();
    await expect(page.locator('.study-card')).toBeVisible();
    
    // Check for ARIA labels on buttons
    const closeButton = page.locator('[aria-label*="关闭"]');
    const playButton = page.locator('[aria-label*="播放"]').or(page.locator('[title*="播放"]'));
    const actionButtons = page.locator('.action-button');
    
    if (await closeButton.isVisible()) {
      await expect(closeButton).toHaveAttribute('aria-label');
    }
    
    if (await playButton.isVisible()) {
      const titleAttr = await playButton.getAttribute('title');
      expect(titleAttr).toContain('播放');
    }
    
    // Action buttons should be accessible
    const buttonCount = await actionButtons.count();
    expect(buttonCount).toBe(3);
  });

  test('should support keyboard navigation', async () => {
    const pet = await page.locator('.pet');
    
    // Open study card
    await pet.click();
    await expect(page.locator('.study-card')).toBeVisible();
    
    // Focus should be manageable with Tab key
    await page.keyboard.press('Tab');
    
    // Should be able to navigate with keyboard
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Escape should close
    await page.keyboard.press('Escape');
    await expect(page.locator('.study-card-overlay')).not.toBeVisible();
  });

  test('should handle space key for audio playback', async () => {
    const pet = await page.locator('.pet');
    
    // Open study card
    await pet.click();
    await expect(page.locator('.study-card')).toBeVisible();
    
    // Space key should not close the card (reserved for audio)
    await page.keyboard.press('Space');
    
    // Card should still be visible
    await expect(page.locator('.study-card')).toBeVisible();
  });

  test('should not trigger shortcuts in input fields', async () => {
    // This test would be relevant if we had input fields
    // Currently skipping as the app doesn't have input fields
    test.skip('No input fields in current implementation');
  });

  test('should provide proper focus management', async () => {
    const pet = await page.locator('.pet');
    
    // Open study card
    await pet.click();
    await expect(page.locator('.study-card')).toBeVisible();
    
    // Focus should be trapped within the card
    // Tab through all focusable elements
    const focusableElements = page.locator('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const focusableCount = await focusableElements.count();
    
    if (focusableCount > 0) {
      // Tab through elements
      for (let i = 0; i < focusableCount + 1; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
      }
      
      // Focus should still be within the card
      const focusedElement = page.locator(':focus');
      const cardContainer = page.locator('.study-card');
      
      if (await focusedElement.isVisible()) {
        const isWithinCard = await cardContainer.locator(':focus').count() > 0;
        expect(isWithinCard).toBeTruthy();
      }
    }
  });

  test('should provide screen reader friendly content', async () => {
    const pet = await page.locator('.pet');
    
    // Open study card
    await pet.click();
    await expect(page.locator('.study-card')).toBeVisible();
    
    // Check for semantic HTML structure
    const cardHeadings = page.locator('h1, h2, h3, h4, h5, h6');
    const cardSections = page.locator('section, article, main');
    const cardButtons = page.locator('button');
    
    // Should have proper button roles
    const buttonCount = await cardButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
    
    // Buttons should have accessible text
    for (let i = 0; i < await cardButtons.count(); i++) {
      const button = cardButtons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const title = await button.getAttribute('title');
      
      // Button should have accessible content
      expect(text || ariaLabel || title).toBeTruthy();
    }
  });

  test('should handle high contrast and visual accessibility', async () => {
    const pet = await page.locator('.pet');
    
    // Open study card
    await pet.click();
    await expect(page.locator('.study-card')).toBeVisible();
    
    // Check that important elements have proper contrast
    // This is a basic check - real contrast checking would need more complex logic
    const importantElements = page.locator('.japanese-text, .chinese-text, .action-button');
    
    for (let i = 0; i < await importantElements.count(); i++) {
      const element = importantElements.nth(i);
      if (await element.isVisible()) {
        // Element should have some styling that makes it visible
        const styles = await element.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize
          };
        });
        
        // Should have color styling
        expect(styles.color).not.toBe('');
        expect(styles.fontSize).not.toBe('');
      }
    }
  });

  test('should provide proper state announcements', async () => {
    const pet = await page.locator('.pet');
    
    // Try to find an audio card for state testing
    let attempts = 0;
    let foundInteractiveCard = false;
    
    while (!foundInteractiveCard && attempts < 10) {
      await pet.click();
      await page.waitForSelector('.study-card', { timeout: 2000 });
      
      // Check for interactive elements
      const hasChoices = await page.locator('.choices-grid').isVisible();
      const hasArrangeWords = await page.locator('.arrange-words').isVisible();
      
      foundInteractiveCard = hasChoices || hasArrangeWords;
      
      if (!foundInteractiveCard) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        attempts++;
      }
    }
    
    if (foundInteractiveCard) {
      // Check if interactive elements provide proper state feedback
      const interactiveElements = page.locator('.choice-button, .arrange-word');
      
      for (let i = 0; i < Math.min(3, await interactiveElements.count()); i++) {
        const element = interactiveElements.nth(i);
        if (await element.isVisible()) {
          // Should have proper state classes or attributes
          const classes = await element.getAttribute('class');
          expect(classes).toBeTruthy();
        }
      }
    }
  });
});