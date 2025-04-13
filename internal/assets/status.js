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

new EventSource("/log?path=" + ServiceName + "&stream=stderr", {
  withCredentials: true,
}).onmessage = newLogrotate(document.getElementById("stderr"));

new EventSource("/log?path=" + ServiceName + "&stream=stdout", {
  withCredentials: true,
}).onmessage = newLogrotate(document.getElementById("stdout"));
