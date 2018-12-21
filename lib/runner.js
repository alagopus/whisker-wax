/* vim: set ai sw=2 et terse: */

function resolve (path) {
  return path === '.' ? this : path.split('.').reduce((scan, name) => scan ? scan[name] : '', this)
}

const spaces = /\s+/gm

function value (input) {
  let params = input.split(spaces).filter(s => !!s)
  let result = resolve.call(this, params[0])
  if (result && typeof result.apply === 'function') {
    result = result.apply(this, params.slice(1))
  }
  return result || ''
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

const engine = {
  map: map,
  not: not,
  print: value,
  quote: quote,
  write: input => input
}

function step (params) {
  let func = engine[params[0]]
  return !func ? '' : func.apply(this, params.slice(1))
}

function each (template) {
  return template.map(params => step.call(this, params)).filter(x => x).join('')
}

function map (input, block) {
  let items = value.call(this, input)
  if (!items) return
  if (typeof items.map !== 'function') {
    items = [items]
  }
  return items.map(item => each.call(item, block)).filter(x => x).join('')
}

function not (input, block) {
  let pivot = value.call(this, input)
  if (!pivot) return each.call(this, block)
}

function quote (input) {
  return value.call(this, input).replace(/[<&>=`"']/gm, special => entities[special])
}

module.exports = function runner (writer, template, context) {
  template.forEach(params => writer.write(step.call(context, params) || ''))
}
