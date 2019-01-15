/* vim: set ai sw=2 et terse: */

const spaces = /\s+/gm

const entities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;',
  '=': '&#61;',
  '`': '&#96;'
}

module.exports = Runner

function Runner (writer, context) {
  this.stack = [context]
  this.write = input => writer.write(input)
}

Runner.prototype.run = function run (template) {
  template.forEach(this.step, this)
}

Runner.prototype.fetch = function fetch (path) {
  let result
  let index = this.stack.length
  while (--index >= 0 && result === undefined) {
    let frame = this.stack[index]
    result = path === '.' ? frame : path.split('.').reduce((scan, name) => scan ? scan[name] : '', frame)
  }
  return result
}

Runner.prototype.quote = function quote (input) {
  return this.value(input).replace(/[<&>=`"']/gm, special => entities[special])
}

Runner.prototype.value = function value (input) {
  let params = input.split(spaces).filter(s => !!s)
  let result = this.fetch(params[0])
  if (result && typeof result.apply === 'function') {
    result = result.apply(this, params.slice(1))
  }
  return result || ''
}

Runner.prototype.step = function step (params) {
  switch (params[0]) {
    case 'w':
      this.write(params[1])
      break
    case 'q':
      this.write(this.quote(params[1]))
      break
    case 'p':
      this.write(this.value(params[1]))
      break
    case 'n':
      if (!this.value(params[1])) this.run(params[2])
      break
    case 's': {
      let items = this.value(params[1])
      if (!items) break
      if (typeof items.forEach !== 'function') {
        items = [items]
      }
      let template = params[2]
      items.forEach(item => {
        try {
          this.stack.push(item)
          this.run(template)
        } finally {
          this.stack.pop()
        }
      })
      break
    }
    default:
      throw new Error('invalid step: ' + params[0])
  }
}
