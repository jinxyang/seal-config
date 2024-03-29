const _ = require('lodash')

const getPrettierOptions = (options = {}) => {
  const defaultOptions = {
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    semi: false,
    singleQuote: true,
    quoteProps: 'as-needed',
    jsxSingleQuote: false,
    trailingComma: 'all',
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: 'always',
  }

  return _.merge(defaultOptions, options)
}

module.exports = getPrettierOptions
