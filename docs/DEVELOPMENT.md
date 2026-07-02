# Development Setup

## Prerequisites

| Tool    | Version | Install                       |
| ------- | ------- | ----------------------------- |
| Node.js | >= 20.0 | https://nodejs.org            |
| pnpm    | >= 9.0  | `npm install -g pnpm@9`       |
| Docker  | Latest  | https://docker.com (optional) |
| Git     | Latest  | https://git-scm.com           |

## Initial Setup

```bash
# 1. Clone
git clone <repo-url>
cd travel-marketplace

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env
# Edit .env and fill in MONGODB_URI (Atlas or local)
cp apps/admin-crm/.env.example apps/admin-crm/.env.local
cp apps/api/.env.example apps/api/.env
```

## Running Locally

### Option A: MongoDB Atlas

Set your Atlas connection string in `apps/api/.env`:

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/travel_marketplace
```

### Option B: Local MongoDB via Docker

```bash
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d
# MongoDB available at mongodb://localhost:27017
# Mongo Express UI at http://localhost:8081
```

Then set in `apps/api/.env`:

```
MONGODB_URI=mongodb://localhost:27017/travel_marketplace
```

## Starting Apps

```bash
# Admin CRM (http://localhost:3000)
pnpm dev:admin

# API Server (http://localhost:4000)
pnpm dev:api

# Both in parallel
pnpm dev
```

## Verifying the Setup

1. Admin CRM: http://localhost:3000 — landing page
2. API Health: http://localhost:4000/api/v1/health — JSON health response
3. Mongo Express: http://localhost:8081 (if using Docker)

## Running Quality Checks

```bash
pnpm lint          # ESLint
pnpm format:check  # Prettier
pnpm typecheck     # TypeScript
pnpm build         # Full build
```
