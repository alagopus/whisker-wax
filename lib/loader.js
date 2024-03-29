'use strict'

const parse = require('./parser')
const Runner = require('./runner')

function compile (template, runner) {
  template.forEach(item => {
    if (item[0] === 5) { // partial
      this.addDependency(this.resolve(this.context, item[1]))
    }
  })
  const code = JSON.stringify(template).replace(/\p{space}/gu, uquote)
  return [
    'var Runner = require(' + JSON.stringify(runner) + ');',
    'var template = ' + code + ';',
    executor.toString(),
    resolver.toString(),
    'module.exports = executor(template);'
  ].join('\n')
}

function executor (template) {
  const result = function (context) {
    let buffer = ''
    const runner = new Runner({ write: function (chunk) { buffer += chunk } })
    runner.run(template, context, resolver)
    return buffer
  }
  result.template = template
  return result
}

/**
 * Loader function to resolve whisker-wax templates to a  module function.
 * This can be used together with html-loader:
 *
 *     module.exports = {
 *       module: {
 *         rules: [
 *           {
 *             test: /\.wax$/i,
 *             loader: require('whisker-wax').loader
 *           }
 *         ]
 *       }
 *     }
 *
 */
function loader (input) {
  if (this.cacheable) this.cacheable(true)
  if (this.mode === 'production') input = input.replace(/\n\s+/g, '\n')
  const runner = require.resolve('./runner')
  this.addDependency(runner)
  const result = compile.call(this, parse(input), runner)
  return result
}

function resolver (filename) {
  return {
    resolver: resolver,
    context: { $filename: filename },
    template: require(`./${filename}`).template
  }
}

function uquote (char) {
  const code = char.codePointAt(0)
  if (code <= 0x80) return char
  const hex = code.toString(16).substring(0, 4)
  return '\\u0000'.substring(0, 6 - hex.length) + hex
}

module.exports = loader
