import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config([
  globalIgnores(['dist', 'coverage', 'public']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
      prettier,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // role="list" em <ul>/<ol> sem marcador é proposital: o Safari/VoiceOver remove a
      // semântica de lista quando `list-style: none`.
      'jsx-a11y/no-redundant-roles': ['error', { nav: ['navigation'], ul: ['list'], ol: ['list'] }],
    },
  },
  {
    // Cena 3D: o laço do R3F (useFrame) muta objetos do three.js por design — uniforms,
    // materiais e matrizes vivem fora do ciclo de render do React. As regras do React Compiler
    // que proíbem mutar valores vindos de hooks não se aplicam a esse modelo imperativo.
    files: ['src/scene/**/*.{ts,tsx}', 'src/camera/**/*.{ts,tsx}', 'src/assets/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/immutability': 'off',
    },
  },
  {
    files: ['**/*.{js,mjs}', 'vite.config.ts'],
    extends: [js.configs.recommended, prettier],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
    },
  },
]);
