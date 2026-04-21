import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

const SESSION_DATA = {
  id: 10,
  title: 'AI CRM Rollout Q3',
  status: 'complete',
  participants: ['alice-cto', 'bob-cfo'],
  consensus_score: 0.72,
  created_at: '2026-01-15T10:00:00Z',
  project_id: 1,
}

// Field names match what AnalyticsDashboard.vue actually reads:
// - final_consensus_score (not final_consensus)
// - total_rounds (not rounds)
// - session_duration (not duration_seconds)
// - risk_table (array, not risk_assessment object)
const ANALYTICS_DATA = {
  session_id: 10,
  final_consensus_score: 0.72,
  total_rounds: 3,
  total_turns: 12,
  session_duration: '4:05',
  consensus_trajectory: [0.45, 0.58, 0.72],
  influence_leaderboard: [
    { agent: 'alice-cto', name: 'Alice Chen', combined_score: 0.85, eigenvector: 0.9, betweenness: 0.7 },
    { agent: 'bob-cfo', name: 'Bob Martinez', combined_score: 0.62, eigenvector: 0.6, betweenness: 0.55 },
  ],
  risk_table: [
    { name: 'All Agents', score: 0.3, level: 'Low', drivers: ['Budget constraints', 'Timeline pressure'] },
  ],
  coalition_map: [
    { agents: ['alice-cto'], intra_similarity: 1.0 },
    { agents: ['bob-cfo'], intra_similarity: 1.0 },
  ],
  round_syntheses: [
    { round: 1, summary: 'Agents debated initial positions.' },
    { round: 2, summary: 'Convergence on timeline concerns.' },
    { round: 3, summary: 'Final consensus reached on phased rollout.' },
  ],
}

const VOTING_SUMMARY = {
  items: [
    {
      item_id: 1,
      text: 'AI CRM will improve sales productivity',
      agree: ['alice-cto'],
      oppose: [],
      neutral: ['bob-cfo'],
    },
  ],
}

test.describe('Analytics dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/sessions/10', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(SESSION_DATA) })
    })
    await page.route('**/api/sessions/10/analytics**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ANALYTICS_DATA) })
    })
    await page.route('**/api/sessions/10/voting-summary**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(VOTING_SUMMARY) })
    })
    await page.goto('/sessions/10/analytics')
    await page.waitForLoadState('networkidle')
  })

  test('analytics page loads', async ({ page }) => {
    await expect(page).toHaveURL(/\/sessions\/10\/analytics/)
  })

  test('"← Back" link is visible', async ({ page }) => {
    await expect(page.getByText('← Back')).toBeVisible()
  })

  test('final consensus score is displayed', async ({ page }) => {
    await expect(page.getByText('Final Consensus')).toBeVisible()
    await expect(page.getByText('72%')).toBeVisible()
  })

  test('rounds stat is shown', async ({ page }) => {
    await expect(page.getByText('Rounds')).toBeVisible()
  })

  test('total turns stat is shown', async ({ page }) => {
    await expect(page.getByText('Total Turns')).toBeVisible()
  })

  test('consensus trajectory chart section is visible', async ({ page }) => {
    await expect(page.getByText('Consensus Trajectory')).toBeVisible()
  })

  test('influence leaderboard section is visible', async ({ page }) => {
    await expect(page.getByText('Influence Leaderboard')).toBeVisible()
  })

  test('influence leaderboard shows agent names', async ({ page }) => {
    await expect(page.getByText('Alice Chen')).toBeVisible()
    await expect(page.getByText('Bob Martinez')).toBeVisible()
  })

  test('risk assessment section is visible', async ({ page }) => {
    await expect(page.getByText('Risk Assessment')).toBeVisible()
  })

  test('risk level is shown', async ({ page }) => {
    await expect(page.getByText('Low')).toBeVisible()
  })

  test('"← Back" navigates away from analytics page', async ({ page }) => {
    await page.getByText('← Back').first().click()
    // Back button goes to /sessions list
    await expect(page).toHaveURL(/\/sessions($|\/)/)
  })

  test('post-session subtitle is visible', async ({ page }) => {
    await expect(page.getByText('Post-session deep-dive')).toBeVisible()
  })

  test('voting matrix section is visible when data exists', async ({ page }) => {
    await expect(page.getByText(/Voting Matrix|agenda/i)).toBeVisible()
  })

  test('duration stat is shown', async ({ page }) => {
    await expect(page.getByText('Duration')).toBeVisible()
  })
})
