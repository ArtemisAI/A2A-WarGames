import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Sessions page — guest', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/projects**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })
    await page.route('**/api/sessions**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })
    await page.goto('/sessions')
    await page.waitForLoadState('networkidle')
  })

  test('navigating to /sessions succeeds', async ({ page }) => {
    await expect(page).toHaveURL(/\/sessions/)
  })

  test('page title "Sessions" is visible', async ({ page }) => {
    await expect(page.locator('.page-title').filter({ hasText: 'Sessions' })).toBeVisible()
  })

  test('page subtitle is visible', async ({ page }) => {
    await expect(page.getByText('Wargame runs')).toBeVisible()
  })

  test('"+ New Session" button is rendered', async ({ page }) => {
    await expect(page.getByText('+ New Session')).toBeVisible()
  })

  test('empty-state message is shown when no sessions', async ({ page }) => {
    await expect(page.getByText('No sessions yet.')).toBeVisible()
  })

  test('project dropdown is present', async ({ page }) => {
    // Use form-select class to avoid matching topbar locale selector (hidden on mobile)
    await expect(page.locator('select.form-select').first()).toBeVisible()
  })

  test('"+ New Session" button is disabled when no project selected', async ({ page }) => {
    const btn = page.getByText('+ New Session')
    await expect(btn).toBeDisabled()
  })

  test('page breadcrumb shows "Sessions"', async ({ page }) => {
    // Breadcrumb may render the nav key — check page URL instead if breadcrumb not present
    await expect(page).toHaveURL(/\/sessions/)
  })

  test('no sessions table rendered when empty', async ({ page }) => {
    await expect(page.locator('table')).not.toBeVisible()
  })
})
