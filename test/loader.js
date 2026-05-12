/* vim: set ai sw=2 et terse: */

const fs = require('fs')
const { test } = require('tap')
const loader = require('../lib/loader')

function TestLoaderContext (context) {
  this.buildDependencies = new Set()
  this.context = context ?? ''
  this.data = {}
  this.mode = 'production'
}

TestLoaderContext.prototype.cacheable = function (flag) {
  this.isCacheable = !!flag
  return this.isCacheable
}

TestLoaderContext.prototype.addDependency = function (request) {
  this.buildDependencies.add(request)
}

TestLoaderContext.prototype.clearDependencies = function () {
  this.buildDependencies.clear()
}

TestLoaderContext.prototype.getDependencies = function () {
  return Array.from(this.buildDependencies)
}

TestLoaderContext.prototype.loadCode = function load (path) {
  return fs.readFileSync(path, { encoding: 'utf8' })
}

TestLoaderContext.prototype.render = function (template, resolver, context) {
  const output = template(context)
  console.debug('TestLoaderContext output', output)
  return output
}

TestLoaderContext.prototype.readData = function readData (path) {
  return JSON.parse(fs.readFileSync(path))
}

TestLoaderContext.prototype.runCode = function (code) {
  // eslint-disable-next-line no-new-func
  const capsule = new Function('module', 'require', `${code}; return module.exports`)
  const exports = capsule({}, this.require.bind(this))
  return exports
}

TestLoaderContext.prototype.require = function (request) {
  const path = this.resolve('', request)
  if (path.startsWith('test/')) {
    const code = this.loadCode(path)
    const template = loader.call(this, code)
    return this.runCode(template)
  } else {
    return require(path)
  }
}

TestLoaderContext.prototype.resolve = function (prefix, request, callback) {
  try {
    const path = request.replace(/^\.\//, prefix || 'test/_files/')
    if (this.mustThrow && !fs.existsSync(path)) throw new Error()
    if (callback) callback(null, path)
    return path
  } catch (fail) {
    if (callback) callback(fail, null)
  }
}

TestLoaderContext.prototype.setMustThrow = function (flag) {
  this.mustThrow = flag
}

test('fail in compile', t => {
  t.throws(function () {
    const ctx = new TestLoaderContext()
    ctx.setMustThrow(true)
    const loaded = loader.call(ctx, ' head«{{>nixda}}»foot\u0085')
    const template = ctx.runCode(loaded)
    ctx.render(template, null, {})
  })
  t.end()
})

test('fail in render', t => {
  t.throws(function () {
    const ctx = new TestLoaderContext()
    const loaded = loader.call(ctx, ' head«{{>wurscht}}»foot\u0085')
    const template = ctx.runCode(loaded)
    ctx.render(template, null, {})
  })
  t.end()
})

test('load partial template', t => {
  const ctx = new TestLoaderContext()
  const code = ctx.loadCode('test/_files/simple_partial.mustache')
  const data = ctx.readData('test/_files/simple.input1')
  const loaded = loader.call(ctx, code)
  const template = ctx.runCode(loaded)
  const result = ctx.render(template, null, data)
  t.equal(result, 'outer\nprefix path-leaf suffix\nnew line\n\nbracket\n')
  t.end()
})
