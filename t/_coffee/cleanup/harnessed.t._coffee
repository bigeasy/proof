#!/usr/bin/env _coffee
require("./proof") 1, (fs, exec, tmp, ok, _) ->
  program = "#{tmp}/example.sh"

  fs.writeFile program, "#!/bin/bash\nexit 1\n", "utf8", _
  ok true, "wrote"
