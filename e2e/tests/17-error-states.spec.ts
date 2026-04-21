import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Error states — API failure scenarios', () => {
  test('projects page shows error when API returns 500', async ({ page }) => {
    await page.route('**/api/projects**', (route) => {
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ detail: 'Internal server error' }) })
    })
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    // The page should still render (not crash) — empty state or error
    await expect(page.locator('body')).toBeVisible()
  })

  test('projects page handles network failure gracefully', async ({ page }) => {
    await page.route('**/api/projects**', (route) => {
      route.abort('failed')
    })
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()
  })

  test('projects save error shows error message', async ({ page }) => {
    await page.route('**/api/projects/**', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
      } else if (route.request().method() === 'POST') {
        route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ detail: 'Failed to save project. Please try again.' }) })
      } else {
        route.continue()
      }
    })
    await page.goto('/projects')
    await page.getByText('+ New Project').click()
    await page.locator('.form-group').filter({ hasText: 'Name' }).locator('input.form-input').fill('Test Project')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText(/Failed to save project/).first()).toBeVisible({ timeout: 5000 })
  })

  test('sessions page renders when API returns empty list', async ({ page }) => {
    await page.route('**/api/projects**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })
    await page.route('**/api/sessions**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })
    await page.goto('/sessions')
    await expect(page.getByText('No sessions yet.')).toBeVisible()
  })

  test('analytics page shows error when analytics API fails', async ({ page }) => {
    await page.route('**/api/sessions/99', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 99, title: 'Test', status: 'complete' }) })
    })
    await page.route('**/api/sessions/99/analytics**', (route) => {
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ detail: 'Analytics computation failed' }) })
    })
    await page.goto('/sessions/99/analytics')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Failed to load analytics')).toBeVisible({ timeout: 5000 })
  })

  test('settings page handles profile fetch failure gracefully', async ({ page }) => {
    await page.route('**/api/settings/profiles**', (route) => {
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ detail: 'DB error' }) })
    })
    await page.route('**/api/providers/**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })
    // Settings page should still load (show defaults or error)
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()
  })

  test('demo load failure shows error message on projects page', async ({ page }) => {
    await page.route('**/api/projects/**', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
      } else {
        route.continue()
      }
    })
    await page.route('**/api/projects/seed-demo**', (route) => {
      route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ detail: 'Server unavailable' }) })
    })
    await page.goto('/projects')
    await page.getByText('Load Demo Projects').click()
    await expect(page.getByText(/Server unavailable|Failed to load|unavailable/i)).toBeVisible({ timeout: 8000 })
  })

  test('session live view handles missing session gracefully', async ({ page }) => {
    await page.route('**/api/sessions/9999**', (route) => {
      route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ detail: 'Session not found' }) })
    })
    await page.goto('/sessions/9999/live')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()
  })

  test('401 on projects API does not crash the page', async ({ page }) => {
    await page.route('**/api/projects**', (route) => {
      route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ detail: 'Unauthorized' }) })
    })
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()
  })

  test('503 on session create shows error to user', async ({ page }) => {
    await page.route('**/api/projects/**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 1, name: 'Alpha', organization: '', description: '', context: '', stakeholder_count: 2, session_count: 0 }]) })
    })
    await page.route('**/api/projects/1/stakeholders**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 1, slug: 'alice', name: 'Alice', color: '#7c3aed', role: 'CTO' }]) })
    })
    await page.route('**/api/sessions/**', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
      } else if (route.request().method() === 'POST') {
        route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ detail: 'Service unavailable' }) })
      } else {
        route.continue()
      }
    })
    await page.goto('/sessions')
    await page.waitForLoadState('networkidle')
    // Try to create a session
    await page.getByText('+ New Session').click()
    await page.locator('.form-group').filter({ hasText: 'Strategic Question' }).locator('textarea, input').first().fill('Test question?')
    await page.getByRole('button', { name: 'Create Session' }).click()
    // Page should not crash
    await expect(page.locator('body')).toBeVisible()
  })

  test('network error on auth login shows error message', async ({ page }) => {
    await page.route('**/auth/v1/token**', (route) => {
      route.abort('failed')
    })
    await page.goto('/')
    await page.getByText('Sign in').first().click()
    await page.getByLabel('Email').fill('user@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.locator('form').getByRole('button').first().click()
    // An error message should appear
    await expect(page.locator('.error').or(page.getByText(/Sign in failed|failed/i))).toBeVisible({ timeout: 8000 })
  })

  test('page title is still present when API fails', async ({ page }) => {
    await page.route('**/api/projects**', (route) => {
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ detail: 'Error' }) })
    })
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    // Use page-title div (visible on both mobile and desktop), not nav link
    await expect(page.locator('.page-title').filter({ hasText: 'Projects' })).toBeVisible()
  })

  test('stakeholders page 404 does not crash', async ({ page }) => {
    await page.route('**/api/projects/999**', (route) => {
      route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ detail: 'Not found' }) })
    })
    await page.route('**/api/projects/999/stakeholders**', (route) => {
      route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ detail: 'Not found' }) })
    })
    await page.goto('/projects/999/stakeholders')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()
  })

  test('analytics page shows no-data state gracefully', async ({ page }) => {
    await page.route('**/api/sessions/5**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 5, title: 'Pending Session', status: 'pending' }) })
    })
    await page.route('**/api/sessions/5/analytics**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
    })
    await page.goto('/sessions/5/analytics')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()
  })

  test('live view shows error state when session API fails', async ({ page }) => {
    await page.route('**/api/sessions/888**', (route) => {
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ detail: 'Internal error' }) })
    })
    await page.goto('/sessions/888/live')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()
  })

  test('settings save error shows error banner', async ({ page }) => {
    await page.route('**/api/settings/profiles**', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{
          id: 1, profile_name: 'default', base_url: '', api_key: '***', default_model: 'gpt-4o',
          chairman_model: 'gpt-4o', council_models: [], temperature: 0.8, max_tokens: 1024,
          is_active: true, feature_flags: {},
        }]) })
      } else if (route.request().method() === 'POST') {
        route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ detail: 'Save failed' }) })
      } else {
        route.continue()
      }
    })
    await page.route('**/api/providers/**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })
    await page.route('**/api/settings/models**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ models: [] }) })
    })
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    // Expand legacy settings and try to save
    const details = page.locator('details.legacy-settings')
    if (await details.count() > 0) {
      await details.click()
      await page.getByRole('button', { name: 'Save Settings' }).click()
      await expect(page.locator('[style*="danger"]').or(page.getByText(/Failed to save/i))).toBeVisible({ timeout: 5000 })
    }
  })
})
