/* A small code highlighter for the code samples on my blog.
 * Copyright (C) 2020  Jens Pitkanen <jens@neon.moe>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// Note: this code makes assumptions based on my own code
// style. Probably won't highlight others' code that well.

function highlight() {
  var code_blocks = document.body.getElementsByClassName("language-c");
  var keywords = [
    "auto", "break", "case", "char", "const", "continue", "default",
    "do", "double", "else", "enum", "extern", "float", "for", "goto",
    "if", "inline", "int", "long", "register", "restrict", "return",
    "short", "signed", "sizeof", "static", "struct", "switch",
    "typedef", "union", "unsigned", "void", "volatile", "while",
  ];
  var regex_var = /\b[A-z][A-z0-9]*/;
  var regex_number = /\b0[xX][0-9a-fA-F]+\b|\b[0-9]*\.[0-9]+\b|\b[0-9]*\b/;
  var regex_string = /"[^"]*"/;
  var regex_symbol = /&gt;|&lt;|\ |\(|\)|;|-/;
  for (var i = 0; i < code_blocks.length; i++) {
    var element = code_blocks.item(i);
    var code_lines = element.innerHTML.split('\n');
    var cursor = 0;

    var parts = [];
    var insert_index = 0;
    function insert_at(index, insertable) {
      if (index < insert_index) console.error("inserting before last insert!!");
      parts.push(element.innerHTML.substr(insert_index, index - insert_index));
      parts.push(insertable);
      insert_index = index;
    }

    var in_block_comment = false;

    for (var j = 0; j < code_lines.length; j++) {
      var words = code_lines[j].split(regex_symbol);
      var in_line_comment = false;

      for (var k = 0; k < words.length; k++) {
        var word = words[k];

        // Special case for < and >, because they're escaped in
        // innerHTML.
        var to_be_processed_html = element.innerHTML.substr(cursor);
        if (to_be_processed_html.startsWith("lt;") ||
            to_be_processed_html.startsWith("gt;")) {
          cursor += 3;
        }

        if (in_block_comment) {
          if (word == "*/") {
            in_block_comment = false;
            insert_at(cursor + word.length, "</span>"); // close comment block
          }
        } else {
          if (!in_line_comment) {
            if (word == "//") {
              in_line_comment = true;
              insert_at(cursor, "<span class='syntax-comment'>"); // open comment line
            }
            if (word == "/*") {
              in_block_comment = true;
              insert_at(cursor, "<span class='syntax-comment'>"); // open comment block
            }
          }

          if (!in_line_comment && !in_block_comment) {
            if (keywords.indexOf(word) != -1) {
              insert_at(cursor, "<span class='syntax-keyword'>");
              insert_at(cursor + word.length, "</span>");
            } else if (regex_string.test(word)) {
              insert_at(cursor, "<span class='syntax-string'>");
              insert_at(cursor + word.length, "</span>");
            } else if (regex_var.test(word) && element.innerHTML.substr(cursor + word.length, 1) == "(") {
              insert_at(cursor, "<span class='syntax-call'>");
              insert_at(cursor + word.length, "</span>");
            } else if (regex_var.test(word)) {
              insert_at(cursor, "<span class='syntax-variable'>");
              insert_at(cursor + word.length, "</span>");
            } else if (regex_number.test(word)) {
              insert_at(cursor, "<span class='syntax-number'>");
              insert_at(cursor + word.length, "</span>");
            }
          }
        }

        cursor += word.length + 1;
      }

      if (in_line_comment) {
        insert_at(cursor, "</span>"); // close comment line
      }
    }

    parts.push(element.innerHTML.substr(insert_index));
    element.innerHTML = parts.join('');

    // When processing, using &lt; and &gt; is forced upon us. Now we
    // can fix that to allow for good copypasting.
    element.innerHTML.replace(/&lt;/g, "<");
    element.innerHTML.replace(/&gt;/g, ">");
  }
};

highlight();
