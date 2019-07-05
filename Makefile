.POSIX:

POSTS     = public/2019/07/06/make.html
RESOURCES = public/dark.css public/light.css
TEMPLATE  = template.html

all: $(POSTS) $(RESOURCES)
clean:
	rm $(POSTS) $(RESOURCES)

public/dark.css: public/default.css
	sed -e 's/(prefers-color-scheme: light)/not all/g' -e 's/(prefers-color-scheme: dark)/all/g' $? > $@
public/light.css: public/default.css
	sed -e 's/(prefers-color-scheme: light)/all/g' -e 's/(prefers-color-scheme: dark)/not all/g' $? > $@

# Touching the .md files to trigger re-rendering if the template file is changed
$(POSTS:.html=.md): $(TEMPLATE)
	touch $@

.SUFFIXES: .html .md
# TODO: RSS feed support
.md.html:
	awk '/<!-- insert-markdown-here -->/ { exit } { print }' $(TEMPLATE) > $@
	cmark $< >> $@
	awk 'BEGIN { end = 0 } end == 1 { print } /<!-- insert-markdown-here -->/ { end = 1 }' $(TEMPLATE) >> $@
