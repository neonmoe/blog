.POSIX:

POSTS                 = public/2019/07/15/mastodown.html public/2019/07/06/make.html
POSTS_XML             = $(POSTS:.html=.xml)
POSTS_PREVIEW         = $(POSTS:.html=.preview.html)
RESOURCES             = public/dark.css public/light.css public/feed.xml public/index.html
TEMPLATE_POST_HTML    = templates/post.html
TEMPLATE_POST_PREVIEW = templates/post-preview.html
TEMPLATE_INDEX        = templates/index.html
TEMPLATE_POST_ATOM    = templates/post.xml
TEMPLATE_FEED_ATOM    = templates/feed.xml

all: $(POSTS) $(RESOURCES)
clean:
	rm $(POSTS) $(POSTS_XML) $(POSTS_PREVIEW) $(RESOURCES)

public/dark.css: public/default.css
	sed -e 's/(prefers-color-scheme: light)/not all/g' -e 's/(prefers-color-scheme: dark)/all/g' $? > $@
public/light.css: public/default.css
	sed -e 's/(prefers-color-scheme: light)/all/g' -e 's/(prefers-color-scheme: dark)/not all/g' $? > $@

public/feed.xml: $(POSTS_XML)
	cat $(POSTS_XML) > $@.tmp
	awk -f templater.awk $@.tmp $(TEMPLATE_FEED_ATOM) > $@.tmp.tmp
	cat $@.tmp | awk "/<updated>/ { print }" | sort | tail -n 1 | awk -f templater.awk -v REPLACE="{{updated}}" - $@.tmp.tmp > $@
	rm $@.tmp $@.tmp.tmp

public/index.html: $(POSTS_PREVIEW) $(TEMPLATE_INDEX)
	cat $(POSTS_PREVIEW) | awk -f templater.awk - $(TEMPLATE_INDEX) > $@

# Touching the .md files to trigger re-rendering if the template file or the metadata is changed
$(POSTS:.html=.md): $(TEMPLATE_POST_HTML) $(TEMPLATE_POST_PREVIEW) $(TEMPLATE_INDEX) $(TEMPLATE_POST_ATOM) $(TEMPLATE_FEED_ATOM) $(POSTS:.html=.csv)
	touch $@

.SUFFIXES: .html .preview.html .xml .md
.md.html:
	cmark --unsafe --smart $< | awk -f templater.awk - $(TEMPLATE_POST_HTML) | awk -f templater.awk -v LOAD_LINES=1 $*.csv - > $@
.md.preview.html:
	awk -f templater.awk -v LOAD_LINES=1 $*.csv $(TEMPLATE_POST_PREVIEW) > $@
.md.xml:
	cmark --unsafe --smart $< | awk -f templater.awk - $(TEMPLATE_POST_ATOM) | awk -f templater.awk -v LOAD_LINES=1 $*.csv - > $@
