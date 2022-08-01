const path = require('path')

const _ = require('lodash')
const queryString = require('query-string')
const dotenv = require('dotenv')

const { getAppPath, getModulePath, requireModule } = require('./_utils')

const webpack = requireModule('webpack')
const HtmlWebpackPlugin = requireModule('html-webpack-plugin')
const ReactRefreshWebpackPlugin = requireModule(
  '@pmmmwh/react-refresh-webpack-plugin',
)
const FriendlyErrorsWebpackPlugin = requireModule(
  '@soda/friendly-errors-webpack-plugin',
)
const ESLintPlugin = requireModule('eslint-webpack-plugin')
const CopyWebpackPlugin = requireModule('copy-webpack-plugin')
const MiniCssExtractPlugin = requireModule('mini-css-extract-plugin')
const CssMinimizerPlugin = requireModule('css-minimizer-webpack-plugin')
const TerserPlugin = requireModule('terser-webpack-plugin')
const { BundleAnalyzerPlugin } = requireModule('webpack-bundle-analyzer')

const getEntry = (input, hotOptions) => {
  const result = {
    index: _.filter(
      [
        input,
        hotOptions &&
          getModulePath('webpack-hot-middleware/client?') +
            queryString.stringify({
              timeout: 4000,
              reload: true,
              quiet: true,
              ..._.omit(hotOptions ?? {}, ['log', 'heartbeat']),
            }),
      ],
      Boolean,
    ),
  }
  return result
}

const getOutput = (output, publicPath = '/', hash) => {
  const result = {
    path: getAppPath(output),
    filename: hash ? `[name].[${hash}].js` : '[name].js',
    assetModuleFilename: hash
      ? `assets/[name].[${hash}][ext][query]`
      : '[path][name][ext]',
    publicPath,
  }

  return result
}

const getBabelLoader = (
  srcDir,
  options = {},
  alias = {},
  targets = {},
  cacheDirectory = true,
) => {
  const result = {
    test: /\.jsx?$/,
    include: [srcDir, ..._.values(alias)],
    exclude: /node_modules/,
    use: [
      {
        loader: getModulePath('babel-loader'),
        options: {
          cacheDirectory,
          ...require('./babel')(options, targets),
        },
      },
    ],
  }
  console.log(result.include)
  return result
}

const getStyleLoader = (isDev = false, cssOptions, styleOptions) => {
  const result = {
    test: /\.css$/,
    use: [
      {
        loader: isDev
          ? getModulePath('style-loader')
          : MiniCssExtractPlugin.loader,
        options: styleOptions,
      },
      {
        loader: getModulePath('css-loader'),
        options: cssOptions,
      },
    ],
  }

  return result
}

const getAssetsLoader = () => {
  const result = {
    test: /\.(png|svg|jpg|jpeg|gif|woff|woff2|eot|ttf|otf)$/i,
    type: 'asset/resource',
  }
  return result
}

const getResolve = (srcDir = '', alias = {}) => {
  const result = {
    modules: [srcDir, getAppPath('node_modules'), getModulePath()],
    alias: { ...alias },
  }

  return result
}

const getDefinePlugin = (name) => {
  const env = _.mapValues(
    dotenv.config({ path: getAppPath(name ? '.env.' + name : '.env') })
      ?.parsed ?? {},
    JSON.stringify,
  )

  return new webpack.DefinePlugin({
    'process.env': env,
  })
}

const getErrorPlugin = (options = {}) => {
  return new FriendlyErrorsWebpackPlugin(options)
}

const getHtmlPlugin = (title = 'SEAL', options) => {
  const htmlOptions = {
    inject: 'body',
    ...options,
    template: options?.template
      ? getAppPath(options?.template)
      : path.resolve(__dirname, '../public/index.html'),
    favicon: options?.favicon
      ? getAppPath(options?.favicon)
      : path.resolve(__dirname, '../public/favicon.ico'),
  }

  return new HtmlWebpackPlugin({ title, ...htmlOptions })
}

const getCopyPlugin = (output, options = {}) => {
  const { patterns, ...otherOptions } = options
  const copyOptions = {
    patterns: [
      {
        from: getAppPath('static'),
        to: getAppPath(path.join(output, 'static')),
        noErrorOnMissing: true,
        info: { minimized: true },
      },
      ..._.map(patterns ?? [], ({ from, to, ...options }) => ({
        from: getAppPath(from),
        to: getAppPath(to),
        ...options,
      })),
    ],
    ...otherOptions,
  }
  return new CopyWebpackPlugin(copyOptions)
}

const getESLintPlugin = (
  srcDir,
  options = {},
  babelOptions = {},
  prettierOptions = {},
  alias = {},
  targets = {},
) => {
  const baseConfig = require('./eslint')(
    options,
    require('./babel')(babelOptions, targets),
    require('./prettier')(prettierOptions),
  )

  const files = _.flow(
    (alias) => _.values(alias),
    (paths) =>
      _.map([srcDir, ...paths], (pathname) =>
        path.join(
          path.relative(getAppPath(), pathname),
          '**/*.{js,jsx,ts,tsx}',
        ),
      ),
  )(alias)

  const pluginOptions = {
    eslintPath: getModulePath('eslint'),
    resolvePluginsRelativeTo: getModulePath(),
    baseConfig,
    useEslintrc: false,
    extensions: ['.jsx', '.js'],
    files,
  }

  return new ESLintPlugin(pluginOptions)
}

const getDevPlugins = () => {
  return [
    new webpack.HotModuleReplacementPlugin(),
    new ReactRefreshWebpackPlugin(),
  ]
}

const getWebpackConfig = (config = {}, mode = 'development') => {
  const isDev = mode === 'development'
  process.env.NODE_ENV = isDev ? 'development' : 'production'

  const getCacheDirectory = (dirname = '') =>
    path.join(getAppPath('node_modules/.cache'), config.env || '', dirname)
  return {
    ...config.webpack,
    name: config.env,
    mode,
    context: getAppPath(),
    entry: getEntry(config.input, isDev && (config.hot ?? true)),
    output: {
      clean: !isDev,
      ...config.webpack?.output,
      ...getOutput(config.output, config.publicPath, !isDev && config.hash),
    },
    module: {
      ...config.webpack?.module,
      rules: [
        getBabelLoader(
          config.srcDir,
          _.merge(
            config.babel ?? {},
            isDev && { plugins: [requireModule('react-refresh/babel')] },
          ),
          config.alias,
          config.targets,
          getCacheDirectory('babel-loader'),
        ),
        getStyleLoader(isDev, config.css, config.style),
        getAssetsLoader(),
        ...(config.webpack?.module?.rules ?? []),
      ],
    },
    resolve: {
      extensions: ['.jsx', '.js', '.json'],
      ...config.webpack?.resolve,
      ...getResolve(config.srcDir, config.alias),
    },
    devtool: isDev ? config.sourceMap : config.prodSourceMap,
    plugins: _.concat(
      [
        getDefinePlugin(config.env),
        getErrorPlugin(
          isDev
            ? {
                compilationSuccessInfo: {
                  messages: [
                    `${config.title} is running here http://localhost:${config.port}`,
                  ],
                  ...config.friendly,
                },
              }
            : config.prodFriendly,
        ),
        getCopyPlugin(config.output, config.copy),
        getHtmlPlugin(config.title, config.html),
        getESLintPlugin(
          config.srcDir,
          config.eslint,
          config.babel,
          config.prettier,
          config.alias,
          config.targets,
        ),
      ],
      isDev
        ? getDevPlugins()
        : [
            new MiniCssExtractPlugin({
              filename: `[name].[${config.hash}].css`,
            }),
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              openAnalyzer: false,
              logLevel: 'error',
              ...config.analyze,
            }),
          ],
      config.webpack?.plugins ?? [],
    ),
    optimization: {
      ...config.webpack?.optimization,
      minimize: !isDev,
      minimizer: [
        new TerserPlugin({
          exclude: /node_modules/,
          terserOptions: {
            format: {
              comments: false,
            },
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
          },
          ...config.terser,
        }),
        new CssMinimizerPlugin(config.cssMinimizer),
        ...(config.webpack?.optimization?.minimizer ?? []),
      ],
      splitChunks: {
        chunks: 'all',
        ...config.optimization?.splitChunks,
        cacheGroups: {
          react: {
            name: 'react',
            priority: 10,
            test: /node_modules\/(react|react-dom|scheduler)/,
          },
          vendors: {
            name: 'vendors',
            test: /node_modules/,
          },
          ...config.optimization?.splitChunks?.cacheGroups,
        },
      },
    },
    performance: {
      hints: false,
      ...config.webpack?.performance,
    },
    stats: 'none',
    infrastructureLogging: {
      ...config.webpack?.infrastructureLogging,
      level: 'none',
    },
    cache: {
      type: 'filesystem',
      allowCollectingMemory: true,
      cacheDirectory: getCacheDirectory('webpack'),
      ...config.webpack?.cache,
    },
    snapshot: {
      managedPaths: [getModulePath(), getAppPath('node_modules')],
      ...config.webpack?.snapshot,
    },
  }
}

module.exports = getWebpackConfig
