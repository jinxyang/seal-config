const _ = require('lodash')

const { getModulePath } = require('./_utils')

const getBabelOptions = (options = {}, targets = {}) => {
  const defaultOptions = {
    presets: [
      [
        getModulePath('@babel/preset-env'),
        {
          targets,
          modules: false,
          useBuiltIns: 'usage',
          corejs: {
            version: 3,
          },
          shippedProposals: true,
        },
      ],
      getModulePath('@babel/preset-react'),
      getModulePath('@babel/preset-flow'),
    ],
    plugins: [
      getModulePath('@babel/plugin-proposal-do-expressions'),
      getModulePath('@babel/plugin-proposal-export-default-from'),
      getModulePath('@babel/plugin-proposal-export-namespace-from'),
      getModulePath('@babel/plugin-proposal-partial-application'),
      [
        getModulePath('@babel/plugin-proposal-record-and-tuple'),
        {
          importPolyfill: true,
          syntaxType: 'hash',
        },
      ],
      getModulePath('@babel/plugin-transform-runtime'),
      [
        getModulePath('@emotion/babel-plugin'),
        {
          autoLabel: 'never',
        },
      ],
    ],
  }

  return _.merge(defaultOptions, options)
}

module.exports = getBabelOptions
