require('../..')(16, function (okay) {
    const Formatter = require('../../formatter')
    const color = new Formatter({
        color: true,
        progress: true,
        delimiter: '\u0000',
        width: 12
    })
    okay(color.write('hello :: world ::'), 'hello : world :\n', 'escape')
    okay(color.write('hello :pass:. :fail:. world'), 'hello \u001b[32m\u2713\u001b[0m \u001b[31m\u2718\u001b[0m world\n', 'icon')
    okay(color.write('hello :red:hello :: world:. world'), 'hello \u001b[31mhello : world\u001b[0m world\n', 'color')
    okay(color.progress('hello world'), 'hello world\u001b[0G', 'progress')
    okay(color.write(':red:hello world:.::'), '\u001b[31mhello world\u001b[0m:\n', 'ambiguity')
    okay(color.write(':red:.'), ':red:.\n', 'missing value')
    okay(color.write(':mauve:hello world:.'), ':mauve:hello world:.\n', 'false match')
    okay(color.write(':red:hello:. :pad:.:. ::'), '\u001b[31mhello\u001b[0m .... :\n', 'pad')
    const monochrome = new Formatter({
        color: false,
        progress: false,
        delimiter: '\u0000',
        width: 12
    })
    okay(monochrome.write('hello :: world ::'), 'hello : world :\n', 'escape')
    okay(monochrome.write('hello :pass:. :fail:. world'), 'hello \u2713 \u2718 world\n', 'icon')
    okay(monochrome.write('hello :red:hello :: world:. world'), 'hello hello : world world\n', 'color')
    okay(monochrome.progress('hello world'), '', 'progress')
    okay(monochrome.write(':red:hello world:.::'), 'hello world:\n', 'ambiguity')
    okay(monochrome.write(':red:.'), ':red:.\n', 'missing value')
    okay(monochrome.write(':mauve:hello world:.'), ':mauve:hello world:.\n', 'false match')
    okay(monochrome.write(':red:hello:. :pad:.:. ::'), 'hello .... :\n', 'pad')
})
