require('../..')(5, function (okay) {
    const ansi = require('../../ansi')
    okay(ansi('hello %% world %%'), 'hello % world %', 'escape')
    okay(ansi('hello %{red}hello %% world%. world'), 'hello \u001b[31mhello % world\u001b[0m world', 'color')
    okay(ansi('%{overwrite}%.hello world'), '\u001b[0Ghello world', 'overwrite')
    okay(ansi('%{red}hello world%.%%'), '\u001b[31mhello world\u001b[0m%', 'ambiguity')
    okay(ansi('%{mauve}hello world%.'), '%{mauve}hello world%.', 'false match')
})
