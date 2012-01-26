edify = require("./edify/lib/edify")()
edify.language "coffee"
  suffix: "coffee"
  docco: /^\s*#(.*)/
  ignore: [ /^#!/, /^#\s+vim/ ]
edify.language "c"
  suffix: [ "c", "h" ]
  ignore: [ /^#!/, /^# vim/ ]
  docco:
    start:  /^\s*\s(.*)/
    end:    /^(.*)\*\//
    strip:  /^\s+\*/
edify.parse "code/README.md", "index.html"
edify.stencil /code\/docs\/.*.md/, "stencil/markdown.stencil"
edify.tasks task
