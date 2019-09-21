const COLOR = {
    red: '\u001B[31m',
    green: '\u001B[32m',
    blue: '\u001B[34m',
    gray: '\u001B[38;5;244m'
}

exports.monochrome = function (line) {
    return line.replace(/::|:(\w+)(?::\.|:((?:[^:]*|::)+):\.)/g, function (match, name, value) {
        if (match == '::') {
            return ':'
        }
        if (name == 'overwrite') {
            return ''
        }
        if ((name in COLOR) && value) {
            return value.replace(/::/g, ':')
        }
        return match
    })
}

exports.color = function (line) {
    return line.replace(/::|:(\w+)(?::\.|:((?:[^:]*|::)+):\.)/g, function (match, name, value) {
        if (match == '::') {
            return ':'
        }
        if (name == 'overwrite') {
            return `\u001b[0G`
        }
        if ((name in COLOR) && value) {
            return `${COLOR[name]}${value.replace(/::/g, ':')}\u001b[0m`
        }
        return match
    })
}
