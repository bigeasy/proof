module.exports = function (process, stat) {
    if (stat.mode & 0x1) return true
    if (stat.uid == process.getuid() && stat.mode & 0x40) return true
    if (process.getgroups && process.getgroups().some(function (gid) {
        return gid == stat.gid
    }) && stat.mode & 0x8) return true
    if (process.getgid() == stat.gid && stat.mode & 0x8) return true
    return false
}
