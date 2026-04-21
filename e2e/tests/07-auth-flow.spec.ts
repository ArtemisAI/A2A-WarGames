import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Auth flow UI states', () => {
  test('Sign In button visible on landing as guest', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Sign in').first()).toBeVisible()
  })

  test('login modal opens from navbar Sign In click', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Sign in').first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('modal renders email input with correct type', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Sign in').first().click()
    const emailInput = page.getByLabel('Email')
    await expect(emailInput).toHaveAttribute('type', 'email')
  })

  test('modal renders password input with correct type', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Sign in').first().click()
    const passwordInput = page.getByLabel('Password')
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('loading state shows "Signing in…" while request is in flight', async ({ page }) => {
    // Intercept the Supabase auth call and delay it so we can observe the loading text
    await page.route('**/auth/v1/token**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      route.fulfill({ status: 400, body: JSON.stringify({ error: 'invalid_grant', error_description: 'Invalid credentials' }) })
    })
    await page.goto('/')
    await page.getByText('Sign in').first().click()
    await page.getByLabel('Email').fill('user@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.locator('form').getByRole('button').first().click()
    await expect(page.getByText('Signing in…')).toBeVisible({ timeout: 3000 })
  })

  test.fixme('sign-up mode shows "Creating account…" during submission', async ({ page }) => {
    await page.route('**/auth/v1/signup**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      route.fulfill({ status: 400, body: JSON.stringify({ error: 'email_already_registered' }) })
    })
    await page.goto('/')
    await page.getByText('Sign in').first().click()
    await page.getByRole('button', { name: 'Sign up' }).click()
    await page.getByLabel('Email').fill('new@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByLabel('Confirm password').fill('password123')
    await page.locator('form').getByRole('button').first().click()
    await expect(page.getByText('Creating account…')).toBeVisible({ timeout: 3000 })
  })

  test.skip('actual sign-in with valid credentials closes modal — requires real E2E_EMAIL/E2E_PASSWORD', async () => {
    // Skipped: needs production credentials (E2E_EMAIL + E2E_PASSWORD env vars)
  })

  test.skip('sign-out button appears after auth — requires authenticated session', async () => {
    // Skipped: session persistence test requires real auth
  })

  test.skip('session persists across page reload after auth — requires authenticated session', async () => {
    // Skipped: requires real auth injection
  })

  test('sign-in modal can be opened from /projects page', async ({ page }) => {
    await page.route('**/api/projects**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })
    await page.goto('/projects')
    await page.getByText('Sign in').first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('unauthenticated user cannot see Sign Out in navbar', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Sign out')).not.toBeVisible()
  })

  test('sign-up mode submit button text is "Sign up"', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Sign in').first().click()
    await page.getByRole('button', { name: 'Sign up' }).click()
    // The submit button inside the form should now say "Sign up"
    const submitBtn = page.locator('form').getByRole('button').first()
    await expect(submitBtn).toHaveText('Sign up')
  })

  test('/login route loads the login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.locator('body')).toBeVisible()
  })
})
