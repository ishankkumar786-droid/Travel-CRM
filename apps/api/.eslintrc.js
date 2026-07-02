/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['../../.eslintrc.base.js'],
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  env: { node: true, es2022: true },
  ignorePatterns: ['src/tests/**'],
  rules: {
    'no-console': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    '@typescript-eslint/no-unsafe-enum-comparison': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/consistent-type-imports': 'off',
  },
  overrides: [
    {
      files: ['src/tests/**/*.ts'],
      parserOptions: { project: null },
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
      },
    },
    {
      // Phase 6 & 7 services that use `any` typed Mongoose models — relax unsafe rules
      files: [
        'src/services/import.service.ts',
        'src/services/verification.service.ts',
        'src/services/analytics.service.ts',
        'src/services/audit.service.ts',
        'src/controllers/phase6.controller.ts',
        'src/services/onboarding.service.ts',
        'src/services/marketplace-profile.service.ts',
        'src/services/package.service.ts',
        'src/services/public-api.service.ts',
        'src/services/catalog.service.ts',
        'src/services/destination.service.ts',
        'src/routes/v1/phase6.ts',
      ],
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/no-unnecessary-type-assertion': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
  ],
};
