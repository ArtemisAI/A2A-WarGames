import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Landing page — guest', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('page loads without errors', async ({ page }) => {
    await expect(page).toHaveURL(/crew-ai\.me/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('brand name is present', async ({ page }) => {
    await expect(page.getByText('A2A War Games').first()).toBeVisible()
  })

  test('hero badge is visible', async ({ page }) => {
    await expect(page.getByText('A2A Protocol Research Platform')).toBeVisible()
  })

  test('hero title line 1 is rendered', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Multi-Agent Debate/ })).toBeVisible()
  })

  test('hero title accent word is rendered', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Simulation/ }).first()).toBeVisible()
  })

  test('hero subtitle text is visible', async ({ page }) => {
    await expect(page.getByText(/Watch autonomous LLM agents/)).toBeVisible()
  })

  test('"Launch Simulation" CTA button is visible', async ({ page }) => {
    await expect(page.getByText('Launch Simulation')).toBeVisible()
  })

  test('"Try Demo" CTA button is visible', async ({ page }) => {
    await expect(page.getByText('Try Demo').first()).toBeVisible()
  })

  test('GitHub link is present', async ({ page }) => {
    const githubLink = page.locator('a[href*="github.com"]').first()
    await expect(githubLink).toBeVisible()
  })

  test('stats row shows agent count', async ({ page }) => {
    await expect(page.getByText('Autonomous Agents').first()).toBeVisible()
  })

  test('stats row shows provider count', async ({ page }) => {
    await expect(page.getByText('LLM Providers').first()).toBeVisible()
  })

  test('stats row shows language count', async ({ page }) => {
    await expect(page.getByText('Languages').first()).toBeVisible()
  })

  test('A2A Protocol section heading is visible', async ({ page }) => {
    // Section is below fold — scroll to bring it into view
    await page.evaluate(() => window.scrollTo(0, 600))
    await expect(page.getByText('The A2A Protocol')).toBeVisible()
  })

  test('Capabilities section heading is visible', async ({ page }) => {
    await expect(page.getByText('Key Capabilities')).toBeVisible()
  })

  test('CTA section "Ready to Explore?" is visible', async ({ page }) => {
    await expect(page.getByText('Ready to Explore?')).toBeVisible()
  })

  test('footer brand is visible', async ({ page }) => {
    await expect(page.getByText('footerBrand').or(page.getByText('A2A War Games')).last()).toBeVisible()
  })

  test('footer copyright text is visible', async ({ page }) => {
    await expect(page.getByText(/ArtemisAI/).first()).toBeVisible()
  })

  test('"Launch Simulation" button navigates to projects', async ({ page }) => {
    await page.getByText('Launch Simulation').click()
    await expect(page).toHaveURL(/\/(projects|login)/)
  })
})
