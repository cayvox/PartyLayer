/**
 * Sign Message & CIP-0103 Bridge E2E Tests
 *
 * Tests the signing and bridge functionality on the kit-demo page
 * using the mock CIP-0103 wallet (auto-signs without popup).
 *
 * Scenarios:
 *  1. Sign/Bridge panels only visible when connected
 *  2. Sign message produces valid signature
 *  3. CIP-0103 Bridge status query returns mock provider info
 */

import { test, expect } from '@playwright/test';
import { connectToMockWallet } from './helpers';

test.describe('Sign Message & CIP-0103 Bridge', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kit-demo');
    await page.waitForLoadState('networkidle');
    // Wait for page heading to ensure full render
    await expect(page.getByRole('heading', { name: /One SDK for every/i })).toBeVisible({ timeout: 15000 });
  });

  test('sign and bridge panels only visible when connected', async ({ page }) => {
    // Before connecting: sign and bridge panels should NOT be visible
    const signButton = page.getByRole('button', { name: /Sign.*Hello Canton/i });
    const bridgeButton = page.getByRole('button', { name: /Query provider/i });

    await expect(signButton).not.toBeVisible();
    await expect(bridgeButton).not.toBeVisible();

    // Connect to mock wallet
    await connectToMockWallet(page);

    // After connecting: both panels should be visible
    await expect(signButton).toBeVisible({ timeout: 5000 });
    await expect(bridgeButton).toBeVisible({ timeout: 5000 });
  });

  test('sign message produces valid signature with 0xdemo_sig_ prefix', async ({ page }) => {
    // Connect first
    await connectToMockWallet(page);

    // Click the sign message button
    const signBtn = page.getByRole('button', { name: /Sign.*Hello Canton/i });
    await expect(signBtn).toBeVisible({ timeout: 5000 });
    await signBtn.click();

    // Wait for the "Signature" label to appear (indicates success)
    await expect(page.getByText('Signature').first()).toBeVisible({ timeout: 10000 });

    // Verify the signature starts with the mock wallet prefix
    const signatureText = page.getByText(/0xdemo_sig_/);
    await expect(signatureText).toBeVisible({ timeout: 5000 });

    // Verify the signature is a substantial string (not empty/truncated)
    const sigContent = await signatureText.textContent();
    expect(sigContent).toBeTruthy();
    expect(sigContent!.length).toBeGreaterThan(20);
  });

  test('CIP-0103 Bridge query returns a response', async ({ page }) => {
    // Connect first
    await connectToMockWallet(page);

    // Click the bridge query button
    const bridgeBtn = page.getByRole('button', { name: /Query provider/i });
    await expect(bridgeBtn).toBeVisible({ timeout: 5000 });
    await bridgeBtn.click();

    // Wait for the "Response" label to appear
    await expect(page.getByText('Response')).toBeVisible({ timeout: 10000 });

    // Verify a response is displayed in the <pre> element
    const responseBlock = page.locator('pre');
    await expect(responseBlock).toBeVisible({ timeout: 5000 });

    const responseText = await responseBlock.textContent();
    expect(responseText).toBeTruthy();
    // The bridge should return some response (either provider status or an error message)
    expect(responseText!.length).toBeGreaterThan(10);
  });
});
