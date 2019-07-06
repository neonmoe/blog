BEGIN {
    if (length(REPLACE) == 0) {
        REPLACE = "{{insert-here}}";
    }
}
NR == FNR {
    a[n++] = $0;
    next
}
LOAD_LINES && /\{\{[0-9]\}\}/ {
    i = match($0, /\{\{[0-9]\}\}/);
    line = substr($0, i + 2, 1);
    sub(/\{\{[0-9]\}\}/, a[line]);
}
{
    if ($0 ~ REPLACE) {
        for (i = 0; i < n; i++) {
            print a[i];
        }
        next
    } else {
        print
    }
}
