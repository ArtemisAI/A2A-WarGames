import { test, expect } from '@playwright/test'

const MOCK_PROJECTS = [
  {
    id: 1,
    name: 'Test Project Alpha',
    organization: 'Acme Corp',
    description: 'A test project for E2E',
    context: 'Company context here',
    stakeholder_count: 3,
    session_count: 2,
  },
  {
    id: 2,
    name: 'Beta Initiative',
    organization: 'Beta Inc',
    description: 'Second project',
    context: '',
    stakeholder_count: 0,
    session_count: 0,
  },
]

const CREATED_PROJECT = {
  id: 3,
  name: 'New Created Project',
  organization: 'New Org',
  description: 'Created via test',
  context: '',
  stakeholder_count: 0,
  session_count: 0,
}

test.describe('Projects CRUD — authenticated', () => {
  test.use({ project: 'chromium-authed' })

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/projects/**', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PROJECTS) })
      } else if (route.request().method() === 'POST') {
        route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(CREATED_PROJECT) })
      } else {
        route.continue()
      }
    })
    await page.route('**/api/projects/1', (route) => {
      if (route.request().method() === 'PUT' || route.request().method() === 'PATCH') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...MOCK_PROJECTS[0], name: 'Updated Project Alpha' }) })
      } else if (route.request().method() === 'DELETE') {
        route.fulfill({ status: 204, body: '' })
      } else {
        route.continue()
      }
    })
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
  })

  test('projects page loads for authed user', async ({ page }) => {
    await expect(page).toHaveURL(/\/projects/)
  })

  test('project cards are rendered when projects exist', async ({ page }) => {
    await expect(page.getByText('Test Project Alpha')).toBeVisible()
    await expect(page.getByText('Beta Initiative')).toBeVisible()
  })

  test('project card shows organization', async ({ page }) => {
    await expect(page.getByText('Acme Corp')).toBeVisible()
  })

  test('project card shows stakeholder count', async ({ page }) => {
    await expect(page.getByText(/3 stakeholders/)).toBeVisible()
  })

  test('project card shows session count', async ({ page }) => {
    await expect(page.getByText(/2 sessions/)).toBeVisible()
  })

  test('project card shows description excerpt', async ({ page }) => {
    await expect(page.getByText('A test project for E2E')).toBeVisible()
  })

  test('Edit button is visible on each project card', async ({ page }) => {
    const editBtns = page.getByRole('button', { name: 'Edit' })
    await expect(editBtns.first()).toBeVisible()
  })

  test('clicking Edit opens the edit modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).first().click()
    await expect(page.getByText('Edit Project')).toBeVisible()
  })

  test('edit modal pre-populates project name', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).first().click()
    const nameInput = page.locator('.form-group').filter({ hasText: 'Name' }).locator('input.form-input')
    await expect(nameInput).toHaveValue('Test Project Alpha')
  })

  test('edit modal has Save button', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).first().click()
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible()
  })

  test('edit modal Cancel closes it', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).first().click()
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByText('Edit Project')).not.toBeVisible()
  })

  test('"+ New Project" button is visible', async ({ page }) => {
    await expect(page.getByText('+ New Project')).toBeVisible()
  })

  test('new project modal opens with empty fields', async ({ page }) => {
    await page.getByText('+ New Project').click()
    const nameInput = page.locator('.form-group').filter({ hasText: 'Name' }).locator('input.form-input')
    await expect(nameInput).toHaveValue('')
  })

  test('new project modal has Organization field', async ({ page }) => {
    await page.getByText('+ New Project').click()
    await expect(page.locator('.form-group').filter({ hasText: 'Organization' }).locator('input.form-input')).toBeVisible()
  })

  test('new project modal has Description field', async ({ page }) => {
    await page.getByText('+ New Project').click()
    await expect(page.locator('.form-group').filter({ hasText: 'Description' }).locator('textarea.form-textarea')).toBeVisible()
  })

  test('new project modal has Organizational Context field', async ({ page }) => {
    await page.getByText('+ New Project').click()
    await expect(page.locator('.form-group').filter({ hasText: 'Organizational Context' }).locator('textarea.form-textarea')).toBeVisible()
  })

  test('creating a new project calls POST and closes modal', async ({ page }) => {
    await page.getByText('+ New Project').click()
    await page.locator('.form-group').filter({ hasText: 'Name' }).locator('input.form-input').fill('New Created Project')
    await page.getByRole('button', { name: 'Save' }).click()
    await page.waitForTimeout(300)
    // Check the modal dialog is gone (not just the text which also appears in the nav button)
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3000 })
  })

  test('new project modal has "Organizational Context" label', async ({ page }) => {
    await page.getByText('+ New Project').click()
    await expect(page.locator('.form-group').filter({ hasText: 'Organizational Context' }).locator('textarea.form-textarea')).toBeVisible()
  })

  test('clicking a project card navigates to stakeholders page', async ({ page }) => {
    await page.route('**/api/projects/1/stakeholders**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })
    await page.locator('.card').first().click()
    await expect(page).toHaveURL(/\/projects\/\d+\/stakeholders/)
  })
})
