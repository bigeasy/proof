require('../..')(6, function (okay) {
    const ansi = require('../../ansi')
    okay(ansi.color('hello :: world ::'), 'hello : world :', 'escape')
    okay(ansi.color('hello :red:hello :: world:. world'), 'hello \u001b[31mhello : world\u001b[0m world', 'color')
    okay(ansi.color(':overwrite:.hello world'), '\u001b[0Ghello world', 'overwrite')
    okay(ansi.color(':red:hello world:.::'), '\u001b[31mhello world\u001b[0m:', 'ambiguity')
    okay(ansi.color(':red:.'), ':red:.', 'missing value')
    okay(ansi.color(':mauve:hello world:.'), ':mauve:hello world:.', 'false match')
})
