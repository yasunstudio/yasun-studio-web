.DEFAULT_GOAL := help
COMPOSE      := docker compose
COMPOSE_PROD := docker compose -f docker-compose.yml

help: ## Tampilkan daftar perintah
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

env: ## Buat .env dari template (sekali saja)
	@test -f .env || (cp .env.example .env && echo ".env dibuat — ganti SECRET_KEY & password!")

up: env ## Jalankan stack development (hot reload)
	$(COMPOSE) up -d --build

down: ## Hentikan stack
	$(COMPOSE) down

logs: ## Ikuti log semua service
	$(COMPOSE) logs -f --tail=100

ps: ## Status container
	$(COMPOSE) ps

prod: env ## Jalankan stack production (tanpa override dev)
	$(COMPOSE_PROD) up -d --build

migrate: ## Terapkan migrasi database
	$(COMPOSE) exec backend alembic upgrade head

migration: ## Buat migrasi baru: make migration m="pesan"
	$(COMPOSE) exec backend alembic revision --autogenerate -m "$(m)"

seed: ## Jalankan seeder (idempotent)
	$(COMPOSE) exec backend python -m scripts.seed

seed-reset: ## Hapus semua data & isi ulang data demo (khusus dev)
	$(COMPOSE) exec backend python -m scripts.seed --reset

test: ## Test backend
	$(COMPOSE) exec backend pytest -q

lint: ## Lint backend + frontend
	$(COMPOSE) exec backend ruff check .
	$(COMPOSE) exec frontend pnpm lint

e2e: ## E2E browser + UI audit (stack harus berjalan; butuh Google Chrome)
	cd e2e && npm install --silent && npm run all

typecheck: ## Typecheck frontend
	$(COMPOSE) exec frontend pnpm typecheck

shell-db: ## psql ke database
	$(COMPOSE) exec db sh -c 'psql -U $$POSTGRES_USER -d $$POSTGRES_DB'

shell-redis: ## redis-cli
	$(COMPOSE) exec redis redis-cli

clean: ## Hapus container + volume (DATA HILANG)
	$(COMPOSE) down -v
