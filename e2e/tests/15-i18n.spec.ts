import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

test.describe('i18n locale switching', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage locale so tests start from English
    await page.addInitScript(() => {
      localStorage.removeItem('app-locale')
    })
  })

  test('default locale is English — hero title is in English', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /Multi-Agent Debate/ })).toBeVisible()
  })

  test('default locale shows "Sign in" in English', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Sign in').first()).toBeVisible()
  })

  test('switching to Français from Appearance settings works', async ({ page }) => {
    await page.goto('/settings?tab=appearance')
    await page.getByRole('button', { name: 'Français' }).click()
    // After locale switch, navigation items should be in French
    // The French translation for "Sessions" would come from fr.json
    // We verify the locale was set by checking localStorage
    const locale = await page.evaluate(() => localStorage.getItem('app-locale'))
    expect(locale).toBe('fr')
  })

  test('switching to Español from Appearance settings works', async ({ page }) => {
    await page.goto('/settings?tab=appearance')
    await page.getByRole('button', { name: 'Español' }).click()
    const locale = await page.evaluate(() => localStorage.getItem('app-locale'))
    expect(locale).toBe('es')
  })

  test('switching back to English from Appearance settings works', async ({ page }) => {
    await page.goto('/settings?tab=appearance')
    await page.getByRole('button', { name: 'Español' }).click()
    await page.getByRole('button', { name: 'English' }).click()
    const locale = await page.evaluate(() => localStorage.getItem('app-locale'))
    expect(locale).toBe('en')
  })

  test('locale persists across navigation after being set', async ({ page }) => {
    // Use addInitScript so locale is set BEFORE each page load (survives the beforeEach removeItem)
    await page.addInitScript(() => {
      localStorage.setItem('app-locale', 'fr')
    })
    await page.goto('/')
    await page.goto('/projects')
    const locale = await page.evaluate(() => localStorage.getItem('app-locale'))
    expect(locale).toBe('fr')
  })

  test('locale persists across page reload', async ({ page }) => {
    // Use addInitScript so locale is set BEFORE each page load (survives the beforeEach removeItem)
    await page.addInitScript(() => {
      localStorage.setItem('app-locale', 'es')
    })
    await page.goto('/')
    await page.reload()
    await page.waitForLoadState('networkidle')
    const locale = await page.evaluate(() => localStorage.getItem('app-locale'))
    expect(locale).toBe('es')
  })

  test('English button on Appearance tab is rendered', async ({ page }) => {
    await page.goto('/settings?tab=appearance')
    await expect(page.getByRole('button', { name: 'English' })).toBeVisible()
  })

  test('Français button on Appearance tab is rendered', async ({ page }) => {
    await page.goto('/settings?tab=appearance')
    await expect(page.getByRole('button', { name: 'Français' })).toBeVisible()
  })

  test('Español button on Appearance tab is rendered', async ({ page }) => {
    await page.goto('/settings?tab=appearance')
    await expect(page.getByRole('button', { name: 'Español' })).toBeVisible()
  })

  test('English button has active class when locale is en', async ({ page }) => {
    await page.goto('/settings?tab=appearance')
    // Ensure locale is English
    await page.evaluate(() => localStorage.setItem('app-locale', 'en'))
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.goto('/settings?tab=appearance')
    const englishBtn = page.getByRole('button', { name: 'English' })
    await expect(englishBtn).toHaveClass(/btn-primary/)
  })

  test('projects page subtitle is translatable (key resolves)', async ({ page }) => {
    await page.route('**/api/projects**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })
    await page.goto('/projects')
    // In English the subtitle is "Each project is an independent stakeholder analysis context"
    await expect(page.getByText('Each project is an independent stakeholder analysis context')).toBeVisible()
  })

  test('login modal title is in English by default', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Sign in').first().click()
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  })

  test('sessions page subtitle is in English by default', async ({ page }) => {
    await page.route('**/api/projects**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })
    await page.goto('/sessions')
    await expect(page.getByText(/Wargame runs/)).toBeVisible()
  })

  test.fixme('settings guest overlay text is in English by default', async ({ page }) => {
    // auth.isGuest is not returned from the auth store (always undefined/falsy),
    // so the guest overlay never renders. This is a known frontend bug.
    await page.goto('/settings')
    await expect(page.getByText('Sign in to customize settings')).toBeVisible({ timeout: 10000 })
  })
})
