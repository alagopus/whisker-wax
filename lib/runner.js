/* vim: set ai sw=2 et terse: */

function resolve (path) {
  return path === '.' ? this : path.split('.').reduce((scan, name) => scan ? scan[name] : '', this)
}

const spaces = /\s+/gm

function value (input) {
  let params = input.split(spaces).filter(s => !!s)
  let result = resolve.call(this, params[0])
  if (typeof result === 'function') {
    result = result.apply(this, params.slice(1))
  }
  return String(result || '')
}

const entities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;',
  '=': '&#61;',
  '`': '&#96;'
}

function quote (input) {
  return value.call(this, input).replace(/[<&>=`"']/gm, special => entities[special])
}

const engine = {
  print: value,
  quote: quote,
  write: input => input
}

function exec (writer, params) {
  let step = engine[params[0]]
  if (step) writer.write(step.call(this, params[1]))
}

module.exports = function runner (writer, template, context) {
  template.forEach(step => exec.call(context, writer, step))
}
