# Contributing to Travel Marketplace

Thank you for your interest in contributing. This guide covers everything you need to get started.

## Development Workflow

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create a branch** from `main` using the naming convention:
   - `feat/your-feature-name`
   - `fix/issue-description`
   - `docs/update-description`
   - `chore/maintenance-task`
4. **Make your changes** following the coding standards
5. **Run checks** locally before pushing:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm build
   ```
6. **Commit** using conventional commits format
7. **Push** your branch and open a Pull Request

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/).

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`

Examples:

```
feat(api): add health check endpoint
fix(admin-crm): resolve sidebar layout issue
docs: update development setup guide
chore: upgrade typescript to 5.4
```

## Code Standards

- **TypeScript strict mode** is enforced. No `any` without justification.
- **ESLint** must pass with zero errors.
- **Prettier** formatting is required.
- **No unused imports** or variables.
- All public functions should have JSDoc comments where non-obvious.

## Pull Request Guidelines

- Keep PRs focused on a single concern.
- Reference any related issues with `Closes #123`.
- Add a clear description of what changed and why.
- Ensure all CI checks pass.

## Code of Conduct

See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
