/* vim: set ai sw=2 et terse: */

const fs = require('fs')
const { test } = require('tap')
const parser = require('../lib/parser')
const Runner = require('../lib/runner')

function exec (template, context) {
  let buffer = ''
  const runner = new Runner({ write: function (chunk) { buffer += chunk } })
  runner.run(template, context)
  return buffer
}

function load (path) {
  return parser(fs.readFileSync(path))
}

function read (path) {
  return JSON.parse(fs.readFileSync(path))
}

test('run without resolver', t => {
  const result = exec(parser('head{{>wurscht}}foot'), {})
  t.equal(result, 'headfoot')
  t.end()
})

test('quoted input', t => {
  const result = exec(load('test/_files/simple.mustache'), read('test/_files/simple.input2'))
  t.equal(result, 'prefix &lt;tag&amp;leaf&gt;att&#61;&#96;ri&quot;ut&#39;&lt;/tag&gt; suffix\nnew line\n')
  t.end()
})

test('unquoted input', t => {
  const result = exec(load('test/_files/unquote.mustache'), read('test/_files/simple.input2'))
  t.equal(result, 'prefix <tag&leaf>att=`ri"ut\'</tag> suffix\nnew line\n')
  t.end()
})

test('non-false section', t => {
  const result = exec(load('test/_files/non_false.mustache'), read('test/_files/non_false.input'))
  t.equal(result, '\n  Hi Jon!\n\n')
  t.end()
})

test('false section', t => {
  const result = exec(load('test/_files/false.mustache'), read('test/_files/false.input'))
  t.equal(result, 'no person\n\n')
  t.end()
})

test('undefined list', t => {
  const result = exec(load('test/_files/non_empty_lists.mustache'), read('test/_files/empty.input'))
  t.equal(result, '\n')
  t.end()
})

test('non-empty list', t => {
  const result = exec(load('test/_files/non_empty_lists.mustache'), read('test/_files/non_empty_lists.input'))
  t.equal(result, '\n  <b>resque</b>\n\n  <b>hub</b>\n\n  <b>rip</b>\n\n')
  t.end()
})

test('lambda list', t => {
  const result = exec(load('test/_files/non_empty_lists.mustache'), require('../test/_files/lambda_list.js'))
  t.equal(result, '\n  <b>1</b>\n\n  <b>2</b>\n\n  <b>3</b>\n\n  <b>4</b>\n\n  <b>5</b>\n\n')
  t.end()
})

test('access parent context', t => {
  const result = exec(load('test/_files/parent_context.mustache'), read('test/_files/parent_context.input'))
  t.equal(result, '<dl>\n\n  <dt>parent</dt>\n  <dd>resque</dd>\n\n  <dt>parent</dt>\n  <dd>hub</dd>\n\n  <dt>parent</dt>\n  <dd>rip</dd>\n\n</dl>\n')
  t.end()
})

test('example from readme', t => {
  const result = exec(parser('Hello, {{toupper user.name}}!'), {
    user: { name: 'Jeff' },
    toupper: function (path) {
      this.write(this.value(path).toUpperCase())
    }
  })
  t.equal(result, 'Hello, JEFF!')
  t.end()
})
