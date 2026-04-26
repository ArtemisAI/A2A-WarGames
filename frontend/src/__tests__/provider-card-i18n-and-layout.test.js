import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ProviderCard from '../components/settings/ProviderCard.vue'

function makeI18n(locale) {
  return createI18n({
    legacy: false,
    locale,
    messages: {
      en: { settings: { providers: { configured: 'Configured', verified: 'Verified', notConfigured: 'Not Set Up' } } },
      fr: { settings: { providers: { configured: 'Configuré', verified: 'Vérifié', notConfigured: 'Non configuré' } } },
      es: { settings: { providers: { configured: 'Configurado', verified: 'Verificado', notConfigured: 'No configurado' } } },
    },
  })
}

function mountCard(locale, props) {
  return mount(ProviderCard, {
    props: {
      preset: { id: 'openai', label: 'OpenAI' },
      ...props,
    },
    global: { plugins: [makeI18n(locale)] },
  })
}

describe('ProviderCard localization and responsive/theme styles', () => {
  it('renders localized configured/verified/not configured badges in all supported languages', () => {
    expect(mountCard('en', { configured: true }).text()).toContain('Configured')
    expect(mountCard('fr', { configured: true }).text()).toContain('Configuré')
    expect(mountCard('es', { configured: true }).text()).toContain('Configurado')

    expect(mountCard('en', { verified: true }).text()).toContain('Verified')
    expect(mountCard('fr', { verified: true }).text()).toContain('Vérifié')
    expect(mountCard('es', { verified: true }).text()).toContain('Verificado')

    expect(mountCard('en', {}).text()).toContain('Not Set Up')
    expect(mountCard('fr', {}).text()).toContain('Non configuré')
    expect(mountCard('es', {}).text()).toContain('No configurado')
  })

  it('keeps responsive breakpoints and CSS variable-based colors for light/dark themes', () => {
    const gridFile = readFileSync('/home/runner/work/A2A-WarGames/A2A-WarGames/frontend/src/components/settings/ProviderGrid.vue', 'utf8')
    const cardFile = readFileSync('/home/runner/work/A2A-WarGames/A2A-WarGames/frontend/src/components/settings/ProviderCard.vue', 'utf8')

    expect(gridFile).toContain('@media (max-width: 768px)')
    expect(gridFile).toContain('@media (max-width: 480px)')

    expect(cardFile).toContain('var(--surface)')
    expect(cardFile).toContain('var(--text)')
    expect(cardFile).toContain('var(--border)')
  })
})
