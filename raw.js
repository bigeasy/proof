module.exports = function () {
    var events = []
    return function (event) {
        events.push(event)
        if (event.type === 'eof') {
            return [ JSON.stringify(events, null, 2), '\n' ]
        }
        return []
    }
}
