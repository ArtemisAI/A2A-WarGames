# Claude Code Instructions — A2A War Games (Public)

See **[AGENTS.md](./AGENTS.md)** for architecture overview and build/test/run instructions.

## Quick Summary

- **Repo:** A2A War Games — multi-agent stakeholder debate simulator
- **Backend:** `backend/` — FastAPI + SQLAlchemy (SQLite default, PostgreSQL/Supabase for production)
- **Frontend:** `frontend/` — Vue 3 + Pinia + Vite + Tailwind CSS v4
- **Tests:** 654/654 passing

### Critical Rules

1. **Never commit `.env` files** — use `.env.example` as the template
2. **Commit frequently** — one logical change per commit
3. **Run tests before pushing** — `pytest tests/ -v`

### LLM Configuration

Configure providers in the Settings page. The platform works with any OpenAI-compatible endpoint plus native support for Anthropic Claude, Mistral (Groq), and Ollama.
