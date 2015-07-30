module.exports = function () {
    var events = []
    return function (event) {
        events.push(event)
        if (event.type === 'eof') t{
            return [ JSON.stringify(events, null, 2), '\n' ]
        }
        return []
    }
}
