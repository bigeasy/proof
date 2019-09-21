require('../..')(21, function (okay) {
    const ansi = require('../../ansi')
    okay(ansi.color('hello :: world ::'), 'hello : world :', 'escape')
    okay(ansi.color('hello :pass:. :fail:. world'), 'hello \u2713 \u2718 world', 'icon')
    okay(ansi.color('hello :red:hello :: world:. world'), 'hello \u001b[31mhello : world\u001b[0m world', 'color')
    okay(ansi.color(':overwrite:.hello world'), '\u001b[0Ghello world', 'overwrite')
    okay(ansi.color(':red:hello world:.::'), '\u001b[31mhello world\u001B[0m:', 'ambiguity')
    okay(ansi.color(':red:.'), ':red:.', 'missing value')
    okay(ansi.color(':mauve:hello world:.'), ':mauve:hello world:.', 'false match')
    okay(ansi.monochrome('hello :: world ::'), 'hello : world :', 'escape')
    okay(ansi.monochrome('hello :pass:. :fail:. world'), 'hello \u2713 \u2718 world', 'icon')
    okay(ansi.monochrome('hello :red:hello :: world:. world'), 'hello hello : world world', 'color')
    okay(ansi.monochrome(':overwrite:.hello world'), 'hello world', 'overwrite')
    okay(ansi.monochrome(':red:hello world:.::'), 'hello world:', 'ambiguity')
    okay(ansi.monochrome(':red:.'), ':red:.', 'missing value')
    okay(ansi.monochrome(':mauve:hello world:.'), ':mauve:hello world:.', 'false match')
    okay(ansi.ascii('hello :: world ::'), 'hello : world :', 'escape')
    okay(ansi.ascii('hello :pass:. :fail:. world'), 'hello + x world', 'icon')
    okay(ansi.ascii('hello :red:hello :: world:. world'), 'hello hello : world world', 'color')
    okay(ansi.ascii(':overwrite:.hello world'), 'hello world', 'overwrite')
    okay(ansi.ascii(':red:hello world:.::'), 'hello world:', 'ambiguity')
    okay(ansi.ascii(':red:.'), ':red:.', 'missing value')
    okay(ansi.ascii(':mauve:hello world:.'), ':mauve:hello world:.', 'false match')
})
