# Deployment Guide — War Games

Production deployment: **Vercel** (frontend) + **Render** (backend) + **Cloudflare** (DNS + API proxy) + **Supabase** (auth/DB).

**Live URLs:**

- Frontend: `https://crew-ai.me` (landing) / `https://app.crew-ai.me` (app)
- Backend API: `https://api.crew-ai.me`
- Legacy: `https://your-project.vercel.app` (still works as fallback)

---

## Architecture

```text
Browser
  │
  ├─── crew-ai.me ──────► Vercel CDN (Vue SPA landing page)
  ├─── app.crew-ai.me ──► Vercel CDN (Vue SPA full app)
  │                          │
  │                          │  VITE_API_BASE = https://api.crew-ai.me
  │                          ▼
  └─── api.crew-ai.me ──► Cloudflare Worker (reverse proxy)
                             │
                             ▼
                          Render (FastAPI + Docker, free tier)
                             │
                             ├──► Supabase PostgreSQL (via pooler, IPv4)
                             └──► LLM Proxy (LLM_BASE_URL)
```

**Why this architecture:**

- **Vercel** serves the static Vue bundle from edge CDN — zero config, fast, free.
- **Render** runs the backend in a Docker container (free tier, 512MB RAM). Spins down after 15 min idle; first request after idle takes ~30s.
- **Cloudflare Worker** proxies `api.crew-ai.me` → Render. Required because Render uses Cloudflare as CDN — a direct CNAME from a Cloudflare zone to a Cloudflare-proxied target causes Error 1000.
- **Supabase pooler** (`aws-1-us-east-1.pooler.supabase.com:5432`) required because the direct DB host is IPv6-only and Render doesn't support IPv6 outbound.

### Custom Domain — Cloudflare DNS

All domains are managed in **Cloudflare** (`crew-ai.me`, zone `71d25d07ad2a0e111041bc28be66b178`).

| Type  | Name  | Target                    | Proxy | Notes |
|-------|-------|---------------------------|-------|-------|
| CNAME | `@`   | `cname.vercel-dns.com`    | OFF   | Frontend landing |
| CNAME | `app` | `cname.vercel-dns.com`    | OFF   | Frontend app |
| A     | `api` | `192.0.2.1`               | ON    | Dummy — Worker handles routing |
| CNAME | `www` | `crew-ai.me`              | ON    | Redirect to root |

The `api` A record is a dummy (RFC 5737 TEST-NET). All traffic is intercepted by the Cloudflare Worker `api-proxy` which reverse-proxies to `your-backend-service.onrender.com`.

---

## 1. Render — Backend

### 1.1 Service

- **Service ID:** `srv-d6uorkk50q8c7397fie0`
- **URL:** `https://your-backend-service.onrender.com`
- **Custom domain:** `api.crew-ai.me` (via Cloudflare Worker)
- **Plan:** Free (512MB RAM, spins down after idle)
- **Region:** Ohio
- **Runtime:** Docker (`Dockerfile` at repo root)
- **Auto-deploy:** Yes (on push to `main`)

### 1.2 Dockerfile

Uses `requirements-deploy.txt` (slim — no PyTorch, no hdbscan) to fit in 512MB:

```dockerfile
FROM python:3.13-slim
WORKDIR /app
COPY requirements-deploy.txt .
RUN pip install --no-cache-dir -r requirements-deploy.txt
COPY backend/ ./backend/
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 1.3 Environment variables

Set via Render dashboard or API (`RENDER_API_KEY`):

| Variable | Value |
|----------|-------|
| `LLM_BASE_URL` | `https://your-llm-proxy/v1` |
| `LLM_API_KEY` | (from `.env`) |
| `LLM_DEFAULT_MODEL` | `gpt-4o` |
| `LLM_CHAIRMAN_MODEL` | `gpt-4o` |
| `LLM_COUNCIL_MODELS` | `gpt-4o` |
| `DATABASE_URL` | `postgresql://postgres.vfvazdwrppqozeevycdm:<pw>@aws-1-us-east-1.pooler.supabase.com:5432/postgres` |
| `ALLOWED_ORIGINS` | `https://crew-ai.me,https://app.crew-ai.me,https://your-project.vercel.app,http://localhost:5173` |
| `SUPABASE_URL` | `https://vfvazdwrppqozeevycdm.supabase.co` |
| `SUPABASE_ANON_KEY` | (from `.env`) |
| `SUPABASE_SERVICE_KEY` | (from `.env`) |
| `SUPABASE_JWT_SECRET` | (from `.env`) |
| `DEBUG` | `false` |

**Critical:** `DATABASE_URL` must use the **Supabase pooler** (`aws-1-us-east-1.pooler.supabase.com:5432`), not the direct host (`db.xxx.supabase.co`). The direct host is IPv6-only and Render cannot reach it.

### 1.4 Deploy

Auto-deploys on push to `main`. Manual deploy via API:

```bash
curl -X POST "https://api.render.com/v1/services/srv-d6uorkk50q8c7397fie0/deploys" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" -d '{}'
```

---

## 2. Cloudflare Worker — API Proxy

A Worker named `api-proxy` reverse-proxies `api.crew-ai.me/*` → `your-backend-service.onrender.com`.

**Why:** Render uses Cloudflare as its CDN. A CNAME from a Cloudflare zone to another Cloudflare-proxied domain causes Error 1000 ("DNS points to prohibited IP"). The Worker bypasses this by fetching from Render at the application layer.

### 2.1 Worker source

Located at `/tmp/cf-worker/worker.js` (not checked in). Handles all HTTP methods including SSE streaming, sets CORS headers, and handles OPTIONS preflight.

### 2.2 Deploy

```bash
cd /tmp/cf-worker
npx wrangler deploy
```

### 2.3 Free tier limits

100,000 requests/day on the Cloudflare Workers free tier. More than sufficient for this project.

---

## 3. Vercel — Frontend

### 3.1 Project

- **Project ID:** `prj_hWWMd3BQNJfQdZdqnd4ScUNF0tFC`
- **Team ID:** `team_lGVkgDWUisE9RNtAuMC90hG4`
- **Domains:** `crew-ai.me`, `app.crew-ai.me`, `your-project.vercel.app`

### 3.2 Environment variables

| Variable | Value |
|----------|-------|
| `VITE_API_BASE` | `https://api.crew-ai.me` |
| `VITE_SUPABASE_URL` | `https://vfvazdwrppqozeevycdm.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | (anon key) |

**Important:** These are baked into the JS bundle at build time. After changing, trigger a redeploy (push to `main` or Vercel dashboard).

### 3.3 Deploy

Auto-deploys on push to `main`.

---

## 4. Supabase — Auth & Database

### 4.1 Projects

| Role | Project Ref | URL |
|------|------------|-----|
| **Production** (Pro plan) | `vfvazdwrppqozeevycdm` | `https://vfvazdwrppqozeevycdm.supabase.co` |
| Testing (free tier) | `vvhsppuxciiwtkamasry` | `https://vvhsppuxciiwtkamasry.supabase.co` |

### 4.2 OAuth Configuration

1. **Auth → URL Configuration:**
   - Site URL: `https://crew-ai.me`
   - Redirect URLs: `https://crew-ai.me/**`, `https://app.crew-ai.me/**`, `http://localhost:5173/**`

2. **Auth → Providers → Google:** Enable, set callback URL:
   ```
   https://vfvazdwrppqozeevycdm.supabase.co/auth/v1/callback
   ```

3. **Auth → Providers → GitHub:** Enable, set callback URL:
   ```
   https://vfvazdwrppqozeevycdm.supabase.co/auth/v1/callback
   ```

### 4.3 Database Connection

- **Pooler (IPv4):** `postgresql://postgres.vfvazdwrppqozeevycdm:<pw>@aws-1-us-east-1.pooler.supabase.com:5432/postgres`
- **Direct (IPv6-only):** `postgresql://postgres:<pw>@db.vfvazdwrppqozeevycdm.supabase.co:5432/postgres`

Use the **pooler** for all external services (Render, Fly.io, etc.). Direct connection only works from IPv6-capable hosts.

---

## 5. Seed Demo Projects

After the first successful backend deploy:

```bash
curl -X POST https://api.crew-ai.me/api/projects/seed-demo
```

Idempotent — safe to call multiple times.

---

## 6. Verification Checklist

- [x] `GET https://api.crew-ai.me/api/health` returns `{"status": "ok"}`
- [x] Vercel build completes without errors
- [x] `https://crew-ai.me` loads the landing page
- [x] `https://app.crew-ai.me/projects` loads the projects page (SPA fallback)
- [ ] Login with Google OAuth works (Supabase callback URLs set)
- [ ] Creating a project and running a session works end-to-end
- [ ] SSE stream stays connected during a full debate round
- [ ] Demo projects appear in the Community tab (after seeding)
- [x] Legacy `https://your-project.vercel.app` still works

---

## 7. Self-Hosted Alternative

A `docker-compose.yml` is included for running locally or on a VPS:

```bash
cp .env.example .env
# edit .env with your credentials
docker compose up -d
# Backend: http://localhost:8000
# Frontend: http://localhost:80
```

---

## 8. Environment Variable Reference

### Backend (Render env vars)

| Variable | Required | Description |
|----------|----------|-------------|
| `LLM_BASE_URL` | yes | LLM proxy base URL |
| `LLM_API_KEY` | yes | LLM proxy API key |
| `LLM_DEFAULT_MODEL` | yes | Default model slug |
| `LLM_COUNCIL_MODELS` | yes | Comma-separated council model slugs |
| `LLM_CHAIRMAN_MODEL` | yes | Chairman model slug |
| `DATABASE_URL` | yes | PostgreSQL connection string (**must use pooler**) |
| `ALLOWED_ORIGINS` | yes | CORS allowed origins (comma-separated) |
| `SUPABASE_URL` | yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | yes | Supabase anon key |
| `SUPABASE_SERVICE_KEY` | yes | Supabase service role key |
| `SUPABASE_JWT_SECRET` | yes | Supabase JWT secret |
| `DEBUG` | no | `false` in production |

### Frontend (Vercel build-time)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | yes | Supabase anon key |
| `VITE_API_BASE` | yes | Backend API URL (`https://api.crew-ai.me`) |

### API Keys (for CI/CD and automation)

| Service | Key Format | Where to get |
|---------|-----------|--------------|
| Render | `rnd_xxx` | dashboard.render.com → Account → API Keys |
| Vercel | `vcp_xxx` | vercel.com → Settings → Tokens |
| Cloudflare DNS | `cfut_xxx` | dash.cloudflare.com/profile/api-tokens → Edit zone DNS |
| Supabase | `sbp_xxx` | supabase.com/dashboard/account/tokens |
