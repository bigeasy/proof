function format (line, delimiter, width, options) {
    let length = line.length
    const replaced = line.replace(/::|:(\w+)(?::\.|:((?:[^:]*|::)+):\.)/g, function (match, name, value) {
        length -= match.length
        if (match == '::') {
            length++
            return ':'
        }
        switch (name) {
        case 'overwrite':
            return options.overwrite
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
        return replaced
    }
    const fill = Array(width - length).fill(split[1]).join('')
    return `${split[0]}${fill}${split[2]}`
}

exports.ascii = function (line, delimiter, width) {
    return format(line, delimiter, width, {
        overwrite: '',
        color: { red: '', green: '' },
        reset: '',
        icon: { pass: '+', fail: 'x' }
    })
}

exports.monochrome = function (line, delimiter, width) {
    return format(line, delimiter, width, {
        overwrite: '',
        color: { red: '', green: '' },
        reset: '',
        icon: { pass: '\u2713', fail: '\u2718' }
    })
}

exports.color = function (line, delimiter, width) {
    return format(line, delimiter, width, {
        overwrite: '\u001b[0G',
        color: { red: '\u001B[31m', green: '\u001B[32m' },
        reset: '\u001b[0m',
        icon: { pass: '\u001b[32m\u2713\u001b[0m', fail: '\u001b[31m\u2718\u001b[0m' }
    })
}
