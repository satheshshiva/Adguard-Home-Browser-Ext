const tseslint = require('@typescript-eslint/eslint-plugin')
const tsparser = require('@typescript-eslint/parser')
const vueParser = require('vue-eslint-parser')
const vuePlugin = require('eslint-plugin-vue')
const importPlugin = require('eslint-plugin-import')
const prettierConfig = require('eslint-config-prettier')

module.exports = [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'src/webpack/**',
      'package.*.zip'
    ]
  },
  ...vuePlugin.configs['flat/recommended'],
  {
    files: ['**/*.ts', '**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsparser,
        project: ['tsconfig.json'],
        tsconfigRootDir: __dirname,
        extraFileExtensions: ['.vue']
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin
    },
    rules: {
      'import/no-extraneous-dependencies': 'off',
      'class-methods-use-this': 'off',
      'no-restricted-syntax': ['off', 'ForOfStatement'],
      'prefer-promise-reject-errors': 'off',
      'no-plusplus': 'off',
      'no-console': 'off'
    }
  },
  prettierConfig
]
