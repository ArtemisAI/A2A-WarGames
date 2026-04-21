<template>
  <div class="docs-page">
    <div class="container">
      <!-- Header -->
      <div class="docs-header">
        <div class="section-label">{{ $t('docs.label') }}</div>
        <h1 class="docs-title">{{ $t('docs.title') }}</h1>
        <p class="docs-subtitle">{{ $t('docs.subtitle') }}</p>
      </div>

      <!-- Quick links -->
      <div class="quick-links">
        <a v-for="section in sections" :key="section.id" :href="'#' + section.id"
           class="quick-link" @click.prevent="scrollTo(section.id)">
          <span class="ql-icon">{{ section.icon }}</span>
          <span>{{ $t('docs.sections.' + section.id + '.title') }}</span>
        </a>
      </div>

      <!-- Documentation sections -->
      <div class="docs-content">
        <section v-for="section in sections" :key="section.id" :id="section.id" class="doc-section">
          <div class="doc-section-header">
            <span class="doc-section-icon">{{ section.icon }}</span>
            <h2>{{ $t('docs.sections.' + section.id + '.title') }}</h2>
          </div>
          <div class="doc-section-body" v-html="renderSection(section.id)"></div>
        </section>
      </div>

      <!-- API Reference -->
      <section id="api-reference" class="doc-section">
        <div class="doc-section-header">
          <span class="doc-section-icon">🔌</span>
          <h2>{{ $t('docs.apiReference') }}</h2>
        </div>
        <div class="api-grid">
          <div class="api-card" v-for="endpoint in apiEndpoints" :key="endpoint.path">
            <div class="api-method" :class="'method-' + endpoint.method.toLowerCase()">{{ endpoint.method }}</div>
            <div class="api-path">{{ endpoint.path }}</div>
            <p class="api-desc">{{ endpoint.desc }}</p>
          </div>
        </div>
      </section>

      <!-- Keyboard shortcuts -->
      <section id="shortcuts" class="doc-section">
        <div class="doc-section-header">
          <span class="doc-section-icon">⌨️</span>
          <h2>{{ $t('docs.shortcuts') }}</h2>
        </div>
        <div class="shortcuts-grid">
          <div class="shortcut-row" v-for="sc in shortcuts" :key="sc.keys">
            <kbd class="shortcut-key" v-for="key in sc.keys.split('+')" :key="key">{{ key.trim() }}</kbd>
            <span class="shortcut-desc">{{ sc.desc }}</span>
          </div>
        </div>
      </section>

      <!-- External links -->
      <section class="doc-section external-links-section">
        <div class="doc-section-header">
          <span class="doc-section-icon">🔗</span>
          <h2>{{ $t('docs.externalLinks') }}</h2>
        </div>
        <div class="external-grid">
          <a v-for="link in externalLinks" :key="link.url" :href="link.url" target="_blank" class="ext-link-card">
            <span class="ext-icon">{{ link.icon }}</span>
            <div>
              <div class="ext-title">{{ link.title }}</div>
              <div class="ext-desc">{{ link.desc }}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="ext-arrow"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
          </a>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const scrollTo = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const sections = [
  { id: 'getting-started', icon: '🚀' },
  { id: 'architecture', icon: '🏗️' },
  { id: 'agents', icon: '🤖' },
  { id: 'sessions', icon: '⚔️' },
  { id: 'analytics', icon: '📊' },
  { id: 'providers', icon: '🔧' },
]

const renderSection = (id) => {
  return t('docs.sections.' + id + '.content')
}

const apiEndpoints = [
  { method: 'GET', path: '/api/projects', desc: 'List all projects for the authenticated user' },
  { method: 'POST', path: '/api/projects', desc: 'Create a new project with stakeholder configurations' },
  { method: 'GET', path: '/api/projects/:id/stakeholders', desc: 'List all stakeholders in a project' },
  { method: 'POST', path: '/api/sessions', desc: 'Create a new wargame session with a strategic question' },
  { method: 'GET', path: '/api/sessions/:id/stream', desc: 'SSE stream for live debate updates' },
  { method: 'POST', path: '/api/sessions/:id/start', desc: 'Start the wargame debate engine' },
  { method: 'GET', path: '/api/sessions/:id/analytics', desc: 'Get post-session analytics and metrics' },
  { method: 'POST', path: '/api/sessions/:id/inject', desc: 'Inject a moderator message into a live debate' },
  { method: 'GET', path: '/api/settings', desc: 'Get user LLM settings and API keys' },
  { method: 'PUT', path: '/api/settings', desc: 'Update LLM provider configuration' },
  { method: 'POST', path: '/api/projects/seed-demo', desc: 'Seed the demo project (Northbridge)' },
]

const shortcuts = [
  { keys: 'Space', desc: 'Start / Pause wargame session' },
  { keys: 'Ctrl + Enter', desc: 'Inject moderator message' },
  { keys: 'Escape', desc: 'Close dialogs and drawers' },
  { keys: '↓', desc: 'Jump to latest transcript entry' },
]

const externalLinks = [
  { icon: '📦', title: 'GitHub Repository', desc: 'Source code, issues, and contributions', url: 'https://github.com/ArtemisAI/A2A-WarGames' },
  { icon: '📄', title: 'API Documentation', desc: 'FastAPI auto-generated docs', url: '/api/docs' },
  { icon: '🐛', title: 'Report a Bug', desc: 'Open an issue on GitHub', url: 'https://github.com/ArtemisAI/A2A-WarGames/issues/new' },
  { icon: '💬', title: 'Discussions', desc: 'Community Q&A and feature requests', url: 'https://github.com/ArtemisAI/A2A-WarGames/discussions' },
]
</script>

<style scoped>
.docs-page {
  min-height: 100vh;
  padding: var(--space-8) 0 var(--space-12) 0;
  background: var(--bg);
}
.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

/* Header */
.docs-header { margin-bottom: var(--space-8); }
.section-label {
  display: inline-block;
  padding: 4px 14px;
  background: var(--accent-dim);
  color: var(--accent);
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--space-4);
}
.docs-title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 700;
  margin: 0 0 var(--space-3) 0;
  letter-spacing: -0.02em;
}
.docs-subtitle {
  font-size: 1.05rem;
  color: var(--text-muted);
  max-width: 640px;
  line-height: 1.6;
  margin: 0;
}

/* Quick links */
.quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-10);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--border);
}
.quick-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 8px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  text-decoration: none;
  transition: all var(--transition-fast);
}
.quick-link:hover {
  color: var(--accent);
  border-color: var(--accent);
  transform: translateY(-2px);
}
.ql-icon { font-size: 16px; }

/* Doc sections */
.doc-section {
  margin-bottom: var(--space-10);
  scroll-margin-top: 72px;
}
.doc-section-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}
.doc-section-icon { font-size: 28px; }
.doc-section-header h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
}
.doc-section-body {
  color: var(--text-muted);
  line-height: 1.8;
  font-size: 14px;
}
.doc-section-body :deep(p) {
  margin: 0 0 var(--space-4) 0;
}
.doc-section-body :deep(strong) {
  color: var(--text);
  font-weight: 600;
}
.doc-section-body :deep(code) {
  padding: 2px 6px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 13px;
}
.doc-section-body :deep(ul) {
  margin: var(--space-2) 0 var(--space-4) var(--space-6);
  padding: 0;
}
.doc-section-body :deep(li) {
  margin-bottom: var(--space-2);
}

/* API Reference */
.api-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.api-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: all var(--transition-fast);
}
.api-card:hover {
  border-color: var(--border-hover);
  background: var(--surface-hover);
}
.api-method {
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 700;
  font-family: var(--font-mono);
  flex-shrink: 0;
  min-width: 50px;
  text-align: center;
}
.method-get { background: rgba(39,174,96,0.15); color: #27ae60; }
.method-post { background: rgba(41,128,185,0.15); color: #2980b9; }
.method-put { background: rgba(230,126,34,0.15); color: #e67e22; }
.method-delete { background: rgba(231,76,60,0.15); color: #e74c3c; }

.api-path {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  min-width: 260px;
  flex-shrink: 0;
}
.api-desc {
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
}

/* Shortcuts */
.shortcuts-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.shortcut-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.shortcut-key {
  display: inline-block;
  padding: 4px 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  min-width: 32px;
  text-align: center;
}
.shortcut-desc {
  font-size: 14px;
  color: var(--text-muted);
}

/* External links */
.external-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-3);
}
.ext-link-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  text-decoration: none;
  color: var(--text);
  transition: all var(--transition-base);
}
.ext-link-card:hover {
  border-color: var(--accent);
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}
.ext-icon { font-size: 28px; flex-shrink: 0; }
.ext-title { font-weight: 600; font-size: 14px; margin-bottom: 2px; }
.ext-desc { color: var(--text-muted); font-size: 12px; }
.ext-arrow {
  margin-left: auto;
  color: var(--text-muted);
  flex-shrink: 0;
  transition: transform var(--transition-fast);
}
.ext-link-card:hover .ext-arrow {
  transform: translate(2px, -2px);
  color: var(--accent);
}

/* Mobile */
@media (max-width: 768px) {
  .api-card { flex-direction: column; align-items: flex-start; }
  .api-path { min-width: unset; }
}
</style>
