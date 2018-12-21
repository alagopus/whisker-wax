/* vim: set ai sw=2 et terse: */

const path = require('path')
const { test } = require('tap')
const childProcess = require('child_process')

function exec (command, callback) {
  return childProcess.exec(path.join('bin', command), callback)
}

test('wax usage', t => {
  exec('wax', (err, stdout, stderr) => {
    t.notEqual(err, null)
    t.equal(stderr.indexOf('usage'), 0)
    t.end()
  })
})

test('wax simple template', t => {
  exec('wax test/_files/simple.mustache', (err, stdout, stderr) => {
    t.equal(err, null)
    t.equal(stdout, '[\n  [\n    "write",\n    "prefix "\n  ],\n' +
      '  [\n    "quote",\n    "path.leaf"\n  ],\n' +
      '  [\n    "write",\n    " suffix\\nnew line\\n"\n  ]\n]')
    t.end()
  })
})

test('wax empty input', t => {
  exec('wax test/_files/simple.mustache test/_files/empty.input', (err, stdout, stderr) => {
    t.equal(err, null)
    t.equal(stdout, 'prefix  suffix\nnew line\n')
    t.end()
  })
})

test('wax simple input', t => {
  exec('wax test/_files/simple.mustache test/_files/simple.input1', (err, stdout, stderr) => {
    t.equal(err, null)
    t.equal(stdout, 'prefix path-leaf suffix\nnew line\n')
    t.end()
  })
})

test('wax quoted input', t => {
  exec('wax test/_files/simple.mustache test/_files/simple.input2', (err, stdout, stderr) => {
    t.equal(err, null)
    t.equal(stdout, 'prefix &lt;tag&amp;leaf&gt;att&#61;&#96;ri&quot;ut&#39;&lt;/tag&gt; suffix\nnew line\n')
    t.end()
  })
})

test('wax unquoted input', t => {
  exec('wax test/_files/unquote.mustache test/_files/simple.input2', (err, stdout, stderr) => {
    t.equal(err, null)
    t.equal(stdout, 'prefix <tag&leaf>att=`ri"ut\'</tag> suffix\nnew line\n')
    t.end()
  })
})

test('wax non-false section', t => {
  exec('wax test/_files/non_false.mustache test/_files/non_false.input', (err, stdout, stderr) => {
    t.equal(err, null)
    t.equal(stdout, '\n  Hi Jon!\n\n')
    t.end()
  })
})

test('wax non-empty list', t => {
  exec('wax test/_files/non_empty_lists.mustache test/_files/non_empty_lists.input', (err, stdout, stderr) => {
    t.equal(err, null)
    t.equal(stdout, '\n  <b>resque</b>\n\n  <b>hub</b>\n\n  <b>rip</b>\n\n')
    t.end()
  })
})
