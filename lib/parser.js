/* vim: set ai sw=2 et terse: */

const tagPattern = /\{\{\{([^{}]*)\}\}\}|\{\{([^{}]*)\}\}/gm

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
      result.push(['w', inputString.substring(last, match.index)])
    }
    if (match[1]) {
      result.push(['p', match[1]])
    } else {
      result.push(['q', match[2]])
    }
    last = match.index + match[0].length
  } while (match)
  if (last < inputString.length) {
    result.push(['w', inputString.substring(last)])
  }
  return result
}

const foldPattern = /^\s*([!#^/&>=])\s*/m

function fold (result) {
  const stack = []
  let index = 0
  while (index < result.length) {
    if (result[index][0] === 'w') {
      index++
      continue
    }
    let match = foldPattern.exec(result[index][1])
    switch (match && match[1]) {
      default:
        index++
        break
      case '!':
        result.splice(index, 1)
        break
      case '#':
      case '^':
        stack.push(index++)
        break
      case '/':
        let begin = stack.pop()
        let close = match.input.substring(match[0].length)
        if (begin === undefined) {
          throw new Error('unmatched closing section ' + close)
        }
        match = foldPattern.exec(result[begin][1])
        let start = match.input.substring(match[0].length)
        if (start !== close) {
          throw new Error('unmatched closing section ' + close + ' expected ' + start)
        }
        let block = result.splice(begin, index - begin).slice(1)
        result[begin] = [ match[1] === '^' ? 'n' : 's', start, block ]
        index = begin + 1
        break
      case '&':
        result[index++] = [ 'p', match.input.substring(match[0].length) ]
        break
      case '>':
        result[index++] = [ 'c', match.input.substring(match[0].length) ]
        break
      case '=':
        throw new Error('setting delimiter not supported')
    }
  }
  return result
}

module.exports = function parse (input) {
  return fold(tags(input))
}
