$(document).ready (function () {

  var parstr = window.location.href.replace(window.location.href.split ('?')[0],''), r, ps;  // parse the URL for "basename" and parameters
  if (parstr.length>1) {
   var str1 = parstr;

   if (str1.indexOf('delete')>0 || str1.indexOf('remove')>0) {
     localStorage.removeItem(str1.split('|')[0].replace('?',''));
     retrievelinks();

   }

   else {
     localStorage.setItem(str1.split('|')[0].replace('?',''),str1.split('|')[1]);
     console.log(str1.split('|')[1]);

     window.location.assign(str1.split('|')[1]);

   }


  }

  else {


retrievelinks();


}

});

function retrievelinks() {
  for (var i = 0; i < localStorage.length; i++){
    var nl = document.createElement('a');
    var br = document.createElement('br');
    nl.innerHTML = localStorage.key(i);
    nl.href = localStorage.getItem(localStorage.key(i));
    nl.target = "_blank";
    nl.rel = "noreferrer";

    $('body').append(nl);
    $('body').append(br );

    var blink = document.createElement('script');
    blink.src = 'links.js';
    document.body.appendChild(blink);
}
}
