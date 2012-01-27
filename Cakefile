edify = require("./edify/lib/edify")()
edify.language "coffee"
  lexer: "coffeescript"
  docco: "#"
  ignore: [ /^#!/, /^#\s+vim/ ]
edify.language "c"
  lexer: "c"
  ignore: [ /^#!/, /^# vim/ ]
  docco:
    start:  /^\s*\s(.*)/
    end:    /^(.*)\*\//
    strip:  /^\s+\*/
edify.parse "coffee", "code/src", "src", /\.coffee$/
edify.parse "markdown", "code/README.md", "index.html"
edify.stencil /\/.*.md$/, "stencil/markdown.stencil"
edify.stencil /\/.*.coffee$/, "stencil/docco.stencil"
edify.tasks task
