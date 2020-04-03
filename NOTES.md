Here are notes that I will need later, when trying to figure out how
everything works:
- The templating system first pastes the post inside the template/*
  file, then copies over fields from the post's csv.
- The csv's lines 1-6 are in use by the template/* files.
- The csv's line 7 is in use as a "root path" variable for posts that
  need to refer to resources in their folders, while avoiding relative
  links. Eg. `/2020/03/23/`, used in the context
  `href="{{7}}sample.mp4"`.
