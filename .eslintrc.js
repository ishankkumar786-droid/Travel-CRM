/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ['./.eslintrc.base.js'],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.next/',
    'coverage/',
    '*.config.js',
    '*.config.ts',
    '*.config.mjs',
    '.eslintrc*.js',
    'pnpm-lock.yaml',
  ],
};
