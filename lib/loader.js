'use strict'

const parse = require('./parser')

function compile (template, runner) {
  template.forEach(item => {
    if (item[0] === 5) { // partial
      this.resolve(this.context, item[1], (fail, path) => fail ? console.error(fail) : this.addDependency(item[1]))
    }
  })
  const code = JSON.stringify(template).replace(/\p{space}/gu, uquote)
  return `module.exports = require(${JSON.stringify(runner)}).create(${code}, req => require(\`\${req}\`));`
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

function uquote (char) {
  const code = char.codePointAt(0)
  if (code <= 0x80) return char
  const hex = code.toString(16).substring(0, 4)
  return '\\u0000'.substring(0, 6 - hex.length) + hex
}

module.exports = loader
