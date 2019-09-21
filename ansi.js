const COLOR = {
    red: '\u001B[31m',
    green: '\u001B[32m',
    blue: '\u001B[34m',
    gray: '\u001B[38;5;244m'
}

const ICON = { pass: '\u2713', fail: '\u2718' }

function monochrome (line, icons) {
    return line.replace(/::|:(\w+)(?::\.|:((?:[^:]*|::)+):\.)/g, function (match, name, value) {
        if (match == '::') {
            return ':'
        }
        switch (name) {
        case 'overwrite':
            return ''
        case 'pass':
        case 'fail':
            return icons[name]
        default:
            if ((name in COLOR) && value) {
                return value.replace(/::/g, ':')
            }
        }
        return match
    })
}

exports.ascii = function (line) {
    return monochrome(line, { pass: '+', fail: 'x' })
}

exports.monochrome = function (line) {
    return monochrome(line, ICON)
}

exports.color = function (line) {
    return line.replace(/::|:(\w+)(?::\.|:((?:[^:]*|::)+):\.)/g, function (match, name, value) {
        if (match == '::') {
            return ':'
        }
        switch (name) {
        case 'overwrite':
            return `\u001b[0G`
        case 'pass':
        case 'fail':
            return ICON[name]
        default:
            if ((name in COLOR) && value) {
                return `${COLOR[name]}${value.replace(/::/g, ':')}\u001b[0m`
            }
        }
        return match
    })
}
