import { test, expect } from '@playwright/test'

const MOCK_PROJECTS = [
  { id: 1, name: 'Alpha Project', organization: 'Acme', description: '', context: '', stakeholder_count: 3, session_count: 2 },
]

const MOCK_STAKEHOLDERS = [
  { id: 1, slug: 'alice-cto', name: 'Alice Chen', color: '#7c3aed', role: 'CTO' },
  { id: 2, slug: 'bob-cfo', name: 'Bob Martinez', color: '#e94560', role: 'CFO' },
]

const MOCK_SESSIONS = [
  {
    id: 10,
    title: 'AI CRM Rollout Q3',
    status: 'complete',
    participants: ['alice-cto', 'bob-cfo'],
    consensus_score: 0.72,
    created_at: '2026-01-15T10:00:00Z',
    project_id: 1,
  },
  {
    id: 11,
    title: 'Data Privacy Policy',
    status: 'pending',
    participants: ['alice-cto'],
    consensus_score: null,
    created_at: '2026-02-01T09:00:00Z',
    project_id: 1,
  },
]

const CREATED_SESSION = {
  id: 12,
  title: 'New Test Session',
  status: 'pending',
  participants: ['alice-cto', 'bob-cfo'],
  consensus_score: null,
  created_at: new Date().toISOString(),
  project_id: 1,
}

test.describe('Sessions CRUD — authenticated', () => {
  test.use({ project: 'chromium-authed' })

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/projects/**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PROJECTS) })
    })
    await page.route('**/api/projects/1/stakeholders', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_STAKEHOLDERS) })
    })
    await page.route('**/api/projects/1/sessions', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_SESSIONS) })
      } else if (route.request().method() === 'POST') {
        route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(CREATED_SESSION) })
      } else {
        route.continue()
      }
    })
    await page.route('**/api/sessions/**', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_SESSIONS) })
      } else if (route.request().method() === 'POST') {
        route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(CREATED_SESSION) })
      } else {
        route.continue()
      }
    })
    await page.route('**/api/sessions/10', (route) => {
      if (route.request().method() === 'DELETE') {
        route.fulfill({ status: 204, body: '' })
      } else {
        route.continue()
      }
    })
    await page.goto('/sessions')
    await page.waitForLoadState('networkidle')
  })

  test('sessions page loads for authed user', async ({ page }) => {
    await expect(page).toHaveURL(/\/sessions/)
  })

  test('page title "Sessions" is visible', async ({ page }) => {
    await expect(page.locator('.page-title').filter({ hasText: 'Sessions' })).toBeVisible()
  })

  test('sessions table is rendered when sessions exist', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible()
  })

  test('session titles are shown in the table', async ({ page }) => {
    await expect(page.getByText('AI CRM Rollout Q3')).toBeVisible()
    await expect(page.getByText('Data Privacy Policy')).toBeVisible()
  })

  test('table header shows Title column', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Title' })).toBeVisible()
  })

  test('table header shows Status column', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible()
  })

  test('table header shows Participants column', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Participants' })).toBeVisible()
  })

  test('table header shows Consensus column', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Consensus' })).toBeVisible()
  })

  test('table header shows Created column', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Created' })).toBeVisible()
  })

  test('complete session shows consensus score as percentage', async ({ page }) => {
    await expect(page.getByText('72%')).toBeVisible()
  })

  test('pending session shows — for consensus', async ({ page }) => {
    await expect(page.getByText('—').first()).toBeVisible()
  })

  test('Launch button is present for each session', async ({ page }) => {
    const launchBtns = page.getByRole('button', { name: 'Launch' })
    await expect(launchBtns.first()).toBeVisible()
  })

  test('Analytics button is present for complete sessions', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Analytics' })).toBeVisible()
  })

  test('delete button (×) is present for each session', async ({ page }) => {
    const deleteBtns = page.locator('button[aria-label="Delete session"]').or(page.locator('button').filter({ hasText: '×' }))
    await expect(deleteBtns.first()).toBeVisible()
  })

  test('clicking Launch navigates to live view', async ({ page }) => {
    await page.route('**/api/sessions/10**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_SESSIONS[0]) })
    })
    await page.getByRole('button', { name: 'Launch' }).first().click()
    await expect(page).toHaveURL(/\/sessions\/\d+\/live/)
  })

  test('"+ New Session" button opens create modal', async ({ page }) => {
    await page.getByText('+ New Session').click()
    await expect(page.getByText('New Wargame Session')).toBeVisible()
  })

  test('create session modal has Strategic Question field', async ({ page }) => {
    await page.getByText('+ New Session').click()
    await expect(page.locator('.form-group').filter({ hasText: 'Strategic Question' }).locator('textarea, input').first()).toBeVisible()
  })

  test('create session modal has Session Title field', async ({ page }) => {
    await page.getByText('+ New Session').click()
    await expect(page.locator('.form-group').filter({ hasText: 'Session Title' }).locator('textarea, input').first()).toBeVisible()
  })

  test('create session modal has Participants section', async ({ page }) => {
    await page.getByText('+ New Session').click()
    await expect(page.getByText('Participants').first()).toBeVisible()
  })

  test('create session modal Cancel closes it', async ({ page }) => {
    await page.getByText('+ New Session').click()
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByText('New Wargame Session')).not.toBeVisible()
  })

  test('Create Session button is disabled when question is empty', async ({ page }) => {
    await page.getByText('+ New Session').click()
    const createBtn = page.getByRole('button', { name: 'Create Session' })
    await expect(createBtn).toBeDisabled()
  })

  test('delete button triggers confirm dialog', async ({ page }) => {
    const deleteBtn = page.locator('button[aria-label="Delete session"]').or(page.locator('button').filter({ hasText: '×' })).first()
    await deleteBtn.click()
    await expect(page.getByText('Delete this session?')).toBeVisible()
  })
})
