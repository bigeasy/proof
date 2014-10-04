module.exports = {
    plan: function (plan) {
        var $
        if ($ = /^1..(\d+)$/.exec(plan)) {
            return { expected: parseInt($[1], 10) }
        }
    },
    bailout: function (bailout) {
        var $
        if ($ = /^Bail out!(?:\s+(.*))?$/.exec(bailout)) {
            return { message: $[1] }
        }
    },
    assertion: function (assert) {
        var $, failed, message, ok, comment, skip, todo
        if ($ = /^(not\s+)?ok\s+\d+\s*(.*?)\s*$/.exec(assert)) {
            failed = $[1], message = $[2]
            ok = !failed
            comment = null, skip = false, todo = false
            if (message != null) {
                $ = message.split(/\s+#\s+/, 2), message = $[0], comment = $[1]
                if (comment != null) {
                    if (skip = ($ = /^skip\s(.*)$/i.exec(comment)) != null) {
                        comment = $[1]
                    }
                    if (todo = ($ = /^todo\s(.*)$/i.exec(comment)) != null) {
                        comment = $[1]
                    }
                }
            }
            return {
                ok: ok,
                message: message,
                comment: comment,
                skip: skip,
                todo: todo
            }
        }
    }
}
