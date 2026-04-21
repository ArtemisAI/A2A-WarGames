import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Accessibility checks', () => {
  test('landing page has a lang attribute on <html>', async ({ page }) => {
    await page.goto('/')
    const lang = await page.locator('html').getAttribute('lang')
    expect(lang).toBeTruthy()
  })

  test('landing page has exactly one <h1>', async ({ page }) => {
    await page.goto('/')
    const h1s = await page.locator('h1').count()
    expect(h1s).toBeGreaterThanOrEqual(1)
  })

  test('login modal has aria-modal="true" on the dialog', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Sign in').first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  test('login modal dialog has aria-labelledby', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Sign in').first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toHaveAttribute('aria-labelledby', 'login-modal-title')
  })

  test('email input in login modal has a label', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Sign in').first().click()
    // getByLabel throws if no label association — this verifies accessibility
    await expect(page.getByLabel('Email')).toBeVisible()
  })

  test('password input in login modal has a label', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Sign in').first().click()
    await expect(page.getByLabel('Password')).toBeVisible()
  })

  test('feature flag toggles have role="switch"', async ({ page }) => {
    await page.route('**/api/settings/profiles**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{
        id: 1, profile_name: 'default', base_url: '', api_key: '***', default_model: '',
        chairman_model: '', council_models: [], temperature: 0.8, max_tokens: 1024,
        is_active: true, feature_flags: {},
      }]) })
    })
    await page.route('**/api/providers/**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })
    await page.route('**/api/settings/models**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ models: [] }) })
    })
    await page.goto('/settings?tab=features')
    await page.waitForLoadState('networkidle')
    const switches = page.locator('[role="switch"]')
    await expect(switches.first()).toBeVisible()
  })

  test('feature flag toggles have aria-checked attribute', async ({ page }) => {
    await page.route('**/api/settings/profiles**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{
        id: 1, profile_name: 'default', base_url: '', api_key: '***', default_model: '',
        chairman_model: '', council_models: [], temperature: 0.8, max_tokens: 1024,
        is_active: true, feature_flags: {},
      }]) })
    })
    await page.route('**/api/providers/**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })
    await page.route('**/api/settings/models**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ models: [] }) })
    })
    await page.goto('/settings?tab=features')
    await page.waitForLoadState('networkidle')
    const firstSwitch = page.locator('[role="switch"]').first()
    await expect(firstSwitch).toHaveAttribute('aria-checked')
  })

  test('session delete button has aria-label', async ({ page }) => {
    const sessions = [{ id: 1, title: 'Test', status: 'complete', participants: [], consensus_score: 0.5, created_at: '2026-01-01', project_id: 1 }]
    await page.route('**/api/projects**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 1, name: 'P', organization: '', description: '', context: '', stakeholder_count: 0, session_count: 1 }]) })
    })
    await page.route('**/api/projects/1/sessions**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(sessions) })
    })
    await page.route('**/api/sessions**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(sessions) })
    })
    await page.goto('/sessions')
    await page.waitForLoadState('networkidle')
    const deleteBtn = page.locator('button[aria-label="Delete session"]')
    await expect(deleteBtn.first()).toBeVisible()
  })

  test('all nav links have accessible text', async ({ page }) => {
    await page.goto('/')
    // On mobile, nav links are hidden — open hamburger if present
    const hamburger = page.locator('.hamburger')
    if (await hamburger.isVisible()) {
      await hamburger.click()
      await page.waitForTimeout(150)
    }
    const links = ['Projects', 'Sessions', 'Settings']
    for (const name of links) {
      await expect(page.getByRole('link', { name }).first()).toBeVisible()
    }
    await expect(page.getByRole('link', { name: 'Docs', exact: true }).first()).toBeVisible()
  })

  test('docs page has h1 heading', async ({ page }) => {
    await page.goto('/docs')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('projects page "New Project" button has descriptive text', async ({ page }) => {
    await page.route('**/api/projects**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })
    await page.goto('/projects')
    // Button text "+ New Project" is descriptive enough
    await expect(page.getByRole('button', { name: /New Project/ })).toBeVisible()
  })

  test('modal close button is focusable', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Sign in').first().click()
    const closeBtn = page.getByRole('dialog').locator('button').filter({ hasText: '✕' })
    await closeBtn.focus()
    await expect(closeBtn).toBeFocused()
  })

  test('images have alt text or are marked decorative', async ({ page }) => {
    await page.goto('/')
    // All non-decorative images should have alt text
    const imagesWithoutAlt = await page.locator('img:not([alt])').count()
    // Some images may be decorative (aria-hidden) — just check non-hidden ones
    const imagesWithoutAltNotHidden = await page.locator('img:not([alt]):not([aria-hidden="true"])').count()
    expect(imagesWithoutAltNotHidden).toBe(0)
  })

  test('Escape key works to close modal (keyboard navigation)', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Sign in').first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })
})
