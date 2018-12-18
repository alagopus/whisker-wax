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
    t.equal(stdout, '[\n  [\n    "write",\n    "prefix "\n  ],\n'
    +'  [\n    "quote",\n    "path.leaf"\n  ],\n'
    +'  [\n    "write",\n    " suffix\\nnew line\\n"\n  ]\n]')
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
