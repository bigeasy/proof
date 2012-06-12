bash_bin_sources = $(wildcard src/bin/*.sh)
coffee_bin_sources = $(wildcard src/bin/*.coffee)
coffee_lib_sources = $(wildcard src/lib/*.coffee)

sources = $(bash_bin_sources) $(coffee_bin_sources) $(coffee_lib_sources)

bash_bin_targets = $(bash_bin_sources:src/%.sh=%)
coffee_bin_targets = $(coffee_bin_sources:src/%.coffee=%)
coffee_lib_targets = $(coffee_lib_sources:src/%.coffee=%.js)

all: $(bash_bin_targets) $(coffee_bin_targets) $(coffee_lib_targets) bin/proof-getopt
	@echo > /dev/null

watch: all
	@inotifywait -q -m -e close_write $(sources) | while read line; do make --no-print-directory all; done;

$(coffee_bin_targets): bin/%: src/bin/%.coffee
	@mkdir -p bin
	coffee -o $(@D) $<
	@echo "#!/usr/bin/env node" > $@ && cat $(@).js >> $@ && chmod 755 $@ && rm $(@).js

$(bash_bin_targets): bin/%: src/bin/%.sh
	@mkdir -p bin
	cp $< $@
	@chmod 755 $@

bin/proof-getopt: vendor/getopt/getopt
	@mkdir -p bin
	cp $< $@
	@echo -e '\ngetopt "$$@"' >> $@
	@chmod 755 $@

lib/%.js: src/lib/%.coffee
	@mkdir -p lib
	coffee -o $(@D) $<

clean:
	rm -rf lib bin

.PHONY: clean all watch
