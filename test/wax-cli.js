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
    t.equal(stdout, '[\n  [\n    "w",\n    "prefix "\n  ],\n' +
      '  [\n    "q",\n    "path.leaf"\n  ],\n' +
      '  [\n    "w",\n    " suffix\\nnew line\\n"\n  ]\n]')
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

test('wax false section', t => {
  exec('wax test/_files/false.mustache test/_files/false.input', (err, stdout, stderr) => {
    t.equal(err, null)
    t.equal(stdout, 'no person\n\n')
    t.end()
  })
})

test('wax undefined list', t => {
  exec('wax test/_files/non_empty_lists.mustache test/_files/empty.input', (err, stdout, stderr) => {
    t.equal(err, null)
    t.equal(stdout, '\n')
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

test('wax lambda list', t => {
  exec('wax test/_files/non_empty_lists.mustache ../test/_files/lambda_list.js', (err, stdout, stderr) => {
    t.equal(err, null)
    t.equal(stdout, '\n  <b>1</b>\n\n  <b>2</b>\n\n  <b>3</b>\n\n  <b>4</b>\n\n  <b>5</b>\n\n')
    t.end()
  })
})

test('wax parent context', t => {
  exec('wax test/_files/parent_context.mustache test/_files/parent_context.input', (err, stdout, stderr) => {
    t.equal(err, null)
    t.equal(stdout, '<dl>\n\n  <dt>parent</dt>\n  <dd>resque</dd>\n\n  <dt>parent</dt>\n  <dd>hub</dd>\n\n  <dt>parent</dt>\n  <dd>rip</dd>\n\n</dl>\n')
    t.end()
  })
})

test('wax partial template', t => {
  exec('wax test/_files/simple_partial.mustache test/_files/simple.input1', (err, stdout, stderr) => {
    t.equal(err, null)
    t.equal(stdout, 'outer\nprefix path-leaf suffix\nnew line\n\nbracket\n')
    t.end()
  })
})

test('wax compiled partial', t => {
  exec('wax test/_files/compiled_partial.mustache test/_files/simple.input1', (err, stdout, stderr) => {
    t.equal(err, null)
    t.equal(stdout, 'outer\ncompiled prefix path-leaf suffix compiled\n\nbracket\n')
    t.end()
  })
})

test('wax subdir partial', t => {
  exec('wax test/_files/subdir_partial.mustache test/_files/simple.input1', (err, stdout, stderr) => {
    t.equal(err, null)
    t.equal(stdout, 'root head\nmiddle head\nprefix path-leaf suffix\n\nmiddle foot\n\nroot foot\n')
    t.end()
  })
})

test('wax bogus partial', t => {
  exec('wax test/_files/bogus_partial.mustache test/_files/simple.input1', (err, stdout, stderr) => {
    t.match(err, { code: 1 })
    t.ok(/invalid step: \?/.test(stderr))
    t.end()
  })
})
