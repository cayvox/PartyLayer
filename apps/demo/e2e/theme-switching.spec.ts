/**
 * Theme Switching E2E Tests
 *
 * Tests light/dark/auto theme toggling on the kit-demo page.
 *
 * Scenarios:
 *  1. Default theme is light
 *  2. Switching to dark theme changes background
 *  3. Auto theme respects system preference
 */

import { test, expect } from '@playwright/test';

// Kit-demo design tokens (from apps/demo/src/app/kit-demo/page.tsx)
const LIGHT_BG = 'rgb(255, 255, 255)'; // #FFFFFF
const DARK_BG = 'rgb(11, 15, 26)';     // #0B0F1A

test.describe('Theme Switching — Kit Demo', () => {
  test('default theme is light', async ({ page }) => {
    await page.goto('/kit-demo');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /One SDK for every/i })).toBeVisible({ timeout: 15000 });

    // The root container div should have light background
    const rootContainer = page.locator('div[style*="min-height"]').first();
    await expect(rootContainer).toHaveCSS('background-color', LIGHT_BG);

    // The "Light" theme button should appear selected (has brand50 background and font-weight 600)
    const lightBtn = page.getByRole('button', { name: 'Light' });
    await expect(lightBtn).toBeVisible();
  });

  test('switching to dark theme changes background', async ({ page }) => {
    await page.goto('/kit-demo');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /One SDK for every/i })).toBeVisible({ timeout: 15000 });

    // Click "Dark" theme button
    const darkBtn = page.getByRole('button', { name: 'Dark' });
    await expect(darkBtn).toBeVisible();
    await darkBtn.click();

    // Background should change to dark
    const rootContainer = page.locator('div[style*="min-height"]').first();
    await expect(rootContainer).toHaveCSS('background-color', DARK_BG, { timeout: 3000 });
  });

  test('auto theme respects system dark preference', async ({ page }) => {
    // Emulate dark system preference BEFORE navigating
    await page.emulateMedia({ colorScheme: 'dark' });

    await page.goto('/kit-demo');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /One SDK for every/i })).toBeVisible({ timeout: 15000 });

    // Click "Auto" theme button
    const autoBtn = page.getByRole('button', { name: 'Auto' });
    await expect(autoBtn).toBeVisible();
    await autoBtn.click();

    // Background should be dark (respects system preference)
    const rootContainer = page.locator('div[style*="min-height"]').first();
    await expect(rootContainer).toHaveCSS('background-color', DARK_BG, { timeout: 3000 });
  });
});
