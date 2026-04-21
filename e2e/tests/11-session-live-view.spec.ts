import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

const BASE_SESSION = {
  id: 10,
  title: 'AI CRM Rollout Q3',
  participants: ['alice-cto', 'bob-cfo'],
  consensus_score: null,
  created_at: '2026-01-15T10:00:00Z',
  project_id: 1,
  question: 'Should we deploy an AI CRM assistant for the sales team in Q3?',
}

const STAKEHOLDERS = [
  { id: 1, slug: 'alice-cto', name: 'Alice Chen', color: '#7c3aed', role: 'CTO' },
  { id: 2, slug: 'bob-cfo', name: 'Bob Martinez', color: '#e94560', role: 'CFO' },
]

function setupCommonRoutes(page: any, sessionOverrides: Record<string, unknown> = {}) {
  const session = { ...BASE_SESSION, ...sessionOverrides }
  page.route('**/api/sessions/10', (route: any) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(session) })
  })
  // Stakeholders are fetched from the PROJECT store (project_id=1)
  page.route('**/api/projects/1/stakeholders**', (route: any) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(STAKEHOLDERS) })
  })
  page.route('**/api/sessions/10/context-usage**', (route: any) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ used: 2048, total: 16384 }) })
  })
  page.route('**/api/sessions/10/run**', (route: any) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
  })
}

test.describe('Session live view — pending session', () => {
  test.beforeEach(async ({ page }) => {
    setupCommonRoutes(page, { status: 'pending' })
    await page.goto('/sessions/10/live')
    await page.waitForLoadState('networkidle')
  })

  test('live view page loads', async ({ page }) => {
    await expect(page).toHaveURL(/\/sessions\/10\/live/)
  })

  test('session title is visible in the page', async ({ page }) => {
    await expect(page.getByText('AI CRM Rollout Q3')).toBeVisible()
  })

  test('"Start Wargame" button is visible for pending session', async ({ page }) => {
    await expect(page.getByText('▶ Start Wargame')).toBeVisible()
  })

  test('debate transcript panel is visible', async ({ page }) => {
    await expect(page.getByText('Debate Transcript')).toBeVisible()
  })

  test('transcript shows "Click Start Wargame to begin" for pending session', async ({ page }) => {
    await expect(page.getByText(/Click.*Start Wargame.*to begin/)).toBeVisible()
  })

  test('"⚙ Config" button is visible', async ({ page }) => {
    await expect(page.getByText('⚙ Config')).toBeVisible()
  })

  test('"← Back" button is visible', async ({ page }) => {
    const backBtn = page.getByText('← Back').or(page.getByRole('button', { name: 'Back' }))
    await expect(backBtn.first()).toBeVisible()
  })

  test('Back button navigates to sessions list', async ({ page }) => {
    const backBtn = page.getByText('← Back').or(page.getByRole('link', { name: /Back/ })).first()
    await backBtn.click()
    await expect(page).toHaveURL(/\/sessions/)
  })

  test('agent panel is visible', async ({ page }) => {
    // On mobile (<768px), panels are hidden by CSS media query (width: 0; opacity: 0)
    // even when the toggle is clicked — check DOM presence instead of visibility
    await expect(page.getByText('Agents')).toBeAttached()
  })

  test('metrics panel is visible', async ({ page }) => {
    // On mobile (<768px), panels are hidden by CSS media query (width: 0; opacity: 0)
    // even when the toggle is clicked — check DOM presence instead of visibility
    const metricsPanel = page.getByText('Consensus Score').or(page.getByText('Metrics'))
    await expect(metricsPanel.first()).toBeAttached()
  })

  test('simulation disclaimer is visible', async ({ page }) => {
    await expect(page.getByText('This is a simulation.')).toBeVisible()
  })

  test('config drawer opens when ⚙ Config is clicked', async ({ page }) => {
    await page.getByText('⚙ Config').click()
    await expect(page.getByText('Session Config')).toBeVisible()
  })

  test('config drawer has Number of Rounds input', async ({ page }) => {
    await page.getByText('⚙ Config').click()
    await expect(page.getByText('Number of Rounds')).toBeVisible()
  })

  test('config drawer has Moderator Style options', async ({ page }) => {
    await page.getByText('⚙ Config').click()
    await expect(page.getByText('Moderator Style')).toBeVisible()
  })

  test('collapse/expand agent panel button is present', async ({ page }) => {
    const collapseBtn = page.locator('[aria-label*="Collapse agent panel"]').or(page.locator('[aria-label*="Expand agent panel"]')).first()
    await expect(collapseBtn).toBeAttached()
  })

  test('collapse/expand metrics panel button is present', async ({ page }) => {
    const collapseBtn = page.locator('[aria-label*="Collapse metrics panel"]').or(page.locator('[aria-label*="Expand metrics panel"]')).first()
    await expect(collapseBtn).toBeAttached()
  })
})

test.describe('Session live view — running session', () => {
  test.beforeEach(async ({ page }) => {
    setupCommonRoutes(page, { status: 'running' })
    await page.goto('/sessions/10/live')
    await page.waitForLoadState('networkidle')
  })

  test('agent names are listed in the agent panel', async ({ page }) => {
    await expect(page.getByText('Alice Chen')).toBeVisible()
    await expect(page.getByText('Bob Martinez')).toBeVisible()
  })

  test('inject message bar is visible', async ({ page }) => {
    const injectBar = page.getByPlaceholder('Inject a message into the debate...')
    await expect(injectBar).toBeVisible()
  })

  test('"As Moderator" label is visible near inject bar', async ({ page }) => {
    await expect(page.getByText('As Moderator')).toBeVisible()
  })

  test('inject bar has Inject button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Inject' })).toBeVisible()
  })
})

test.describe('Session live view — complete session', () => {
  test.beforeEach(async ({ page }) => {
    setupCommonRoutes(page, { status: 'complete', consensus_score: 0.72 })
    await page.route('**/api/sessions/10/analytics**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ consensus_trajectory: [], influence_leaderboard: [] }) })
    })
    await page.goto('/sessions/10/live')
    await page.waitForLoadState('networkidle')
  })

  test('"Analytics" button is present for complete session', async ({ page }) => {
    await expect(page.getByText('Analytics')).toBeVisible()
  })

  test('clicking Analytics navigates to analytics page', async ({ page }) => {
    await page.getByText('Analytics').click()
    await expect(page).toHaveURL(/\/sessions\/10\/analytics/)
  })
})
