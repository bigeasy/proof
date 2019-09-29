const fs = require('fs')
const child = require('child_process')
const path = require('path')

fs.readdirSync(__dirname)
    .filter(file => /^proof\.[^.]+$/.test(file))
    .filter(dir => ~fs.readdirSync(dir).indexOf('test'))
    .forEach(dir => {
        const spawn = child.spawnSync('npm', [ 'test' ], { cwd: path.join(__dirname, dir), stdio: 'inherit' })
        if (spawn.status != 0) {
            process.exit(1)
        }
    })
