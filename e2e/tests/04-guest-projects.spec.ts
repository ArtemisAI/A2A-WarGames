import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Projects page — guest', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the projects API so it returns an empty list
    await page.route('**/api/projects**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
  })

  test('navigating to /projects succeeds', async ({ page }) => {
    await expect(page).toHaveURL(/\/projects/)
  })

  test('page title "Projects" is visible', async ({ page }) => {
    await expect(page.locator('.page-title').filter({ hasText: 'Projects' })).toBeVisible()
  })

  test('page subtitle is visible', async ({ page }) => {
    await expect(page.getByText('Each project is an independent stakeholder analysis context')).toBeVisible()
  })

  test('"Load Demo Projects" button is visible', async ({ page }) => {
    await expect(page.getByText('Load Demo Projects')).toBeVisible()
  })

  test('"+ New Project" button is visible', async ({ page }) => {
    await expect(page.getByText('+ New Project')).toBeVisible()
  })

  test('empty-state message is shown when no projects', async ({ page }) => {
    await expect(page.getByText('No projects yet. Create your first one.')).toBeVisible()
  })

  test('clicking "+ New Project" opens a modal', async ({ page }) => {
    await page.getByText('+ New Project').click()
    await expect(page.getByText('New Project').last()).toBeVisible()
  })

  test('project modal has a Name field', async ({ page }) => {
    await page.getByText('+ New Project').click()
    await expect(page.locator('.form-group').filter({ hasText: 'Name' }).locator('input.form-input')).toBeVisible()
  })

  test('project modal has a Cancel button', async ({ page }) => {
    await page.getByText('+ New Project').click()
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })

  test('project modal Cancel button closes the modal', async ({ page }) => {
    await page.getByText('+ New Project').click()
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('project modal has a Save button', async ({ page }) => {
    await page.getByText('+ New Project').click()
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible()
  })
})
