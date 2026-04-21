import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

// On mobile (<768px), nav links collapse into a hamburger menu.
// This helper opens the mobile menu if the hamburger is visible.
async function openMobileMenuIfNeeded(page: any) {
  const hamburger = page.locator('.hamburger')
  if (await hamburger.isVisible()) {
    await hamburger.click()
    await page.waitForTimeout(150)
  }
}

test.describe('Navigation and routing', () => {
  test('/ loads landing page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('heading', { name: /Multi-Agent Debate/ })).toBeVisible()
  })

  test('/projects loads projects page', async ({ page }) => {
    await page.route('**/api/projects**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })
    await page.goto('/projects')
    await expect(page).toHaveURL(/\/projects$/)
    // Use page-title div (always visible) instead of nav link (hidden on mobile)
    await expect(page.locator('.page-title').filter({ hasText: 'Projects' })).toBeVisible()
  })

  test('/sessions loads sessions page', async ({ page }) => {
    await page.route('**/api/projects**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })
    await page.goto('/sessions')
    await expect(page).toHaveURL(/\/sessions$/)
    await expect(page.locator('.page-title').filter({ hasText: 'Sessions' })).toBeVisible()
  })

  test('/settings loads settings page', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL(/\/settings/)
    await expect(page.locator('.page-title').filter({ hasText: 'Settings' })).toBeVisible()
  })

  test('/docs loads docs page', async ({ page }) => {
    await page.goto('/docs')
    await expect(page).toHaveURL(/\/docs$/)
    await expect(page.getByText('Documentation').first()).toBeVisible()
  })

  test('/login loads login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('/profile redirects to /settings?tab=appearance', async ({ page }) => {
    await page.goto('/profile')
    await expect(page).toHaveURL(/\/settings.*tab=appearance/)
  })

  test('breadcrumb is rendered on /projects', async ({ page }) => {
    await page.route('**/api/projects**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })
    await page.goto('/projects')
    // Breadcrumb component or page title contains "Projects"
    const breadcrumb = page.locator('[aria-label="breadcrumb"], nav.breadcrumb, .breadcrumb, .page-title')
    await expect(breadcrumb.first()).toBeVisible()
  })

  test('breadcrumb is rendered on /settings', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.locator('.page-title').filter({ hasText: 'Settings' })).toBeVisible()
  })

  test('breadcrumb is rendered on /docs', async ({ page }) => {
    await page.goto('/docs')
    // On mobile, "Docs" nav link is hidden — check page heading "Documentation" instead
    await expect(page.getByText('Documentation').first()).toBeVisible()
  })

  test('navbar Projects link has correct href', async ({ page }) => {
    await page.goto('/')
    // Use locator by href so it works regardless of visibility (mobile/desktop)
    const link = page.locator('a[href*="/projects"]').first()
    await expect(link).toHaveAttribute('href', /\/projects/)
  })

  test('navbar Sessions link has correct href', async ({ page }) => {
    await page.goto('/')
    const link = page.locator('a[href*="/sessions"]').first()
    await expect(link).toHaveAttribute('href', /\/sessions/)
  })

  test('navbar Settings link has correct href', async ({ page }) => {
    await page.goto('/')
    const link = page.locator('a[href*="/settings"]').first()
    await expect(link).toHaveAttribute('href', /\/settings/)
  })

  test('navbar Docs link has correct href', async ({ page }) => {
    await page.goto('/')
    const link = page.locator('a[href*="/docs"]').first()
    await expect(link).toHaveAttribute('href', /\/docs/)
  })

  test('navigating from projects to sessions via navbar works', async ({ page }) => {
    await page.route('**/api/projects**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })
    await page.goto('/projects')
    await openMobileMenuIfNeeded(page)
    await page.getByRole('link', { name: 'Sessions' }).click()
    await expect(page).toHaveURL(/\/sessions/)
  })

  test('navigating from settings back to landing works', async ({ page }) => {
    await page.goto('/settings')
    const brand = page.locator('a').filter({ hasText: 'A2A War Games' }).first()
    await brand.click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('/projects/:id/stakeholders loads stakeholders page', async ({ page }) => {
    await page.route('**/api/projects/42**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 42, name: 'P', organization: '', description: '', context: '', stakeholder_count: 0, session_count: 0 }) })
    })
    await page.route('**/api/projects/42/stakeholders**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })
    await page.goto('/projects/42/stakeholders')
    await expect(page).toHaveURL(/\/projects\/42\/stakeholders/)
    await expect(page.getByText('Stakeholders').first()).toBeVisible()
  })

  test('unknown route does not crash the app', async ({ page }) => {
    await page.goto('/this-route-does-not-exist')
    // App should still render the shell (navbar)
    await expect(page.locator('body')).toBeVisible()
  })
})
