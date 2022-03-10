/* vim: set ai sw=2 et terse: */

const tagPattern = /\{\{\{([^{}]*)\}\}\}|\{\{([^{}]*)\}\}/gm

const op = {
  write: 0,
  print: 1,
  quote: 2,
  not: 3,
  section: 4,
  partial: 5
}

function tags (input) {
  const result = []
  let inputString = input
  if (!inputString) {
    return result
  }
  if (typeof input !== 'string') {
    inputString = input.toString()
  }
  let match
  let last = 0
  do {
    match = tagPattern.exec(inputString)
    if (!match) {
      break
    }
    if (last < match.index) {
      result.push([op.write, inputString.substring(last, match.index)])
    }
    if (match[1]) {
      result.push([op.print, match[1]])
    } else {
      result.push([op.quote, match[2]])
    }
    last = match.index + match[0].length
  } while (match)
  if (last < inputString.length) {
    result.push([op.write, inputString.substring(last)])
  }
  return result
}

const foldPattern = /^\s*([!#^/&>=])\s*/m

function fold (result) {
  const stack = []
  let index = 0
  while (index < result.length) {
    if (result[index][0] === op.write) {
      index++
      continue
    }
    let match = foldPattern.exec(result[index][1])
    switch (match && match[1]) {
      case '!':
        result.splice(index, 1)
        break
      case '#':
      case '^':
        stack.push(index++)
        break
      case '/': {
        const begin = stack.pop()
        const close = match.input.substring(match[0].length)
        if (begin === undefined) {
          throw new Error('unmatched closing section ' + close)
        }
        match = foldPattern.exec(result[begin][1])
        const start = match.input.substring(match[0].length)
        if (start !== close) {
          throw new Error('unmatched closing section ' + close + ' expected ' + start)
        }
        const block = result.splice(begin, index - begin).slice(1)
        result[begin] = [match[1] === '^' ? op.not : op.section, start, block]
        index = begin + 1
        break
      }
      case '&':
        result[index++] = [op.print, match.input.substring(match[0].length)]
        break
      case '>':
        result[index++] = [op.partial, match.input.substring(match[0].length)]
        break
      case '=':
        throw new Error('setting delimiter not supported')
      default:
        index++
        break
    }
  }
  return result
}

module.exports = function parse (input) {
  return fold(tags(input))
}
