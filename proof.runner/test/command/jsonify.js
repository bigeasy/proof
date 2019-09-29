const tap = require('../../tap')

module.exports = function (line) {
    if (line == '') {
        return line
    }
    const parts = line.split(/\s+/)
    switch (parts[1]) {
    case 'run':
            // message: tap.assertion(parts.slice(3).join(' '))
        return JSON.stringify({
            time: +parts[0],
            type: parts[1],
            file: parts[2]
        })
        break
    case 'plan':
        return JSON.stringify({
            time: +parts[0],
            type: parts[1],
            file: parts[2],
            message: +parts[3]
        })
        break
    case 'bail':
    case 'out':
    case 'err':
        return JSON.stringify({
            time: +parts[0],
            type: parts[1],
            file: parts[2],
            message: /^\S+\s+\S+\s+\S+ (.*)/.exec(line)[1]
        })
        break
    case 'test':
        return JSON.stringify({
            time: +parts[0],
            type: parts[1],
            file: parts[2],
            message: tap.assertion(parts.slice(3).join(' '))
        })
        break
    case 'exit':
        return JSON.stringify({
            time: +parts[0],
            type: parts[1],
            file: parts[2],
            message: [ +parts[3], parts[4] ]
        })
    case 'eof':
        return JSON.stringify({
            time: +parts[0],
            type: parts[1],
            message: null
        })
    }
}
