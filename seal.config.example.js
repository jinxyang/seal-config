module.exports = {
  port: 0,
  // for @babel/preset-env
  targets: {},
  title: '',
  srcDir: '',
  distDir: '',
  // for webpack.entry (in srcDir)
  input: '',
  // for webpack.output.path (in distDir)
  output: '',
  // for webpack.output.publicPath
  publicPath: '',
  // production filename hash
  // https://webpack.js.org/configuration/output/#template-strings
  hash: '',
  // for webpack.devtool (prodSourceMap for production)
  sourceMap: '',
  // options for html-webpack-plugin
  html: {},
  // modules (out of project without bundle)
  alias: {},
  // options for copy-webpack-plugin
  copy: {},
  // options for babel
  babel: {},
  // options for css-loader
  css: {},
  // options for style-loader
  style: {},
  // options for multiple createProxyMiddleware of http-proxy-middleware
  // { [path]: options }
  proxy: {},
  // options for webpack-dev-middleware
  dev: {},
  // options for webpack-hot-middleware (middleware && client mixed)
  hot: {},
  // options for @soda/friendly-errors-webpack-plugin (prodFriendly for bundle)
  friendly: {},
  // options for webpack-bundle-analyzer
  analyze: {},
  // other configuration for webpack
  webpack: {},
  // options for connect-history-api-fallback
  history: {},
}
