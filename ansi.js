function format (line, options) {
    return line.replace(/::|:(\w+)(?::\.|:((?:[^:]*|::)+):\.)/g, function (match, name, value) {
        if (match == '::') {
            return ':'
        }
        switch (name) {
        case 'overwrite':
            return options.overwrite
        case 'pass':
        case 'fail':
            return options.icon[name]
        default:
            if ((name in options.color) && value) {
                return `${options.color[name]}${value.replace(/::/g, ':')}${options.reset}`
            }
        }
        return match
    })
}

exports.ascii = function (line) {
    return format(line, {
        overwrite: '',
        color: { red: '', green: '' },
        reset: '',
        icon: { pass: '+', fail: 'x' }
    })
}

exports.monochrome = function (line) {
    return format(line, {
        overwrite: '',
        color: { red: '', green: '' },
        reset: '',
        icon: { pass: '\u2713', fail: '\u2718' }
    })
}

exports.color = function (line) {
    return format(line, {
        overwrite: '\u001b[0G',
        color: { red: '\u001B[31m', green: '\u001B[32m' },
        reset: '\u001b[0m',
        icon: { pass: '\u001b[32m\u2713\u001b[0m', fail: '\u001b[31m\u2718\u001b[0m' }
    })
}
