{Twinkie}       = require "./vendor/twinkie/lib/twinkie"

twinkie = new Twinkie
twinkie.ignore  "bin", "lib"
twinkie.master "javascript"
twinkie.coffee  "src/bin", "bin"
twinkie.shebang "#!/usr/bin/env node", "bin/ace.js"
twinkie.coffee  "src/lib", "lib"
twinkie.copy    "src/lib", "lib", /\.js$/
twinkie.tasks task, "compile", "idl", "docco", "gitignore"
