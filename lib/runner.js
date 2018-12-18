/* vim: set ai sw=2 et terse: */

const splitParam = /\s+/gm

function exec (writer, step, context) {
  let result
  switch (step[0]) {
    case 'print':
      result = value(split(step[1]), context)
      break
    case 'quote':
      result = quote(value(split(step[1]), context))
      break
    case 'write':
      result = step[1]
      break
    default:
      return
  }
  print(writer, result)
}

function print (writer, text) {
  writer.write(text)
}

function quote (text) {
  if (typeof text !== 'string') {
    text = String(text)
  }
  return text.replace(/[<&>]/gm, special => {
    switch (special) {
      case '<':
        return '&lt;'
      case '&':
        return '&amp;'
      case '>':
        return '&gt;'
    }
  })
}

function split (input) {
  return input.split(splitParam).filter(s => !!s)
}

function value (params, context) {
  let results = []
  params.every((item, index) => {
    let result = item.split('.').reduce((scan, name) => {
      if (name === '.') return scan
      if (scan) return scan[name]
    }, context)
    if (typeof result === 'function') {
      results.push(result.apply(context, params.slice(index + 1)))
      return false
    } else {
      results.push(result)
    }
    return true
  })
  return results
}

module.exports = function runner (writer, template, context) {
  template.forEach(step => exec(writer, step, context))
}
