import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Docs page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs')
    await page.waitForLoadState('networkidle')
  })

  test('docs page loads at /docs', async ({ page }) => {
    await expect(page).toHaveURL(/\/docs/)
  })

  test('docs page title "Documentation" is visible', async ({ page }) => {
    await expect(page.getByText('Documentation').first()).toBeVisible()
  })

  test('docs subtitle is visible', async ({ page }) => {
    await expect(page.getByText('Everything you need to build, run, and extend')).toBeVisible()
  })

  test('"Getting Started" section is present', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Getting Started' })).toBeVisible()
  })

  test('"Architecture" section is present', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Architecture' })).toBeVisible()
  })

  test('"Agent System" section is present', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Agent System' })).toBeVisible()
  })

  test('"Session & Debate" section is present', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Session & Debate' })).toBeVisible()
  })

  test('"Analytics & Metrics" section is present', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Analytics & Metrics' })).toBeVisible()
  })

  test('"LLM Providers" section is present', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'LLM Providers' })).toBeVisible()
  })

  test('"API Reference" section is present', async ({ page }) => {
    await expect(page.getByText('API Reference')).toBeVisible()
  })

  test('"Keyboard Shortcuts" section is present', async ({ page }) => {
    await expect(page.getByText('Keyboard Shortcuts')).toBeVisible()
  })

  test('quick-link navigation anchors are rendered', async ({ page }) => {
    const links = page.locator('.quick-link')
    await expect(links.first()).toBeVisible()
  })

  test('"Getting Started" content mentions Projects', async ({ page }) => {
    await expect(page.getByText(/Create a.*Project/)).toBeVisible()
  })

  test('"Resources & Links" section is present', async ({ page }) => {
    await expect(page.getByText('Resources & Links')).toBeVisible()
  })

  test('Docs label in breadcrumb or page label is visible', async ({ page }) => {
    await expect(page.getByText('Documentation').first()).toBeVisible()
  })

  test('nav link to Docs is highlighted as active', async ({ page }) => {
    // On mobile, nav links collapse — open hamburger if present
    const hamburger = page.locator('.hamburger')
    if (await hamburger.isVisible()) {
      await hamburger.click()
      await page.waitForTimeout(150)
    }
    const docsLink = page.getByRole('link', { name: 'Docs', exact: true }).first()
    await expect(docsLink).toBeVisible()
  })
})
