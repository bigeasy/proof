module.exports = function (process, pid, signal) {
    if (process.platform == 'win32') {
        process.kill(pid, signal)
    } else {
        process.kill(-pid, signal)
    }
}
