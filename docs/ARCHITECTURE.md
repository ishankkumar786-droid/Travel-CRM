# Architecture

## Overview

Travel Marketplace is a monorepo containing multiple applications and shared packages, all built with TypeScript and managed by pnpm workspaces.

## Monorepo Structure

```
travel-marketplace/
├── apps/
│   ├── admin-crm/        # Next.js 14 App Router — Admin Dashboard
│   ├── api/              # Express 4 REST API
│   ├── collector/        # Data ingestion service (Phase 3)
│   ├── agency-portal/    # Agency portal (Phase 4)
│   ├── customer-web/     # Customer website (Phase 5)
│   └── ai-service/       # AI microservice (Phase 6)
└── packages/
    ├── ui/               # Shared React components
    ├── types/            # Shared TypeScript types
    ├── validation/       # Shared Zod schemas
    ├── config/           # Shared constants and configuration
    └── utils/            # Shared utility functions
```

## Frontend Architecture (admin-crm)

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + Shadcn UI component patterns
- **Data Fetching**: TanStack Query (server state) + React Hook Form (form state)
- **Tables**: TanStack Table
- **Theme**: next-themes (light/dark/system)
- **Notifications**: Sonner toast library
- **API Client**: Axios with interceptors

### Folder Structure

```
src/
├── app/              # Next.js App Router pages and layouts
├── components/
│   ├── ui/           # Design system primitives
│   ├── layout/       # Navbar, Sidebar, etc.
│   ├── providers/    # React context providers
│   └── error/        # Error boundaries
├── hooks/            # Reusable React hooks
├── lib/              # Client utilities (api-client, utils)
└── types/            # App-local TypeScript types
```

## Backend Architecture (api)

- **Framework**: Express 4 with TypeScript
- **Database**: MongoDB Atlas via Mongoose
- **Validation**: Zod schemas
- **Logging**: Winston (dev: colorized, prod: JSON)
- **Security**: Helmet, CORS, compression
- **Error Handling**: Centralized global error middleware

### Folder Structure

```
src/
├── config/           # Environment validation (Zod)
├── lib/              # Logger, database service, response helpers
├── middleware/       # Request ID, validation, error handler, 404
├── routes/
│   └── v1/           # Versioned API routes
└── server.ts         # Entry point with graceful shutdown
```

## Standard API Response Format

All API responses follow this envelope:

```typescript
// Success
{ success: true, data: T, message?: string, meta?: Record<string, unknown> }

// Error
{ success: false, error: { code: string, message: string, details?: object }, requestId: string, timestamp: string }
```

## Data Flow

```
Browser → Admin CRM (Next.js) → API Client (Axios) → Express API → MongoDB
```
