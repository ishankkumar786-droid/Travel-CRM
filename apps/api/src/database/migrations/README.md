# Database Migrations

Migration scripts live here.

## Convention

Files are named `YYYYMMDD-description.ts`, e.g. `20240601-add-agency-slug.ts`.

Each file exports:

```ts
export async function up(): Promise<void> { ... }
export async function down(): Promise<void> { ... }
```

Run with: `pnpm tsx src/database/migrations/runner.ts`
