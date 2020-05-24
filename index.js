/* vim: set ai sw=2 et terse: */

Object.defineProperties(exports, {
  loader: { get: require.resolve.bind(null, './lib/loader') },
  parser: { get: module.require.bind(module, './lib/parser') },
  runner: { get: module.require.bind(module, './lib/runner') }
})
