const _ = require('lodash')

const { getModulePath } = require('./_utils')

const getESLintOptions = (
  options = {},
  babelOptions = {},
  prettierOptions = {},
) => {
  const defaultOptions = {
    parser: getModulePath('@babel/eslint-parser'),
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      allowImportExportEverywhere: true,
      ecmaFeatures: {
        globalReturn: true,
        jsx: true,
      },
      requireConfigFile: false,
      babelOptions,
    },
    env: {
      browser: true,
      node: true,
      commonjs: true,
    },
    extends: [
      getModulePath('eslint-config-standard'),
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'plugin:prettier/recommended',
    ],
    settings: {
      react: {
        version: '18',
      },
    },
    rules: {
      'prettier/prettier': [
        'error',
        prettierOptions,
        {
          usePrettierrc: false,
        },
      ],
    },
  }

  return _.merge(defaultOptions, options)
}

module.exports = getESLintOptions
