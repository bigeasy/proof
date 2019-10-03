class Tracker {
    constructor () {
        this.tests = {}
    }

    update (event) {
        let test = this.tests[event.file]
        switch (event.type) {
        case 'run':
            test = this.tests[event.file] = {
                actual: 0,
                expected: '?',
                file: event.file,
                start: event.time,
                duration: 0,
                time: 0,
                passed: 0
            }
            test.time = event.time
            break
        case 'plan':
            test.expected = event.message
            break
        case 'test':
            test.time = event.time
            test.duration = event.time - test.start
            test.actual++
            if (event.message.ok) {
                test.passed++
            }
            break
        case 'bail':
            test.time = event.time
            test.duration = event.time - test.start
            test.bailed = true
            break
        case 'exit':
            test.time = event.time
            test.duration = event.time - test.start
            test.code = event.message[0]
            break
        }
        if (event.type != 'eof') {
            return test
        }
    }
}

module.exports = Tracker
