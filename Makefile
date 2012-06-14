all: bin/proof-getopt
	@echo > /dev/null

bin/proof-getopt: vendor/getopt/getopt
	@mkdir -p bin
	cp $< $@
	@echo -e '\ngetopt "$$@"' >> $@
	@chmod 755 $@

clean:
	rm bin/proof-getopt

.PHONY: clean all watch
