/* vim: set ai sw=2 et terse: */

const { test } = require('tap')
const parser = require('../lib/parser')

test('parse plain input', t => {
  let result = parser('12345')
  t.same(result, [ [ 'write', '12345' ] ])
  t.end()
})

test('parse embedded tag', t => {
  let result = parser('prefix string. {{tag.with.path}} suffix string.')
  t.same(result, [ [ 'write', 'prefix string. ' ], [ 'quote', [ 'tag.with.path' ] ], [ 'write', ' suffix string.' ] ])
  t.end()
})
