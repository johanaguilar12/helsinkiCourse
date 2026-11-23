import js from '@eslint/js'
import globals from 'globals'
import stylistic from '@stylistic/eslint-plugin'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: globals.node,
    },
    plugins: {
      js,
      '@stylistic': stylistic,
    },
    extends: ['js/recommended'],
    rules: {
      eqeqeq: 'error',
      'no-console': 'off',
      '@stylistic/arrow-spacing': ['error', { before: true, after: true }],
      '@stylistic/indent': ['error', 2],
      '@stylistic/list-style': 'error',
      '@stylistic/no-trailing-spaces': 'error',
    },
  },
  globalIgnores(['dist/']),
])
