#!/usr/bin/env _coffee
require("./proof") 1, ({ fs, exec, tmp }, _) ->
  program = "#{tmp}/example.sh"

  fs.writeFile program, "#!/bin/bash\nexit 1\n", "utf8", _
  fs.chmod program, 0755, _

  try
    exec program, _
  catch e
    @equal e.code, 1, "exit code"
