import { test as setup, expect } from '@playwright/test'
import path from 'path'

const AUTH_FILE = path.join(__dirname, '.auth/user.json')

const SUPABASE_URL = 'https://vfvazdwrppqozeevycdm.supabase.co'
const APP_URL = process.env.BASE_URL || 'https://app.crew-ai.me'

setup('authenticate via Supabase password grant', async ({ page }) => {
  const email = process.env.E2E_EMAIL
  const password = process.env.E2E_PASSWORD

  if (!email || !password) {
    console.warn('[global.setup] E2E_EMAIL or E2E_PASSWORD not set — skipping real auth, writing empty storage state')
    await page.goto(APP_URL)
    await page.context().storageState({ path: AUTH_FILE })
    return
  }

  // Call Supabase password grant directly
  const tokenRes = await page.request.post(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.SUPABASE_ANON_KEY || '',
      },
      data: { email, password },
    }
  )

  expect(tokenRes.ok(), `Supabase password grant failed: ${tokenRes.status()}`).toBeTruthy()
  const session = await tokenRes.json()

  // Navigate to the app and inject the session into localStorage
  await page.goto(APP_URL)
  await page.waitForLoadState('networkidle')

  const storageKey = `sb-vfvazdwrppqozeevycdm-auth-token`
  await page.evaluate(
    ({ key, value }) => {
      localStorage.setItem(key, JSON.stringify(value))
    },
    {
      key: storageKey,
      value: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + (session.expires_in || 3600),
        expires_in: session.expires_in || 3600,
        token_type: session.token_type || 'bearer',
        user: session.user,
      },
    }
  )

  // Reload to let Supabase SDK pick up the injected session
  await page.reload()
  await page.waitForLoadState('networkidle')

  await page.context().storageState({ path: AUTH_FILE })
  console.log(`[global.setup] Auth state saved to ${AUTH_FILE}`)
})
