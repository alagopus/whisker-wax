/* vim: set ai sw=2 et terse: */

const tagPattern = /\{\{\{([\s\S]*?)\}\}\}|\{\{([\s\S]*?)\}\}/gm

module.exports = function parse (input) {
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
      result.push(['write', inputString.substring(last, match.index - last)])
    }
    if (match[1]) {
      result.push(['print', match[1]])
    } else if (match[2]) {
      result.push(['quote', match[2]])
    }
    last = match.index + match[0].length
  } while (match)
  if (last < inputString.length) {
    result.push(['write', inputString.substring(last)])
  }
  return result
}
