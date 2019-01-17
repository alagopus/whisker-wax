/* vim: set ai sw=2 et terse: */

const spaces = /\s+/gm

const entities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;',
  '=': '&#61;',
  '`': '&#96;',
  quote: function (special) { return entities[special] }
}

module.exports = Runner

function Runner (writer) {
  this.stack = []
  this.write = function (input) { writer.write(input) }
}

Runner.prototype.run = function run (template, context, resolver) {
  let old = this.resolver
  try {
    this.stack.push(context)
    this.resolver = resolver || old
    template.forEach(this.step, this)
  } finally {
    this.resolver = old
    this.stack.pop()
  }
}

function next (scan, name) { return scan ? scan[name] : '' }
Runner.prototype.fetch = function fetch (path) {
  let result
  let index = this.stack.length
  while (--index >= 0 && !result) {
    const frame = this.stack[index]
    result = path === '.' ? frame : path.split('.').reduce(next, frame)
  }
  return result
}

/** quote input for HTML and return it */
Runner.prototype.quote = function quote (input) {
  return input.replace(/[<&>=`"']/gm, entities.quote)
}

/** evaluate input and return its value */
Runner.prototype.value = function value (input) {
  let params = input.split(spaces).filter(function (s) { return s })
  let result = this.fetch(params[0])
  if (result && typeof result.apply === 'function') {
    result = result.apply(this, params.slice(1))
  }
  return result || ''
}

Runner.prototype.section = function section (items, template) {
  if (!items) return
  if (typeof items.forEach !== 'function') {
    this.run(template, items)
  } else {
    items.forEach(function (context) { this.run(template, context) }, this)
  }
}

/** resolve path as template and run it */
Runner.prototype.partial = function partial (path) {
  let result = typeof this.resolver === 'function' && this.resolver(path)
  if (result) this.run(result.template, result.context, result.resolver)
}

Runner.prototype.engine = [
  function (input) { this.write(input) },
  function (input) { this.write(this.value(input)) },
  function (input) { this.write(this.quote(this.value(input))) },
  function (input, block) { if (!this.value(input)) this.run(block) },
  function (input, block) { this.section(this.value(input), block) },
  function (input) { this.partial(input) }
]

Runner.prototype.step = function step (params) {
  const func = this.engine[params[0]]
  if (func) func.apply(this, params.slice(1))
  else throw new Error('invalid step: ' + params[0])
}
