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
    t.equal(stdout.replace(/\s/gm, ''), '[[0,"prefix"],[2,"path.leaf"],[0,"suffix\\nnewline\\n"]]')
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
    t.match(stderr, /invalid step: \?/)
    t.end()
  })
})
