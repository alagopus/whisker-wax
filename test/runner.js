/* vim: set ai sw=2 et terse: */

const { test } = require('tap')
const parser = require('../lib/parser')
const Runner = require('../lib/runner')

test('run without resolver', t => {
  let template = parser('head{{>wurscht}}foot')
  let buffer = ''
  let runner = new Runner({ write: function (chunk) { buffer += chunk } })
  runner.run(template, {})
  t.equal(buffer, 'headfoot')
  t.end()
})
