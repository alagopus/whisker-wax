/* vim: set ai sw=2 et terse: */

const { test } = require('tap')
const parser = require('../lib/parser')

test('parse empty input', t => {
  t.same(parser(), [])
  t.same(parser(''), [])
  t.end()
})

test('parse plain input', t => {
  t.same(parser('12345'), [[0, '12345']])
  t.same(parser('12345{{! comments are dropped }}'), [[0, '12345']])
  t.end()
})

test('parse embedded tag', t => {
  const result = parser('prefix string. {{tag.with.path}} suffix string.')
  t.same(result, [[0, 'prefix string. '], [2, 'tag.with.path'], [0, ' suffix string.']])
  t.end()
})

test('parse unquoted tag', t => {
  const expect = [[0, 'prefix string. '], [1, 'tag.with.path']]
  t.same(parser('prefix string. {{{tag.with.path}}}'), expect)
  t.same(parser('prefix string. {{&tag.with.path}}'), expect)
  t.end()
})

test('parse error for unclosed section', t => {
  t.throws(function () {
    parser('prefix string. invalid{{/unopened}} suffix string.')
  })
  t.throws(function () {
    parser('prefix string. {{#begin}}invalid{{/nigeb}} suffix string.')
  })
  t.end()
})

test('parse error setting delimiter', t => {
  t.throws(function () {
    parser('{{{=<% %>=}}prefix string. <%&tag.with.path%> suffix string.')
  })
  t.end()
})
