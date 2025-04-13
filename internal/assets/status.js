function newLogrotate(elt) {
  const maxLines = 101;
  var lines = 0;
  return function (e) {
    const line = e.data;
    const txt = elt.innerText + line + "\n";
    lines += line.split("\n").length;

    var toRemove = lines - maxLines;
    var i = 0;
    while (toRemove-- > 0) {
      i = txt.indexOf("\n", i) + 1;
      lines--;
    }
    elt.innerText = txt.slice(i);
  };
}

var stdout = document.getElementById("stdout");
var stderr = document.getElementById("stderr");
var stream = undefined;
function watch() {
  if (stream !== undefined) {
   console.log('stream still alive');
   return;
  }
  stream = new EventSource("/log?path=" + ServiceName + "&stream=both", {
    withCredentials: true,
  });
  stream.addEventListener('open', (event) => {
    stdout.innerText = '';
    stderr.innerText = '';
  });
  stream.addEventListener('stdout', newLogrotate(stdout));
  stream.addEventListener('stderr', newLogrotate(stderr));
}

function unwatch() {
  if (stream === undefined) {
    return;
  }
  console.log('closing stream');
  stream.close();
  stream = undefined;
}

// Only watch stdout+stderr while the tab is visible.
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    unwatch();
  } else {
    watch();
  }
});

window.addEventListener("unload", unwatch);
window.addEventListener("pagehide", unwatch);
window.addEventListener("pageshow", watch);
