var colorization = require('./colorization')
// Problem with errors is that output can be interleaved, so we need to gather
// up the lines of output after a failed assertion, or else the output of other
// assertions get interleaved.
//
// The first formatting style that comes to mind would be one that grouped all
// the failed assertions under their failed test, but that means waiting for a
// full test to load. There are test with a great many failures, one of the
// automated tests, like the one in Timezone that tests every clock transition
// in the world since the dawn of standardized time. We might run out of memory
// if a test of that nature is really broken and really chatty about it.
//
// What we're going to do for a stab at this problem is create a queue, as we do
// with progress, and one go at a time. Chances are the queue will be empty. If
// there is one long running test interleaved with a quick test, then the quick
// test will be done quickly, and the long running test can take over. If two
// long running test are interleaved, then we might want to view the tests one
// at a time by piping the test through `grep`, or piping it through `sort`,
// before passing it to `proof errors`.
module.exports = function (options) {
    var queue = []
    var failed = {}
    var prefix = ''
    var backlog = {}
    var offset = 2
    var planned
    var colorize = colorization(options.ultimate)

    return function (event, state) {
        var out = []
        if (event.type === 'run') {
            planned = false
            backlog[event.file] = [
                {
                    type: 'out',
                    line: ''
                }, {
                    type: 'out',
                    line: '>--'
                }, {
                    type: 'out',
                    line: ''
                }
            ]
        }
        if (failed[event.file]) {
            failed[event.file].events.push(event)
            if (event.type === 'test' && event.ok) delete failed[event.file]
        } else if ((event.type === 'bail') ||
                   (event.type === 'test' && !(event.ok)) ||
                   (event.type === 'exit' && (event.code || !planned || (event.expected != event.actual)))) {
            queue.push(failed[event.file] = {
                events: backlog[event.file].concat([event])
            })
            if (event.type === 'test') {
                backlog[event.file].length = 3
            } else {
                delete backlog[event.file]
            }
        } else if (event.type === 'plan') {
            planned = true
        } else if (event.type === 'test') {
            backlog[event.file].length = 3
        } else if (event.type === 'exit') {
            delete backlog[event.file]
        } else if (event.type !== 'eof') {
            backlog[event.file].push(event)
        } else if (offset !== 2) {
            out.push('\n')
            state.code = 1
        }
        while (queue.length && queue[0].events.length) {
            event = queue[0].events.shift()
            if (offset-- > 0) {
                continue
            }
            switch (event.type) {
                case 'bail':
                    out.push('> ' + (colorize.red('\u2718')) + ' ' + event.file + ': Bail Out! ' + event.message + '\n')
                    break
                case 'test':
/*                    if (!planned) {
                        process.stdout.write('> ' + (colorize.red('\u2718')) + ' ' + event.file + ': no plan given: ' + event.message + '\n')
                        planned = true
                    } else */
                    if (event.ok) {
                        queue.shift()
                    } else {
                        out.push('> ' + (colorize.red('\u2718')) + ' ' + event.file + ': ' + event.message + '\n')
                    }
                    break
                case 'err':
                case 'out':
                    out.push('' + event.line + '\n')
                    prefix = ''
                    break
                case 'exit':
                    if (event.code || !planned || (event.actual != event.expected)) {
                        var line = []
                        line.push('> ' + (colorize.red('\u2718')) + ' ' + event.file)
                        if (!planned) {
                            line.push(': no plan given')
                        } else if (event.actual != event.expected) {
                            line.push(': expected ' + event.expected + ' test' + (event.expected == 1 ? '' : 's')  + ' but got ' + event.actual)
                        }
                        line.push(': exited with code ' + event.code)
                        out.push(line.join('') +  '\n')
                        prefix = '\n\n'
                    }
                    queue.shift()
                    break
            }
        }
        return out
    }
}
