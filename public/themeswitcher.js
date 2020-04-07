// This script stores a "theme-dark" token in the browser's
// localStorage when the user switches theme, and then tries to keep
// that theme in use while they browse. Until the theme switching
// button is clicked, nothing is stored permanently in the browser.
//
// Finally, this script does nothing if the browser doesn't support
// localStorage, or the user has disabled it.
//
// I haven't GPL'd this script because it's trivial, but feel free to
// use anything here however you want if you find something useful.

function setup_theme_switcher() {
  document.addEventListener("DOMContentLoaded", function() {
    var subtitle = document.body.getElementsByClassName("subtitle").item(0).children.item(0);
    subtitle.innerHTML += " &nbsp; ";
    subtitle.appendChild(toggle_button);
  });

  var toggle_button = document.createElement("a");
  toggle_button.href = "#";

  var default_css = document.getElementById("css-default");
  var default_css_original_href = default_css.href;
  var light_css = document.getElementById("css-light");
  var dark_css = document.getElementById("css-dark");
  var default_dark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  function update_toggle_button() {
    var dark = window.localStorage.getItem("theme-dark");
    if (dark == 1) {
      toggle_button.textContent = "Theme (Dark)";
      default_css.href = default_dark ? default_css_original_href : dark_css.href;
    } else {
      toggle_button.textContent = "Theme (Light)";
      default_css.href = default_dark ? light_css.href : default_css_original_href;
    }
  }

  toggle_button.onclick = function() {
    if (window.localStorage.getItem("theme-dark") === null) {
      window.localStorage.setItem("theme-dark", default_dark ? 1 : 0);
    }

    var new_dark = window.localStorage.getItem("theme-dark") == 0 ? 1 : 0;
    window.localStorage.setItem("theme-dark", new_dark);
    update_toggle_button();
  };

  update_toggle_button();
}

function storage_available() {
  try {
    window.localStorage.setItem("asd", 5);
    window.localStorage.removeItem("asd");
    return true;
  } catch (e) {
    return false;
  }
}

if (storage_available()) {
  setup_theme_switcher();
}
