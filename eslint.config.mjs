import js from '@eslint/js';
import { fixupPluginRules } from '@eslint/compat';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import prettierConfig from 'eslint-config-prettier';


const IMPORT_RULES = {
  'import/prefer-default-export': 'off',
  'import/no-cycle': 'off',
  'import/no-unused-modules': ['error'],
  'no-console': ['warn', { allow: ['error'] }],
  'import/order': [
    'error',
    {
      pathGroups: [
        { pattern: '@nestjs/**', group: 'builtin', position: 'before' },
        { pattern: '@*/**', group: 'builtin', position: 'before' },
        { pattern: 'nestjs-**', group: 'builtin', position: 'before' },
      ],
      pathGroupsExcludedImportTypes: ['builtin'],
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      warnOnUnassignedImports: true,
    },
  ],
};

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },


    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    plugins: {
      import: fixupPluginRules(importPlugin),
    },
    rules: {


      '@typescript-eslint/interface-name-prefix': 'off',

      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unsafe-optional-chaining': 'warn',
      'no-useless-escape': 'off',

      ...IMPORT_RULES,
    },
  },

  prettierConfig,
);