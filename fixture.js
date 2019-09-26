const fs = require('fs').promises
const tap = require('./tap')

function write (json) {
    console.log(JSON.stringify(json))
}

async function main () {
    const body = await fs.readFile(process.argv[2], 'utf8')
    const lines = body.split('\n').filter(line => line)
    for (const line of lines) {
        const parts = line.split(/\s+/)
        switch (parts[1]) {
        case 'run':
                // message: tap.assertion(parts.slice(3).join(' '))
            write({
                when: +parts[0],
                type: parts[1],
                file: parts[2]
            })
            break
        case 'plan':
            write({
                when: +parts[0],
                type: parts[1],
                file: parts[2],
                message: +parts[3]
            })
            break
        case 'test':
            write({
                when: +parts[0],
                type: parts[1],
                file: parts[2],
                message: tap.assertion(parts.slice(3).join(' '))
            })
            break
        case 'exit':
            write({
                when: +parts[0],
                type: parts[1],
                file: parts[2],
                message: { code: +parts[3], signal: parts[4] }
            })
            break
        case 'exit':
            write({
                when: +parts[0],
                type: parts[1],
                file: parts[2],
                message: { code: +parts[3], signal: parts[4] }
            })
        case 'eof':
            write({
                when: +parts[0],
                type: parts[1],
                message: null
            })
        }
    }
}

main()
