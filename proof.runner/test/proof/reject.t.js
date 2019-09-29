require('../..')(1, (okay) => {
    const events = require('events')
    const ee = new events.EventEmitter
    require('../../reject')(ee)
    try {
        ee.emit('unhandledRejection', new Error('rejected'))
    } catch (error) {
        okay(error.message, 'rejected', 'rejected')
    }
})
