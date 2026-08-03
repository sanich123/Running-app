const js = require('@eslint/js');
const { configs, parser } = require('typescript-eslint');
const { flatConfigs } = require('eslint-plugin-import-x');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const reactRefresh = require('eslint-plugin-react-refresh');
const unusedImports = require('eslint-plugin-unused-imports');
const prettier = require('eslint-config-prettier');

module.exports = [
  {
    ignores: [
      'node_modules',
      'build',
      'dist',
      '**/*.config.js',
      'ios',
      'android',
      'coverage',
      'custom.plugin.js',
      '.expo',
      '.agents',
    ],
  },
  js.configs.recommended,
  ...configs.recommended,
  ...configs.stylistic,
  flatConfigs.recommended,
  flatConfigs.typescript,
  react.configs.flat['jsx-runtime'],
  prettier,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { project: './tsconfig.json' },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'unused-imports': unusedImports,
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': { typescript: { project: './tsconfig.json', alwaysTryTypes: true } },
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/consistent-generic-constructors': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react-refresh/only-export-components': ['off', { allowConstantExport: true }],
      'import-x/no-unresolved': 'error',
      'import-x/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'object', 'type'],
          pathGroups: [
            { pattern: 'react', group: 'external', position: 'before' },
            { pattern: 'react-native', group: 'external', position: 'after' },
            { pattern: 'expo-router', group: 'external', position: 'after' },
            { pattern: 'react-native-paper', group: 'external', position: 'after' },
            { pattern: 'react-hook-form', group: 'external', position: 'after' },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'never',
        },
      ],
      'react-hooks/set-state-in-effect': 'warn',
      'no-unused-vars': 'off',
      'no-useless-assignment': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],
    },
  },
];
