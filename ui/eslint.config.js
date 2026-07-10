import eslintReact from '@eslint-react/eslint-plugin';
import js from '@eslint/js';
import pluginRouter from '@tanstack/eslint-plugin-router';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...tsPlugin.configs['flat/recommended'],
  ...pluginRouter.configs['flat/recommended'],
  eslintReact.configs['recommended-typescript'],
  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      // eslint-plugin-react-hooks (the React team's implementation) is the authority on hooks;
      // turn off @eslint-react's overlapping copies so each issue reports once.
      '@eslint-react/rules-of-hooks': 'off',
      '@eslint-react/exhaustive-deps': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    },
  },
  {
    ignores: ['node_modules/**', 'dist/**', 'src/routeTree.gen.ts'],
  },
];
