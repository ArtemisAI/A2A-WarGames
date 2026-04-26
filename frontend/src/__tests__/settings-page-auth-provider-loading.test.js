import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import SettingsPage from '../pages/SettingsPage.vue'
import { useAuthStore } from '../stores/auth'

const { settingsStore, providersStore, routerReplace } = vi.hoisted(() => ({
  settingsStore: {
    fetchProfiles: vi.fn(),
    activeProfile: null,
    profiles: [],
    saveProfile: vi.fn(),
    setActiveProfile: vi.fn(),
  },
  providersStore: {
    fetchPresets: vi.fn(),
    fetchKeys: vi.fn(),
    fetchModelRegistry: vi.fn(),
    saveKey: vi.fn(),
    removeKey: vi.fn(),
    testConnection: vi.fn(),
    toggleModel: vi.fn(),
    setDefault: vi.fn(),
    refreshModels: vi.fn(),
    modelsForProvider: vi.fn().mockReturnValue([]),
    getKeyConfig: vi.fn().mockReturnValue(null),
    presets: [],
    configuredKeys: [],
    loading: false,
    error: null,
    defaultModel: null,
  },
  routerReplace: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    },
  },
}))

vi.mock('../stores/settings', () => ({
  useSettingsStore: () => settingsStore,
}))

vi.mock('../stores/providers', () => ({
  useProvidersStore: () => providersStore,
}))

vi.mock('../composables/useTheme', () => ({
  useTheme: () => ({ theme: 'dark', setTheme: vi.fn() }),
}))

vi.mock('../api/client', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { models: [] } }),
  },
  getAvailableVoices: vi.fn().mockResolvedValue({ data: { voices: [] } }),
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ replace: routerReplace }),
}))

function makeI18n() {
  return createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        settings: {
          title: 'Settings',
          subtitle: 'Configure',
          llmSettings: 'LLM',
          voice: 'Voice',
          experimentalFeatures: 'Features',
          appearance: 'Appearance',
          providerQuickSetupHint: 'Hint',
          providers: { title: 'Providers' },
          generation: 'Generation',
          profiles: 'Profiles',
          aboutEndpoint: 'About endpoint',
          aboutEndpointText: 'Text',
          loadingSettings: 'Loading',
          tts: 'TTS',
          stt: 'STT',
          saving: 'Saving',
          saveSettings: 'Save',
          saveVoiceSettings: 'Save voice',
          saved: 'Saved',
          themeLabel: 'Theme',
          languageLabel: 'Language',
        },
        guest: {
          signInToCustomize: 'Sign in',
          settingsRequireAuth: 'Auth required',
        },
        nav: { signIn: 'Sign In' },
        theme: { dark: 'Dark', light: 'Light' },
        language: { en: 'English', fr: 'French', es: 'Spanish' },
      },
    },
  })
}

function mountSettingsPage(pinia) {
  return mount(SettingsPage, {
    global: {
      plugins: [pinia, makeI18n()],
      provide: { showLogin: { value: false } },
      stubs: {
        ProviderGrid: true,
        ProviderDetail: true,
        DefaultModelSelector: true,
      },
    },
  })
}

describe('SettingsPage provider loading for authenticated users', () => {
  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)

    settingsStore.fetchProfiles.mockReset()
    settingsStore.fetchProfiles.mockResolvedValue([])
    settingsStore.activeProfile = null

    providersStore.fetchPresets.mockReset()
    providersStore.fetchPresets.mockResolvedValue([])
    providersStore.fetchKeys.mockReset()
    providersStore.fetchKeys.mockResolvedValue([])
    providersStore.fetchModelRegistry.mockReset()
    providersStore.fetchModelRegistry.mockResolvedValue([])

    routerReplace.mockClear()
  })

  it('loads provider data on mount when already signed in', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const auth = useAuthStore(pinia)
    auth.session = { access_token: 'token', user: { id: 'u1' } }

    mountSettingsPage(pinia)
    await flushPromises()

    expect(settingsStore.fetchProfiles).toHaveBeenCalledTimes(1)
    expect(providersStore.fetchPresets).toHaveBeenCalledTimes(1)
    expect(providersStore.fetchKeys).toHaveBeenCalledTimes(1)
    expect(providersStore.fetchModelRegistry).toHaveBeenCalledTimes(1)
  })

  it('loads provider data after guest signs in without page refresh', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const auth = useAuthStore(pinia)
    auth.session = null

    mountSettingsPage(pinia)
    await flushPromises()

    expect(settingsStore.fetchProfiles).not.toHaveBeenCalled()
    expect(providersStore.fetchPresets).not.toHaveBeenCalled()

    auth.session = { access_token: 'token', user: { id: 'u1' } }
    await flushPromises()

    expect(settingsStore.fetchProfiles).toHaveBeenCalledTimes(1)
    expect(providersStore.fetchPresets).toHaveBeenCalledTimes(1)
    expect(providersStore.fetchKeys).toHaveBeenCalledTimes(1)
    expect(providersStore.fetchModelRegistry).toHaveBeenCalledTimes(1)
  })
})
