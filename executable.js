module.exports = function (process, stat) {
    if (stat.mode & 001) return true
    if (stat.uid == process.getuid() && stat.mode & 010) return true
    if (process.getgroups && process.getgroups().some(function (gid) {
        return gid == stat.gid
    }) && stat.mode & 100) return true
    if (process.getgid() == stat.gid && stat.mode & 100) return true
    return false
}
