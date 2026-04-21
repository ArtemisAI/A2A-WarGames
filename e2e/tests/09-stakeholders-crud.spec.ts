import { test, expect } from '@playwright/test'

const MOCK_PROJECT = { id: 1, name: 'Alpha Project', organization: 'Acme', description: '', context: '', stakeholder_count: 2, session_count: 0 }

const MOCK_STAKEHOLDERS = [
  {
    id: 1,
    slug: 'alice-cto',
    name: 'Alice Chen',
    role: 'CTO',
    department: 'Engineering',
    color: '#7c3aed',
    influence: 0.8,
    interest: 0.7,
    attitude: 'supportive',
    adkar_awareness: 4,
    adkar_desire: 3,
    adkar_knowledge: 4,
    adkar_ability: 3,
    adkar_reinforcement: 2,
    project_id: 1,
  },
  {
    id: 2,
    slug: 'bob-cfo',
    name: 'Bob Martinez',
    role: 'CFO',
    department: 'Finance',
    color: '#e94560',
    influence: 0.6,
    interest: 0.5,
    attitude: 'neutral',
    adkar_awareness: 3,
    adkar_desire: 2,
    adkar_knowledge: 2,
    adkar_ability: 2,
    adkar_reinforcement: 1,
    project_id: 1,
  },
]

const NEW_STAKEHOLDER = {
  id: 3,
  slug: 'carol-pm',
  name: 'Carol Davis',
  role: 'Product Manager',
  department: 'Product',
  color: '#10b981',
  influence: 0.5,
  interest: 0.9,
  attitude: 'supportive',
  adkar_awareness: 4,
  adkar_desire: 4,
  adkar_knowledge: 3,
  adkar_ability: 3,
  adkar_reinforcement: 3,
  project_id: 1,
}

test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Stakeholders CRUD — authenticated', () => {

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/projects/**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([MOCK_PROJECT]) })
    })
    await page.route('**/api/projects/1', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PROJECT) })
    })
    await page.route('**/api/projects/1/stakeholders', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_STAKEHOLDERS) })
      } else if (route.request().method() === 'POST') {
        route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(NEW_STAKEHOLDER) })
      } else {
        route.continue()
      }
    })
    await page.route('**/api/projects/1/stakeholders/1', (route) => {
      if (route.request().method() === 'PUT' || route.request().method() === 'PATCH') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...MOCK_STAKEHOLDERS[0], role: 'Updated Role' }) })
      } else if (route.request().method() === 'DELETE') {
        route.fulfill({ status: 204, body: '' })
      } else {
        route.continue()
      }
    })
    // Also handle stakeholders directly under /api/stakeholders if the app uses that
    await page.route('**/api/stakeholders**', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_STAKEHOLDERS) })
      } else {
        route.continue()
      }
    })
    await page.goto('/projects/1/stakeholders')
    await page.waitForLoadState('networkidle')
  })

  test('stakeholders page loads for authed user', async ({ page }) => {
    await expect(page).toHaveURL(/\/projects\/1\/stakeholders/)
  })

  test('page title "Stakeholders" is visible', async ({ page }) => {
    await expect(page.getByText('Stakeholders').first()).toBeVisible()
  })

  test('page subtitle is visible', async ({ page }) => {
    await expect(page.getByText('Manage agent personas per project')).toBeVisible()
  })

  test('"+ Add Stakeholder" button is visible', async ({ page }) => {
    await expect(page.getByText('+ Add Stakeholder')).toBeVisible()
  })

  test('stakeholder names are listed in table', async ({ page }) => {
    await expect(page.getByText('Alice Chen')).toBeVisible()
    await expect(page.getByText('Bob Martinez')).toBeVisible()
  })

  test('stakeholder roles are shown', async ({ page }) => {
    await expect(page.getByText('CTO')).toBeVisible()
    await expect(page.getByText('CFO')).toBeVisible()
  })

  test('table shows Name column header', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible()
  })

  test('table shows Role column header', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Role' })).toBeVisible()
  })

  test('table shows Attitude column header', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Attitude' })).toBeVisible()
  })

  test('table shows Influence column header', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Influence' })).toBeVisible()
  })

  test('table shows ADKAR avg column header', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: /ADKAR/i })).toBeVisible()
  })

  test('table shows Actions column header', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible()
  })

  test('Edit button is visible for each stakeholder row', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Edit' }).first()).toBeVisible()
  })

  test('clicking Edit opens stakeholder edit modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).first().click()
    await expect(page.getByText(/Edit: Alice Chen/)).toBeVisible()
  })

  test('edit modal has Name field pre-populated', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).first().click()
    // Labels have no `for` attribute — use form-group filter
    const nameInput = page.locator('.form-group').filter({ hasText: 'Name *' }).locator('input.form-input')
    await expect(nameInput).toHaveValue('Alice Chen')
  })

  test('edit modal has Slug field', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).first().click()
    await expect(page.locator('.form-group').filter({ hasText: 'Slug' }).locator('input.form-input')).toBeVisible()
  })

  test('edit modal has Influence range input', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).first().click()
    await expect(page.locator('.form-group').filter({ hasText: 'Influence' }).locator('input[type="number"]')).toBeVisible()
  })

  test('edit modal Cancel closes it', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).first().click()
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByText(/Edit: Alice Chen/)).not.toBeVisible()
  })

  test('edit modal has Save button', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).first().click()
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible()
  })

  test('"+ Add Stakeholder" opens create modal', async ({ page }) => {
    await page.getByText('+ Add Stakeholder').click()
    await expect(page.getByText('New Stakeholder')).toBeVisible()
  })

  test('new stakeholder modal has Name field empty', async ({ page }) => {
    await page.getByText('+ Add Stakeholder').click()
    // Labels have no `for` attribute — use form-group filter
    await expect(page.locator('.form-group').filter({ hasText: 'Name *' }).locator('input.form-input')).toHaveValue('')
  })

  test('new stakeholder modal has Slug field', async ({ page }) => {
    await page.getByText('+ Add Stakeholder').click()
    await expect(page.locator('.form-group').filter({ hasText: 'Slug' }).locator('input.form-input')).toBeVisible()
  })

  test('new stakeholder modal has Department field', async ({ page }) => {
    await page.getByText('+ Add Stakeholder').click()
    await expect(page.locator('.form-group').filter({ hasText: 'Department' }).locator('input.form-input')).toBeVisible()
  })

  test('new stakeholder modal has Color field', async ({ page }) => {
    await page.getByText('+ Add Stakeholder').click()
    await expect(page.locator('.form-group').filter({ hasText: 'Color' }).locator('input[type="color"]')).toBeVisible()
  })

  test('new stakeholder modal has ADKAR Scores section', async ({ page }) => {
    await page.getByText('+ Add Stakeholder').click()
    await expect(page.getByText(/ADKAR Scores/)).toBeVisible()
  })

  test('new stakeholder modal has Advanced Profile section', async ({ page }) => {
    await page.getByText('+ Add Stakeholder').click()
    await expect(page.getByText('Advanced Profile')).toBeVisible()
  })

  test('delete button triggers confirm dialog', async ({ page }) => {
    // The × button calls window.confirm() — use Playwright's dialog event to detect it
    const removeBtn = page.locator('button[aria-label*="Remove"]').first()
    let dialogTriggered = false
    page.once('dialog', async (dialog) => {
      dialogTriggered = true
      await dialog.dismiss()
    })
    await removeBtn.click()
    // Small wait for the sync confirm() call to complete
    await page.waitForTimeout(200)
    expect(dialogTriggered).toBe(true)
  })
})
