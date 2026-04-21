<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero">
      <!-- Animated grid background -->
      <div class="hero-grid" aria-hidden="true">
        <div class="grid-line" v-for="i in 12" :key="'gl-'+i" :style="{ '--i': i }"></div>
      </div>
      <!-- Floating orbs -->
      <div class="hero-orb orb-1" aria-hidden="true"></div>
      <div class="hero-orb orb-2" aria-hidden="true"></div>
      <div class="hero-orb orb-3" aria-hidden="true"></div>

      <div class="container">
        <div class="hero-layout">
          <div class="hero-content" ref="heroContent">
            <div class="hero-badge">
              <span class="badge-pulse"></span>
              <span>{{ $t('landing.heroBadge') }}</span>
            </div>
            <h1 class="hero-title">
              {{ $t('landing.heroTitleLine1') }}
              <span class="gradient-text">{{ $t('landing.heroTitleAccent') }}</span>
            </h1>
            <p class="hero-subtitle">
              {{ $t('landing.heroSubtitle') }}
            </p>
            <div class="hero-cta">
              <button class="btn-hero btn-hero-primary" @click="goToProjects">
                <span>{{ $t('landing.launchSimulation') }}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
              <button class="btn-hero btn-hero-ghost" @click="tryDemo">
                <span>🎮 {{ $t('landing.tryDemo') }}</span>
              </button>
              <a href="https://github.com/ArtemisAI/A2A-WarGames" target="_blank" class="btn-hero btn-hero-ghost">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                <span>GitHub</span>
              </a>
            </div>
            <!-- Stats row -->
            <div class="hero-stats">
              <div class="stat-item">
                <span class="stat-number">7+</span>
                <span class="stat-label">{{ $t('landing.statAgents') }}</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-number">6</span>
                <span class="stat-label">{{ $t('landing.statProviders') }}</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-number">3</span>
                <span class="stat-label">{{ $t('landing.statLanguages') }}</span>
              </div>
            </div>
          </div>

          <!-- Hero visual — animated agent network -->
          <div class="hero-visual">
            <div class="showcase-glass">
              <div class="showcase-header">
                <div class="showcase-dots">
                  <span class="dot dot-red"></span>
                  <span class="dot dot-yellow"></span>
                  <span class="dot dot-green"></span>
                </div>
                <span class="showcase-title">{{ $t('landing.showcaseTitle') }}</span>
              </div>
              <div class="showcase-body">
                <div class="agent-node" v-for="(agent, idx) in showcaseAgents" :key="agent.name"
                     :class="'agent-' + (idx + 1)"
                     :style="{ '--delay': idx * 0.15 + 's' }">
                  <span class="agent-avatar">{{ agent.icon }}</span>
                  <span class="agent-name">{{ agent.name }}</span>
                  <span class="agent-role">{{ agent.role }}</span>
                </div>
                <!-- Connection lines (SVG) -->
                <svg class="agent-connections" viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="80" y1="50" x2="240" y2="50" stroke="var(--accent)" stroke-opacity="0.3" stroke-dasharray="4 4">
                    <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="2s" repeatCount="indefinite"/>
                  </line>
                  <line x1="80" y1="110" x2="240" y2="110" stroke="var(--whisper)" stroke-opacity="0.2" stroke-dasharray="4 4">
                    <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="3s" repeatCount="indefinite"/>
                  </line>
                  <line x1="160" y1="50" x2="160" y2="170" stroke="var(--info)" stroke-opacity="0.2" stroke-dasharray="4 4">
                    <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="2.5s" repeatCount="indefinite"/>
                  </line>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- A2A Protocol Section -->
    <section class="protocol-section" ref="protocolSection">
      <div class="container">
        <div class="section-label">{{ $t('landing.protocolLabel') }}</div>
        <h2 class="section-heading">{{ $t('landing.protocolTitle') }}</h2>
        <p class="section-desc">{{ $t('landing.protocolSubtitle') }}</p>

        <div class="pipeline">
          <div class="pipeline-step" v-for="(step, idx) in pipelineSteps" :key="step.key"
               :style="{ '--delay': idx * 0.1 + 's' }">
            <div class="step-icon-wrap" :class="'step-color-' + (idx + 1)">
              <span class="step-icon">{{ step.icon }}</span>
            </div>
            <div class="step-content">
              <h3 class="step-title">{{ $t('landing.pipeline.' + step.key + '.title') }}</h3>
              <p class="step-desc">{{ $t('landing.pipeline.' + step.key + '.desc') }}</p>
            </div>
            <div class="step-connector" v-if="idx < pipelineSteps.length - 1" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><path d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>
        </div>

        <div class="protocol-features">
          <div class="pf-card" v-for="feat in protocolFeatures" :key="feat.key">
            <div class="pf-icon">{{ feat.icon }}</div>
            <h3>{{ $t('landing.protocolFeatures.' + feat.key + '.title') }}</h3>
            <p>{{ $t('landing.protocolFeatures.' + feat.key + '.desc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Capabilities Section -->
    <section class="capabilities-section" ref="capabilitiesSection">
      <div class="container">
        <div class="section-label">{{ $t('landing.capabilitiesLabel') }}</div>
        <h2 class="section-heading">{{ $t('landing.capabilitiesTitle') }}</h2>
        <p class="section-desc">{{ $t('landing.capabilitiesSubtitle') }}</p>

        <div class="capabilities-grid">
          <div class="cap-card" v-for="(cap, idx) in capabilities" :key="cap.key"
               :style="{ '--delay': idx * 0.06 + 's' }">
            <div class="cap-number">{{ String(idx + 1).padStart(2, '0') }}</div>
            <div class="cap-icon-wrap" :class="'cap-color-' + ((idx % 4) + 1)">
              <span>{{ cap.icon }}</span>
            </div>
            <h3>{{ $t('landing.capabilities.' + cap.key + '.title') }}</h3>
            <p>{{ $t('landing.capabilities.' + cap.key + '.desc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Tech Stack Section -->
    <section class="tech-section" ref="techSection">
      <div class="container">
        <div class="section-label">{{ $t('landing.techLabel') }}</div>
        <h2 class="section-heading">{{ $t('landing.techTitle') }}</h2>
        <p class="section-desc">{{ $t('landing.techSubtitle') }}</p>

        <div class="tech-columns">
          <div class="tech-col" v-for="col in techStack" :key="col.key">
            <h3 class="tech-col-title">{{ $t('landing.tech.' + col.key + '.title') }}</h3>
            <div class="tech-list">
              <div class="tech-row" v-for="item in col.items" :key="item.name">
                <div class="tech-row-icon">{{ item.icon }}</div>
                <div>
                  <div class="tech-row-name">{{ item.name }}</div>
                  <div class="tech-row-desc">{{ item.desc }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="llm-compat">
          <h3 class="llm-title">{{ $t('landing.llmCompat') }}</h3>
          <div class="llm-badges">
            <span class="llm-pill" v-for="p in providers" :key="p">{{ p }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-glow" aria-hidden="true"></div>
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">{{ $t('landing.ctaTitle') }}</h2>
          <p class="cta-subtitle">{{ $t('landing.ctaSubtitle') }}</p>
          <div class="cta-buttons">
            <button class="btn-hero btn-hero-primary btn-lg" @click="goToProjects">
              <span>{{ $t('landing.ctaLaunch') }}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
            <a href="https://github.com/ArtemisAI/A2A-WarGames" target="_blank" class="btn-hero btn-hero-outline btn-lg">
              <span>{{ $t('landing.ctaDocs') }}</span>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <div class="container">
        <div class="footer-top">
          <div class="footer-brand">
            <span class="footer-logo">⚔ {{ $t('landing.footerBrand') }}</span>
            <p class="footer-tagline">{{ $t('landing.footerTagline') }}</p>
          </div>
          <div class="footer-links">
            <a href="https://github.com/ArtemisAI/A2A-WarGames" target="_blank">GitHub</a>
            <a href="https://github.com/ArtemisAI/A2A-WarGames/issues" target="_blank">{{ $t('landing.footerIssues') }}</a>
            <a href="https://github.com/ArtemisAI" target="_blank">ArtemisAI</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>{{ $t('landing.footerCopyright') }}</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../api/client'

const { t } = useI18n()
const router = useRouter()

const goToProjects = () => router.push('/projects')

const tryDemo = async () => {
  try { await api.post('/api/projects/seed-demo') } catch { /* demos may already exist */ }
  router.push('/projects?tab=community')
}

const showcaseAgents = [
  { icon: '👔', name: 'CEO', role: 'Founder' },
  { icon: '💻', name: 'CTO', role: 'Enthusiast' },
  { icon: '📊', name: 'CFO', role: 'Critical' },
  { icon: '👥', name: 'HR Lead', role: 'Conditional' },
  { icon: '🔬', name: 'R&D', role: 'Strategic' },
]

const pipelineSteps = [
  { key: 'moderator', icon: '👔' },
  { key: 'selection', icon: '🎲' },
  { key: 'agents', icon: '👥' },
  { key: 'observer', icon: '📊' },
  { key: 'analytics', icon: '📈' },
]

const protocolFeatures = [
  { key: 'personas', icon: '🎭' },
  { key: 'rounds', icon: '🔄' },
  { key: 'streaming', icon: '📡' },
]

const capabilities = [
  { key: 'orchestration', icon: '🎯' },
  { key: 'adkar', icon: '🧬' },
  { key: 'whisper', icon: '💭' },
  { key: 'memory', icon: '🧠' },
  { key: 'analytics', icon: '📊' },
  { key: 'dag', icon: '🎨' },
  { key: 'security', icon: '🔐' },
  { key: 'i18n', icon: '🌐' },
]

const techStack = [
  {
    key: 'frontend',
    items: [
      { icon: '⚡', name: 'Vue 3', desc: 'Composition API + script setup' },
      { icon: '🎨', name: 'Tailwind CSS v4', desc: 'Utility-first styling' },
      { icon: '🏪', name: 'Pinia', desc: 'State management' },
      { icon: '📊', name: 'Chart.js + D3.js', desc: 'Data visualization' },
    ]
  },
  {
    key: 'backend',
    items: [
      { icon: '⚙️', name: 'FastAPI', desc: 'High-performance async API' },
      { icon: '🗄️', name: 'PostgreSQL + Supabase', desc: 'Production database with RLS' },
      { icon: '🔍', name: 'pgvector', desc: 'Semantic memory retrieval' },
      { icon: '🤖', name: 'OpenAI-compatible', desc: 'Any LLM provider' },
    ]
  }
]

const providers = ['OpenAI', 'Anthropic', 'Ollama', 'Groq', 'Together AI', 'LM Studio']
</script>

<style scoped>
/* ── Page base ── */
.landing-page {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

/* =============================================
   HERO SECTION
   ============================================= */
.hero {
  position: relative;
  min-height: 92vh;
  display: flex;
  align-items: center;
  padding: var(--space-12) 0;
  overflow: hidden;
}

/* Animated grid background */
.hero-grid {
  position: absolute;
  inset: 0;
  overflow: hidden;
  opacity: 0.04;
}
.grid-line {
  position: absolute;
  background: var(--accent);
  animation: grid-fade 4s ease-in-out infinite alternate;
  animation-delay: calc(var(--i) * 0.3s);
}
.grid-line:nth-child(odd) {
  width: 1px;
  height: 100%;
  left: calc(var(--i) * 8.33%);
}
.grid-line:nth-child(even) {
  height: 1px;
  width: 100%;
  top: calc(var(--i) * 8.33%);
}
@keyframes grid-fade {
  0% { opacity: 0.3; }
  100% { opacity: 1; }
}

/* Floating orbs */
.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  animation: orb-float 8s ease-in-out infinite alternate;
}
.orb-1 {
  width: 400px; height: 400px;
  background: rgba(233, 69, 96, 0.12);
  top: -10%; left: -5%;
}
.orb-2 {
  width: 300px; height: 300px;
  background: rgba(124, 92, 191, 0.1);
  bottom: 10%; right: -5%;
  animation-delay: 2s;
}
.orb-3 {
  width: 200px; height: 200px;
  background: rgba(41, 128, 185, 0.08);
  top: 50%; left: 40%;
  animation-delay: 4s;
}
@keyframes orb-float {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(30px, -20px) scale(1.1); }
}

.hero-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-10);
  align-items: center;
  position: relative;
  z-index: 1;
}
@media (min-width: 1024px) {
  .hero-layout {
    grid-template-columns: 1fr 1fr;
  }
}

/* Hero badge */
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 6px 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: var(--space-6);
  animation: fade-slide-up 0.6s ease-out both;
}
.badge-pulse {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--success);
  animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(39,174,96,0.4); }
  50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(39,174,96,0); }
}

/* Hero title */
.hero-title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5.5vw, 4.2rem);
  font-weight: 700;
  line-height: 1.08;
  margin: 0 0 var(--space-5) 0;
  letter-spacing: -0.02em;
  animation: fade-slide-up 0.6s ease-out 0.1s both;
}
.gradient-text {
  background: linear-gradient(135deg, var(--accent) 0%, #c084fc 50%, #38bdf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.2rem);
  line-height: 1.7;
  color: var(--text-muted);
  max-width: 540px;
  margin-bottom: var(--space-8);
  animation: fade-slide-up 0.6s ease-out 0.2s both;
}

/* Hero CTA buttons */
.hero-cta {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  animation: fade-slide-up 0.6s ease-out 0.3s both;
}

.btn-hero {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 12px 24px;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: all var(--transition-base);
  font-family: var(--font-sans);
}
.btn-hero-primary {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 4px 16px rgba(233,69,96,0.3);
}
.btn-hero-primary:hover {
  background: #d63851;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(233,69,96,0.35);
}
.btn-hero-primary:hover svg {
  transform: translateX(4px);
}
.btn-hero-primary svg {
  transition: transform var(--transition-base);
}
.btn-hero-ghost {
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  color: var(--text);
  border: 1px solid var(--glass-border);
}
.btn-hero-ghost:hover {
  background: var(--surface-hover);
  border-color: var(--border-hover);
  transform: translateY(-2px);
}
.btn-hero-outline {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
}
.btn-hero-outline:hover {
  background: var(--surface);
  border-color: var(--border-hover);
  transform: translateY(-2px);
}
.btn-lg {
  padding: 14px 32px;
  font-size: 16px;
}

/* Hero stats */
.hero-stats {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  margin-top: var(--space-8);
  animation: fade-slide-up 0.6s ease-out 0.4s both;
}
.stat-item {
  display: flex;
  flex-direction: column;
}
.stat-number {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
}
.stat-label {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}
.stat-divider {
  width: 1px;
  height: 32px;
  background: var(--border);
}

/* ── Hero showcase glass panel ── */
.hero-visual {
  display: none;
}
@media (min-width: 1024px) {
  .hero-visual {
    display: block;
    animation: fade-slide-up 0.8s ease-out 0.4s both;
  }
}

.showcase-glass {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--glow-accent);
}
.showcase-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 12px 16px;
  border-bottom: 1px solid var(--glass-border);
}
.showcase-dots {
  display: flex;
  gap: 6px;
}
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot-red { background: #ff5f57; }
.dot-yellow { background: #febc2e; }
.dot-green { background: #28c840; }
.showcase-title {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}
.showcase-body {
  padding: var(--space-6);
  position: relative;
  min-height: 280px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: var(--space-4);
  align-content: start;
}

.agent-connections {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.5;
}

.agent-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--space-3);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  text-align: center;
  position: relative;
  z-index: 1;
  animation: agent-appear 0.5s ease-out both;
  animation-delay: var(--delay);
  transition: all var(--transition-fast);
}
.agent-node:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.agent-avatar { font-size: 28px; }
.agent-name { font-size: 13px; font-weight: 600; }
.agent-role { font-size: 11px; color: var(--text-muted); }

@keyframes agent-appear {
  from { opacity: 0; transform: translateY(10px) scale(0.9); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* =============================================
   SECTION SHARED STYLES
   ============================================= */
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
.section-heading {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  margin: 0 0 var(--space-3) 0;
  letter-spacing: -0.02em;
}
.section-desc {
  font-size: clamp(1rem, 2vw, 1.1rem);
  color: var(--text-muted);
  max-width: 640px;
  line-height: 1.6;
  margin-bottom: var(--space-10);
}

.protocol-section,
.capabilities-section,
.tech-section {
  padding: 80px 0;
  border-top: 1px solid var(--border);
}

/* =============================================
   PROTOCOL PIPELINE
   ============================================= */
.pipeline {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-bottom: var(--space-10);
  justify-content: center;
}
.pipeline-step {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  position: relative;
  transition: all var(--transition-base);
  animation: fade-slide-up 0.5s ease-out both;
  animation-delay: var(--delay);
}
.pipeline-step:hover {
  border-color: var(--accent);
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}
.step-icon-wrap {
  width: 44px; height: 44px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.step-color-1 { background: rgba(233,69,96,0.12); }
.step-color-2 { background: rgba(124,92,191,0.12); }
.step-color-3 { background: rgba(41,128,185,0.12); }
.step-color-4 { background: rgba(39,174,96,0.12); }
.step-color-5 { background: rgba(230,126,34,0.12); }

.step-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 2px 0;
}
.step-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}
.step-connector {
  position: absolute;
  right: -20px;
  display: none;
}
@media (min-width: 768px) {
  .step-connector { display: block; }
}

/* Protocol feature cards */
.protocol-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
}
.pf-card {
  background: var(--surface);
  background-image: var(--gradient-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--space-6);
  transition: all var(--transition-base);
}
.pf-card:hover {
  border-color: var(--accent);
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
.pf-icon { font-size: 32px; margin-bottom: var(--space-3); }
.pf-card h3 { margin: 0 0 var(--space-2) 0; font-size: 17px; font-weight: 600; }
.pf-card p { margin: 0; color: var(--text-muted); line-height: 1.6; font-size: 14px; }

/* =============================================
   CAPABILITIES GRID
   ============================================= */
.capabilities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--space-5);
}
.cap-card {
  background: var(--surface);
  background-image: var(--gradient-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--space-6);
  position: relative;
  transition: all var(--transition-base);
  animation: fade-slide-up 0.5s ease-out both;
  animation-delay: var(--delay);
}
.cap-card:hover {
  border-color: var(--accent);
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
.cap-number {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
  opacity: 0.4;
}
.cap-icon-wrap {
  width: 48px; height: 48px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: var(--space-3);
}
.cap-color-1 { background: rgba(233,69,96,0.1); }
.cap-color-2 { background: rgba(124,92,191,0.1); }
.cap-color-3 { background: rgba(41,128,185,0.1); }
.cap-color-4 { background: rgba(39,174,96,0.1); }

.cap-card h3 { margin: 0 0 var(--space-2) 0; font-size: 16px; font-weight: 600; }
.cap-card p { margin: 0; color: var(--text-muted); line-height: 1.6; font-size: 13px; }

/* =============================================
   TECH STACK
   ============================================= */
.tech-columns {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
  margin-bottom: var(--space-10);
}
@media (min-width: 768px) {
  .tech-columns { grid-template-columns: 1fr 1fr; }
}
.tech-col {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}
.tech-col-title {
  margin: 0 0 var(--space-4) 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--accent);
}
.tech-list { display: flex; flex-direction: column; gap: var(--space-4); }
.tech-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) 0;
}
.tech-row-icon { font-size: 24px; }
.tech-row-name { font-weight: 600; font-size: 14px; margin-bottom: 2px; }
.tech-row-desc { font-size: 13px; color: var(--text-muted); }

/* LLM Compatibility */
.llm-compat { text-align: center; }
.llm-title {
  margin: 0 0 var(--space-4) 0;
  font-size: 18px;
  font-weight: 600;
}
.llm-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: center;
}
.llm-pill {
  padding: 8px 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 500;
  transition: all var(--transition-fast);
}
.llm-pill:hover {
  border-color: var(--accent);
  color: var(--accent);
  transform: translateY(-2px);
}

/* =============================================
   CTA SECTION
   ============================================= */
.cta-section {
  position: relative;
  padding: 100px 0;
  background: var(--gradient-cta);
  overflow: hidden;
}
.cta-glow {
  position: absolute;
  width: 500px; height: 500px;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(233,69,96,0.08) 0%, transparent 70%);
  pointer-events: none;
}
.cta-content { text-align: center; position: relative; z-index: 1; }
.cta-title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  margin: 0 0 var(--space-4) 0;
}
.cta-subtitle {
  font-size: clamp(1rem, 2vw, 1.2rem);
  color: var(--text-muted);
  max-width: 640px;
  margin: 0 auto var(--space-8) auto;
  line-height: 1.6;
}
.cta-buttons {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  flex-wrap: wrap;
}

/* =============================================
   FOOTER
   ============================================= */
.landing-footer {
  background: var(--surface);
  border-top: 1px solid var(--border);
  padding: var(--space-8) 0 var(--space-6) 0;
}
.footer-top {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
  gap: var(--space-6);
}
.footer-logo {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  margin-bottom: var(--space-1);
}
.footer-tagline {
  color: var(--text-muted);
  font-size: 13px;
  margin: 0;
}
.footer-links {
  display: flex;
  gap: var(--space-6);
}
.footer-links a {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 14px;
  transition: color var(--transition-fast);
}
.footer-links a:hover { color: var(--accent); }
.footer-bottom {
  text-align: center;
  padding-top: var(--space-6);
  border-top: 1px solid var(--border);
}
.footer-bottom p {
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
}

/* =============================================
   ANIMATIONS
   ============================================= */
@keyframes fade-slide-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── Mobile adjustments ── */
@media (max-width: 768px) {
  .hero { min-height: 80vh; padding: var(--space-8) 0; }
  .hero-stats { gap: var(--space-4); }
  .stat-number { font-size: 22px; }
  .pipeline { flex-direction: column; }
  .step-connector { display: none !important; }
}
</style>
