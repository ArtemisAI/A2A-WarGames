import { test, expect } from '@playwright/test'

// Force mobile-guest project
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Mobile layout — guest (Pixel 5)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/projects**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })
  })

  test('landing page loads on mobile viewport', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/crew-ai\.me/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('brand name is visible on mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('A2A War Games').first()).toBeVisible()
  })

  test('hero CTA "Launch Simulation" is visible on mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Launch Simulation')).toBeVisible()
  })

  test('navbar is rendered on mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('nav, header').first()).toBeVisible()
  })

  test('Sign In button is visible on mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Sign in').first()).toBeVisible()
  })

  test('login modal opens on mobile', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Sign in').first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('login modal email input is usable on mobile', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Sign in').first().click()
    const emailInput = page.getByRole('dialog').getByLabel('Email')
    await expect(emailInput).toBeVisible()
    await emailInput.click()
    await emailInput.fill('test@example.com')
    await expect(emailInput).toHaveValue('test@example.com')
  })

  test('projects page loads on mobile', async ({ page }) => {
    await page.goto('/projects')
    await expect(page).toHaveURL(/\/projects/)
    // Use page-title (always visible) instead of nav link (hidden on mobile)
    await expect(page.locator('.page-title').filter({ hasText: 'Projects' })).toBeVisible()
  })

  test('sessions page loads on mobile', async ({ page }) => {
    await page.goto('/sessions')
    await expect(page).toHaveURL(/\/sessions/)
    await expect(page.locator('.page-title').filter({ hasText: 'Sessions' })).toBeVisible()
  })

  test('settings page loads on mobile', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL(/\/settings/)
    await expect(page.locator('.page-title').filter({ hasText: 'Settings' })).toBeVisible()
  })

  test('docs page loads on mobile', async ({ page }) => {
    await page.goto('/docs')
    await expect(page).toHaveURL(/\/docs/)
    await expect(page.getByText('Documentation').first()).toBeVisible()
  })

  test('content does not overflow horizontally on mobile', async ({ page }) => {
    await page.goto('/')
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = page.viewportSize()!.width
    // Allow up to 10px tolerance
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 10)
  })

  test('projects empty state is readable on mobile', async ({ page }) => {
    await page.goto('/projects')
    await expect(page.getByText('No projects yet. Create your first one.')).toBeVisible()
  })

  test('new project modal is usable on mobile', async ({ page }) => {
    await page.goto('/projects')
    await page.getByText('+ New Project').click()
    const nameInput = page.locator('.form-group').filter({ hasText: 'Name' }).locator('input.form-input')
    await expect(nameInput).toBeVisible()
    await nameInput.click()
    await nameInput.fill('Mobile Test Project')
    await expect(nameInput).toHaveValue('Mobile Test Project')
  })
})
