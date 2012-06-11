all: bin/proof lib/proof.js
	@echo > /dev/null

sources += $(wildcard src/lib/*.coffee)
sources += $(wildcard src/bin/*.coffee)

watch: all
	@inotifywait -q -m -e close_write $(sources) | while read line; do make --no-print-directory all; done;

bin/%: src/bin/%.coffee
	@mkdir -p bin
	coffee -o $(@D) $<
	@echo "#!/usr/bin/env node" > $@ && cat $(@).js >> $@ && chmod 755 $@ && rm $(@).js

lib/%.js: src/lib/%.coffee
	@mkdir -p lib
	coffee -o $(@D) $<

clean:
	rm -rf lib bin

.PHONY: clean all watch
