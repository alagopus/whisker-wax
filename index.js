/* vim: set ai sw=2 et terse: */

process.stdin.setEncoding('utf8')
process.stdin.resume()

var inputString = ''

process.stdin.on('data', function (chunk) {
  inputString += chunk
})

process.stdin.on('end', function () {
  let parser = require('./lib/parser')
  let result = parser(inputString)
  process.stdout.write(JSON.stringify(result, null, 2))
})
