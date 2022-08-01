const path = require('path')

const getAppPath = (pathname = '') => {
  return path.isAbsolute(pathname)
    ? pathname
    : path.resolve(process.cwd(), pathname)
}
const getModulePath = (...targets) => {
  return path.resolve(__dirname, '../node_modules', ...targets)
}
const requireModule = (...targets) => {
  return require(getModulePath(...targets))
}

module.exports = {
  getAppPath,
  getModulePath,
  requireModule,
}
