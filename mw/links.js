let as = document.getElementsByTagName('a');

for (var i = 0; i < as.length; i++) {
  as[i].target="_blank";
  as[i].rel = "noreferrer";
  as[i].style.padding = "4px";
  as[i].appendChild(document.createElement('br'))
}
