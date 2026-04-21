import { test, expect } from '@playwright/test'

const MOCK_PROFILE = {
  id: 1,
  profile_name: 'default',
  base_url: 'https://LLM.ai-automate.me/v1',
  api_key: '***',
  default_model: 'gpt-4o',
  chairman_model: 'gpt-4o',
  council_models: ['gpt-4o', 'gpt-4o-mini'],
  temperature: 0.8,
  max_tokens: 1024,
  is_active: true,
  feature_flags: {
    thinking_bubbles: true,
    streaming_tokens: true,
    dag_visualization: true,
  },
  tts_enabled: false,
  stt_enabled: false,
}

const MOCK_PRESETS = [
  { id: 'openai', name: 'OpenAI', base_url: 'https://api.openai.com/v1', logo: '', description: 'GPT-4o and friends' },
  { id: 'anthropic', name: 'Anthropic', base_url: 'https://api.anthropic.com/v1', logo: '', description: 'Claude models' },
]

const MOCK_KEYS: Record<string, unknown> = {}

// auth.isGuest is not returned from the auth store (undefined = falsy),
// so settings tabs are always visible regardless of auth state.
// Mock all API routes so the page renders with controlled data.
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Settings page — authenticated', () => {

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/settings/profiles**', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([MOCK_PROFILE]) })
      } else if (route.request().method() === 'POST' || route.request().method() === 'PUT') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PROFILE) })
      } else {
        route.continue()
      }
    })
    await page.route('**/api/settings/models**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'] }) })
    })
    await page.route('**/api/providers/presets**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PRESETS) })
    })
    await page.route('**/api/providers/keys**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_KEYS) })
    })
    await page.route('**/api/providers/models**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })
    await page.route('**/api/settings/voices**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ voices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] }) })
    })
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
  })

  test('settings page loads for authed user', async ({ page }) => {
    await expect(page).toHaveURL(/\/settings/)
  })

  test('settings page title is visible', async ({ page }) => {
    await expect(page.locator('.page-title').filter({ hasText: 'Settings' })).toBeVisible()
  })

  test('settings subtitle is visible', async ({ page }) => {
    await expect(page.getByText('Configure your LLM endpoint')).toBeVisible()
  })

  test('tab bar is visible for authed user', async ({ page }) => {
    await expect(page.getByRole('button', { name: /LLM Settings/ })).toBeVisible()
  })

  test('"🔧 LLM Settings" tab is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: /LLM Settings/ })).toBeVisible()
  })

  test('"🔊 Voice" tab is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Voice/ })).toBeVisible()
  })

  test('"⚗️ Experimental Features" tab is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Experimental/ })).toBeVisible()
  })

  test('"🎨 Appearance" tab is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Appearance/ })).toBeVisible()
  })

  test('LLM tab is active by default', async ({ page }) => {
    const llmTab = page.getByRole('button', { name: /LLM Settings/ })
    await expect(llmTab).toHaveClass(/active/)
  })

  test('LLM providers section heading is visible on LLM tab', async ({ page }) => {
    await expect(page.getByText('LLM Providers')).toBeVisible()
  })

  test('provider presets are shown (OpenAI, Anthropic)', async ({ page }) => {
    await expect(page.getByText('OpenAI')).toBeVisible()
    await expect(page.getByText('Anthropic')).toBeVisible()
  })

  test('About endpoint section is visible on LLM tab', async ({ page }) => {
    await expect(page.getByText('About this endpoint')).toBeVisible()
  })

  test('clicking Voice tab switches content', async ({ page }) => {
    await page.getByRole('button', { name: /Voice/ }).click()
    await expect(page.getByText('Text-to-Speech (TTS)')).toBeVisible()
  })

  test('TTS enabled checkbox is present on Voice tab', async ({ page }) => {
    await page.getByRole('button', { name: /Voice/ }).click()
    // Label has no `for` attribute; check label text visibility instead
    await expect(page.getByText('TTS enabled').first()).toBeVisible()
  })

  test('STT section is present on Voice tab', async ({ page }) => {
    await page.getByRole('button', { name: /Voice/ }).click()
    await expect(page.getByText('Speech-to-Text (STT)')).toBeVisible()
  })

  test('STT enabled checkbox is present on Voice tab', async ({ page }) => {
    await page.getByRole('button', { name: /Voice/ }).click()
    // Label has no `for` attribute; check label text visibility instead
    await expect(page.getByText('STT enabled').first()).toBeVisible()
  })

  test('"Save Voice Settings" button is on Voice tab', async ({ page }) => {
    await page.getByRole('button', { name: /Voice/ }).click()
    await expect(page.getByRole('button', { name: 'Save Voice Settings' })).toBeVisible()
  })

  test('clicking Experimental Features tab shows feature flags', async ({ page }) => {
    await page.getByRole('button', { name: /Experimental/ }).click()
    // Use exact match to avoid matching "Save Feature Flags" button
    await expect(page.getByText('Feature Flags', { exact: true })).toBeVisible()
  })

  test('feature flag "LLM Thinking Bubbles" is listed', async ({ page }) => {
    await page.getByRole('button', { name: /Experimental/ }).click()
    await expect(page.getByText('LLM Thinking Bubbles').first()).toBeVisible()
  })

  test('feature flag "Token Streaming" is listed', async ({ page }) => {
    await page.getByRole('button', { name: /Experimental/ }).click()
    // Use first() to avoid strict mode violation with the description text
    await expect(page.getByText('Token Streaming').first()).toBeVisible()
  })

  test('feature flag toggles are switch buttons with aria-checked', async ({ page }) => {
    await page.getByRole('button', { name: /Experimental/ }).click()
    const toggles = page.locator('[role="switch"]')
    await expect(toggles.first()).toBeVisible()
    await expect(toggles.first()).toHaveAttribute('aria-checked')
  })

  test('"Save Feature Flags" button is on Experimental tab', async ({ page }) => {
    await page.getByRole('button', { name: /Experimental/ }).click()
    await expect(page.getByRole('button', { name: 'Save Feature Flags' })).toBeVisible()
  })

  test('clicking Appearance tab shows theme selector', async ({ page }) => {
    await page.getByRole('button', { name: /Appearance/ }).click()
    await expect(page.getByText('Theme').first()).toBeVisible()
  })

  test('Appearance tab has Dark button', async ({ page }) => {
    await page.getByRole('button', { name: /Appearance/ }).click()
    await expect(page.getByRole('button', { name: /Dark/ })).toBeVisible()
  })

  test('Appearance tab has Light button', async ({ page }) => {
    await page.getByRole('button', { name: /Appearance/ }).click()
    await expect(page.getByRole('button', { name: /Light/ })).toBeVisible()
  })

  test('Appearance tab shows Language section', async ({ page }) => {
    await page.getByRole('button', { name: /Appearance/ }).click()
    await expect(page.getByText('Language').first()).toBeVisible()
  })

  test('Appearance tab has English, Français, Español buttons', async ({ page }) => {
    await page.getByRole('button', { name: /Appearance/ }).click()
    await expect(page.getByRole('button', { name: 'English' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Français' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Español' })).toBeVisible()
  })

  test('?tab=voice query param activates the voice tab', async ({ page }) => {
    await page.goto('/settings?tab=voice')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Text-to-Speech (TTS)')).toBeVisible()
  })

  test('?tab=features query param activates the features tab', async ({ page }) => {
    await page.goto('/settings?tab=features')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Feature Flags', { exact: true })).toBeVisible()
  })

  test('?tab=appearance query param activates the appearance tab', async ({ page }) => {
    await page.goto('/settings?tab=appearance')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Theme').first()).toBeVisible()
  })
})
