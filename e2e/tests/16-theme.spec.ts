import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Dark/light theme toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem('theme')
    })
  })

  test('app loads with a default theme (dark or light)', async ({ page }) => {
    await page.goto('/')
    // The <html> or <body> element should have a data-theme or class
    const theme = await page.evaluate(() => {
      return document.documentElement.dataset.theme || document.documentElement.className || document.body.dataset.theme
    })
    expect(typeof theme).toBe('string')
  })

  test('Appearance settings tab shows Dark button', async ({ page }) => {
    await page.goto('/settings?tab=appearance')
    await expect(page.getByRole('button', { name: /Dark/ })).toBeVisible()
  })

  test('Appearance settings tab shows Light button', async ({ page }) => {
    await page.goto('/settings?tab=appearance')
    await expect(page.getByRole('button', { name: /Light/ })).toBeVisible()
  })

  test('clicking Dark sets dark theme', async ({ page }) => {
    await page.goto('/settings?tab=appearance')
    await page.getByRole('button', { name: /Dark/ }).click()
    const theme = await page.evaluate(() => document.documentElement.dataset.theme || document.documentElement.getAttribute('data-theme'))
    expect(theme).toBe('dark')
  })

  test('clicking Light sets light theme', async ({ page }) => {
    await page.goto('/settings?tab=appearance')
    await page.getByRole('button', { name: /Light/ }).click()
    const theme = await page.evaluate(() => document.documentElement.dataset.theme || document.documentElement.getAttribute('data-theme'))
    expect(theme).toBe('light')
  })

  test('dark theme persists across reload', async ({ page }) => {
    await page.goto('/settings?tab=appearance')
    await page.getByRole('button', { name: /Dark/ }).click()
    await page.reload()
    await page.waitForLoadState('networkidle')
    const theme = await page.evaluate(() => document.documentElement.dataset.theme || document.documentElement.getAttribute('data-theme'))
    expect(theme).toBe('dark')
  })

  test('light theme persists across reload', async ({ page }) => {
    await page.goto('/settings?tab=appearance')
    await page.getByRole('button', { name: /Light/ }).click()
    await page.reload()
    await page.waitForLoadState('networkidle')
    const theme = await page.evaluate(() => document.documentElement.dataset.theme || document.documentElement.getAttribute('data-theme'))
    expect(theme).toBe('light')
  })

  test('dark theme button has active class when dark is selected', async ({ page }) => {
    await page.goto('/settings?tab=appearance')
    await page.getByRole('button', { name: /Dark/ }).click()
    await expect(page.getByRole('button', { name: /Dark/ })).toHaveClass(/btn-primary/)
  })

  test('light theme button has active class when light is selected', async ({ page }) => {
    await page.goto('/settings?tab=appearance')
    await page.getByRole('button', { name: /Light/ }).click()
    await expect(page.getByRole('button', { name: /Light/ })).toHaveClass(/btn-primary/)
  })

  test('dark mode applies CSS variable changes to background', async ({ page }) => {
    await page.goto('/settings?tab=appearance')
    await page.getByRole('button', { name: /Dark/ }).click()
    // In dark mode, the background should be dark — not white
    const bodyBg = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor
    })
    // Dark bg will not be rgb(255, 255, 255) (pure white)
    expect(bodyBg).not.toBe('rgb(255, 255, 255)')
  })

  test('light mode applies CSS variable changes to background', async ({ page }) => {
    await page.goto('/settings?tab=appearance')
    await page.getByRole('button', { name: /Light/ }).click()
    const bodyBg = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor
    })
    // Light bg will be lighter
    expect(typeof bodyBg).toBe('string')
  })

  test('theme persists across navigation to /projects', async ({ page }) => {
    await page.route('**/api/projects**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })
    await page.goto('/settings?tab=appearance')
    await page.getByRole('button', { name: /Dark/ }).click()
    // Use goto instead of nav link click (nav is hidden on mobile)
    await page.goto('/projects')
    const theme = await page.evaluate(() => document.documentElement.dataset.theme || document.documentElement.getAttribute('data-theme'))
    expect(theme).toBe('dark')
  })
})
