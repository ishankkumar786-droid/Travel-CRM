# Coding Standards

## TypeScript

- **Strict mode** is required everywhere.
- No `any` without a documented justification comment.
- Use `type` imports: `import type { Foo } from './foo'`.
- Export types explicitly with `export type`.
- Prefer `interface` for object shapes that may be extended; `type` for unions/intersections.

## React / Next.js

- All components must be typed — no implicit `any` props.
- Use `React.forwardRef` when exposing a DOM element.
- Add `displayName` to all `forwardRef` components.
- Mark Client Components with `'use client'` only when necessary.
- Prefer Server Components by default.
- Always provide `aria-*` attributes for interactive elements.
- Use `next/image` for all images.
- Use `next/link` for all internal links.

## Naming Conventions

| Thing            | Convention              | Example                |
| ---------------- | ----------------------- | ---------------------- |
| Component files  | PascalCase              | `UserCard.tsx`         |
| Utility files    | camelCase               | `formatDate.ts`        |
| Hook files       | camelCase, prefixed use | `useHealthCheck.ts`    |
| CSS variables    | kebab-case              | `--primary-foreground` |
| Env variables    | SCREAMING_SNAKE_CASE    | `MONGODB_URI`          |
| Constants        | SCREAMING_SNAKE_CASE    | `MAX_LIMIT`            |
| Types/Interfaces | PascalCase              | `ApiResponse<T>`       |

## File Organization

- One export per file for components.
- Co-locate types with the code that uses them.
- Shared types go in `packages/types`.
- App-specific types go in `apps/<name>/src/types`.

## API Conventions

- All responses use the standard envelope (`sendSuccess` / `sendError` helpers).
- Routes are versioned under `/api/v1`.
- Validate all inputs with Zod schemas using the `validate` middleware.
- Never return raw Mongoose documents — transform to plain objects.

## Imports

Order (enforced by ESLint):

1. Node built-ins
2. External packages
3. Internal workspace packages (`@travel/*`)
4. App-local absolute imports (`@/*`)
5. Relative imports

Always use blank lines between groups.
