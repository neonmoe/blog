.POSIX:

POSTS              = public/2019/07/06/make.html
POSTS_XML          = $(POSTS:.html=.xml)
RESOURCES          = public/dark.css public/light.css public/feed.xml
TEMPLATE_POST_HTML = templates/post.html
TEMPLATE_POST_ATOM = templates/post.xml
TEMPLATE_FEED_ATOM = templates/feed.xml

all: $(POSTS) $(POSTS_XML) $(RESOURCES)
clean:
	rm $(POSTS) $(POSTS_XML) $(RESOURCES)

public/dark.css: public/default.css
	sed -e 's/(prefers-color-scheme: light)/not all/g' -e 's/(prefers-color-scheme: dark)/all/g' $? > $@
public/light.css: public/default.css
	sed -e 's/(prefers-color-scheme: light)/all/g' -e 's/(prefers-color-scheme: dark)/not all/g' $? > $@

public/feed.xml: $(POSTS_XML)
	cat $(POSTS_XML) > $@.tmp
	awk -f templater.awk $@.tmp $(TEMPLATE_FEED_ATOM) > $@.tmp.tmp
	cat $@.tmp | awk "/<updated>/ { print }" | sort | tail -n 1 | awk -f templater.awk -v REPLACE="{{updated}}" - $@.tmp.tmp > $@
	rm $@.tmp $@.tmp.tmp

# Touching the .md files to trigger re-rendering if the template file is changed
$(POSTS:.html=.md): $(TEMPLATE_POST_HTML) $(TEMPLATE_POST_ATOM) $(TEMPLATE_FEED_ATOM)
	touch $@

.SUFFIXES: .html .xml .md
.md.html:
	cmark $< | awk -f templater.awk - $(TEMPLATE_POST_HTML) | awk -f templater.awk -v LOAD_LINES=1 $*.csv - > $@
.md.xml:
	cmark $< | awk -f templater.awk - $(TEMPLATE_POST_ATOM) | awk -f templater.awk -v LOAD_LINES=1 $*.csv - > $@
