function format (line, delimiter, width, options, terminator) {
    let length = line.length
    const start = Date.now()
    const replaced = line.replace(/::|:(\w+)(?::((?:::|[^:])+):\.|:\.)/g, function (match, name, value) {
        length -= match.length
        if (match == '::') {
            length++
            return ':'
        }
        switch (name) {
        case 'pass':
        case 'fail':
            length++
            return options.icon[name]
        case 'pad':
            return `${delimiter}${value}${delimiter}`
        default:
            if ((name in options.color) && value) {
                const escaped = value.replace(/::/g, ':')
                length += escaped.length
                return `${options.color[name]}${escaped}${options.reset}`
            }
        }
        length += match.length
        return match
    })
    const split = replaced.split(delimiter)
    if (split.length == 1) {
        return `${replaced}${terminator}`
    }
    const fill = Array(width - length).fill(split[1]).join('')
    return `${split[0]}${fill}${split[2]}${terminator}`
}

class Formatter {
    constructor (options) {
        this._delimiter = options.delimiter
        this._width = options.width
        this._color = options.color
        this._width = options.width
        this._progress = options.progress ? '\u001b[0G' : ''
        this._options = options.color ? {
            overwrite: '\u001b[0G',
            color: { red: '\u001b[31m', green: '\u001b[32m' },
            reset: '\u001b[0m',
            icon: { pass: '\u001b[32m\u2713\u001b[0m', fail: '\u001b[31m\u2718\u001b[0m' }
        } : {
            overwrite: '',
            color: { red: '', green: '' },
            reset: '',
            icon: { pass: '\u2713', fail: '\u2718' }
        }
    }

    progress (line) {
        if (this._progress) {
            return format(line, this._delimiter, this._width, this._options, this._progress)
        }
        return ''
    }

    write (line) {
        return format(line, this._delimiter, this._width, this._options, '\n')
    }
}

module.exports = Formatter
