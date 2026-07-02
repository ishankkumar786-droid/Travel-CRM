# Travel Marketplace

A full-stack travel marketplace platform built as a production-ready monorepo.

## Project Structure

```
travel-marketplace/
├── apps/
│   ├── admin-crm/        # Next.js Admin Dashboard & CRM
│   ├── api/              # Express REST API
│   ├── collector/        # Data Collection Service (placeholder)
│   ├── agency-portal/    # Agency Self-Service Portal (placeholder)
│   ├── customer-web/     # Customer-Facing Website (placeholder)
│   └── ai-service/       # AI Microservice (placeholder)
├── packages/
│   ├── ui/               # Shared UI Components
│   ├── types/            # Shared TypeScript Types
│   ├── validation/       # Shared Zod Validation Schemas
│   ├── config/           # Shared Configuration
│   └── utils/            # Shared Utilities
├── docs/                 # Documentation
├── scripts/              # Automation Scripts
├── infrastructure/       # Docker, CI/CD, IaC
└── .github/              # GitHub Actions & Templates
```

## Technology Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Frontend   | Next.js 14 (App Router), TypeScript |
| Styling    | Tailwind CSS, Shadcn UI             |
| State/Data | TanStack Query, React Hook Form     |
| Backend    | Node.js, Express, TypeScript        |
| Database   | MongoDB Atlas, Mongoose             |
| Validation | Zod                                 |
| Monorepo   | pnpm Workspaces                     |
| Linting    | ESLint, Prettier                    |
| Git Hooks  | Husky, lint-staged                  |

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0

Install pnpm: `npm install -g pnpm@9`

## Getting Started

```bash
# 1. Clone the repository
git clone <repo-url>
cd travel-marketplace

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your values

# 4. Start development servers
pnpm dev:admin    # Admin CRM on http://localhost:3000
pnpm dev:api      # API Server on http://localhost:4000
```

## Available Scripts

| Script           | Description                          |
| ---------------- | ------------------------------------ |
| `pnpm dev`       | Start all apps in parallel           |
| `pnpm dev:admin` | Start Admin CRM only                 |
| `pnpm dev:api`   | Start API server only                |
| `pnpm build`     | Build all packages and apps          |
| `pnpm lint`      | Lint all packages and apps           |
| `pnpm lint:fix`  | Lint and auto-fix all                |
| `pnpm format`    | Format all files with Prettier       |
| `pnpm typecheck` | Run TypeScript type checks           |
| `pnpm test`      | Run all tests                        |
| `pnpm clean`     | Remove all build outputs and modules |

## Documentation

See the [docs/](./docs/) directory for detailed documentation:

- [Architecture](./docs/ARCHITECTURE.md)
- [Development Setup](./docs/DEVELOPMENT.md)
- [Coding Standards](./docs/CODING_STANDARDS.md)
- [Contributing](./CONTRIBUTING.md)

## License

See [LICENSE](./LICENSE) for details.
