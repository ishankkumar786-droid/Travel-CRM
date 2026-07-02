# Database Seed

Seed scripts will live here in Phase 3+.

## Convention

- `seed.ts` — master runner that calls sub-seeders in order
- `seeders/<name>.seeder.ts` — individual collection seeders

Run with: `pnpm tsx src/database/seed/seed.ts`
