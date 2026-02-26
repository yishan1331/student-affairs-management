import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/login');
	});

	test('should display login form', async ({ page }) => {
		// Ant Design login form should be visible
		await expect(page.locator('form')).toBeVisible();
		// Should have username and password inputs
		await expect(page.getByRole('textbox', { name: /帳號|account|username/i })).toBeVisible();
		await expect(page.locator('input[type="password"]')).toBeVisible();
	});

	test('should show error on invalid credentials', async ({ page }) => {
		await page.getByRole('textbox', { name: /帳號|account|username/i }).fill('wronguser');
		await page.locator('input[type="password"]').fill('wrongpass');
		await page.getByRole('button', { name: /登入|login|sign in/i }).click();

		// Should show error notification or message
		await expect(page.locator('.ant-notification, .ant-message, .ant-alert')).toBeVisible({ timeout: 10000 });
	});

	test('should redirect to login when not authenticated', async ({ page }) => {
		await page.goto('/');
		// Should redirect to login page
		await expect(page).toHaveURL(/\/login/);
	});
});
