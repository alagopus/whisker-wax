/* vim: set ai sw=2 et terse: */

function section (input, block) {
  const items = this.value(input)
  if (!items) return
  if (typeof items.forEach !== 'function') {
    this.run(block, items)
  } else {
    items.forEach(function (context) { this.run(block, context) }, this)
  }
}

function partial (path) {
  const result = typeof this.resolver === 'function' && this.resolver(path)
  if (result) this.run(result.template, result.context, result.resolver)
}

function unless (input, block) {
  if (!this.value(input)) this.run(block)
}

const engine = [
  /* write */ function (input) { this.write(input) },
  /* print */ function (input) { this.write(this.value(input)) },
  /* quote */ function (input) { this.write(this.quote(this.value(input))) },
  unless,
  section,
  partial
]

function step (params) {
  const func = engine[params[0]]
  if (func) func.apply(this, params.slice(1))
  else throw new Error('invalid step: ' + params[0])
}

function next (scan, name) {
  return scan ? scan[name] : ''
}

function none (value) {
  return value === undefined || value === null || value === ''
}

function fetch (path) {
  let result
  let index = this.stack.length
  while (--index >= 0 && none(result)) {
    const frame = this.stack[index]
    result = path === '.' ? frame : path.split('.').reduce(next, frame)
  }
  return result
}

module.exports = Runner

function Runner (writer) {
  this.stack = []
  this.write = function (input) { writer.write(input) }
}

/** run template with context and resolver */
Runner.prototype.run = function run (template, context, resolver) {
  const old = this.resolver
  try {
    this.stack.push(context)
    this.resolver = resolver || old
    template.forEach(step, this)
  } finally {
    this.resolver = old
    this.stack.pop()
  }
}

/** resolve path as template and run it */
Runner.prototype.partial = partial

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

/** quote input for HTML and return it */
Runner.prototype.quote = function quote (input) {
  return String(input).replace(/[<&>=`"']/gm, entities.quote)
}

/** evaluate input and return its value */
Runner.prototype.value = function value (input) {
  const params = input.split(/\s+/gm).filter(function (s) { return s })
  let result = fetch.call(this, params[0])
  if (result && typeof result.apply === 'function') {
    result = result.apply(this, params.slice(1))
  }
  return none(result) ? '' : result
}
