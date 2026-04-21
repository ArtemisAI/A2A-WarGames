import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Auth modal — guest', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('Sign In button is visible', async ({ page }) => {
    await expect(page.getByText('Sign in').first()).toBeVisible()
  })

  test('clicking Sign In opens the modal', async ({ page }) => {
    await page.getByText('Sign in').first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('modal has a title "Sign in"', async ({ page }) => {
    await page.getByText('Sign in').first().click()
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  })

  test('modal subtitle is visible', async ({ page }) => {
    await page.getByText('Sign in').first().click()
    await expect(page.getByText('Sign in to access your projects and session history.')).toBeVisible()
  })

  test('email input is present', async ({ page }) => {
    await page.getByText('Sign in').first().click()
    await expect(page.getByLabel('Email')).toBeVisible()
  })

  test('password input is present', async ({ page }) => {
    await page.getByText('Sign in').first().click()
    await expect(page.getByLabel('Password')).toBeVisible()
  })

  test('sign-in submit button is present', async ({ page }) => {
    await page.getByText('Sign in').first().click()
    // Button inside form
    const submitBtn = page.locator('form').getByRole('button').first()
    await expect(submitBtn).toBeVisible()
  })

  test('"Continue with Google" button is present', async ({ page }) => {
    await page.getByText('Sign in').first().click()
    await expect(page.getByText('Continue with Google')).toBeVisible()
  })

  test('"Continue with GitHub" button is present', async ({ page }) => {
    await page.getByText('Sign in').first().click()
    await expect(page.getByText('Continue with GitHub')).toBeVisible()
  })

  test('"or" divider is shown', async ({ page }) => {
    await page.getByText('Sign in').first().click()
    await expect(page.getByRole('dialog').getByText('or').first()).toBeVisible()
  })

  test('"Don\'t have an account?" text is shown', async ({ page }) => {
    await page.getByText('Sign in').first().click()
    await expect(page.getByText("Don't have an account?")).toBeVisible()
  })

  test('"Sign up" toggle link is present', async ({ page }) => {
    await page.getByText('Sign in').first().click()
    await expect(page.getByRole('button', { name: 'Sign up' })).toBeVisible()
  })

  test('clicking "Sign up" toggle switches modal to sign-up mode', async ({ page }) => {
    await page.getByText('Sign in').first().click()
    await page.getByRole('button', { name: 'Sign up' }).click()
    await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible()
  })

  test('sign-up mode shows confirm password field', async ({ page }) => {
    await page.getByText('Sign in').first().click()
    await page.getByRole('button', { name: 'Sign up' }).click()
    await expect(page.getByLabel('Confirm password')).toBeVisible()
  })

  test('sign-up mode shows "Already have an account?" link', async ({ page }) => {
    await page.getByText('Sign in').first().click()
    await page.getByRole('button', { name: 'Sign up' }).click()
    await expect(page.getByText('Already have an account?')).toBeVisible()
  })

  test('toggling back to sign-in hides confirm password field', async ({ page }) => {
    await page.getByText('Sign in').first().click()
    await page.getByRole('button', { name: 'Sign up' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByLabel('Confirm password')).not.toBeVisible()
  })

  test('close button (✕) is present in the modal', async ({ page }) => {
    await page.getByText('Sign in').first().click()
    const closeBtn = page.getByRole('dialog').locator('button').filter({ hasText: '✕' })
    await expect(closeBtn).toBeVisible()
  })

  test('close button dismisses the modal', async ({ page }) => {
    await page.getByText('Sign in').first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    const closeBtn = page.getByRole('dialog').locator('button').filter({ hasText: '✕' })
    await closeBtn.click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('pressing Escape dismisses the modal', async ({ page }) => {
    await page.getByText('Sign in').first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('clicking the backdrop dismisses the modal', async ({ page }) => {
    await page.getByText('Sign in').first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    // Click the backdrop (outside the modal card)
    await page.locator('.modal-backdrop').click({ position: { x: 5, y: 5 } })
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('submitting with empty fields does not crash', async ({ page }) => {
    await page.getByText('Sign in').first().click()
    const submitBtn = page.locator('form').getByRole('button').first()
    // HTML5 required validation prevents submission — modal should stay visible
    await submitBtn.click({ force: true })
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('submitting with mismatched passwords shows error in sign-up mode', async ({ page }) => {
    await page.getByText('Sign in').first().click()
    await page.getByRole('button', { name: 'Sign up' }).click()
    await page.getByLabel('Email').fill('test@example.com')
    // Use first() since sign-up mode has two password fields (Password + Confirm password)
    await page.getByLabel('Password').first().fill('abc12345')
    await page.getByLabel('Confirm password').fill('different')
    await page.getByRole('dialog').locator('form').getByRole('button').first().click()
    await expect(page.getByText('Passwords do not match.')).toBeVisible()
  })

  test('submitting invalid credentials shows sign-in error message', async ({ page }) => {
    await page.getByText('Sign in').first().click()
    await page.getByLabel('Email').fill('notreal@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.locator('form').getByRole('button').first().click()
    // Wait for error (async API call)
    await expect(page.locator('.error').or(page.getByText('Sign in failed.'))).toBeVisible({ timeout: 10_000 })
  })
})
