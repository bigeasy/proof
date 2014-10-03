module.exports = function (process, stat) {
    if (stat.mode & 001) return true // was 0x1
    if (stat.uid == process.getuid() && stat.mode & 010) return true // was 0x40
    if (process.getgroups && process.getgroups().some(function (gid) {
        return gid == stat.gid
    }) && stat.mode & 100) return true // was 0x8
    if (process.getgid() == stat.gid && stat.mode & 100) return true // was 0x8
    return false
}
