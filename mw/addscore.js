let home = "~";
//let dir = "~/Documents/Musescore3/Scores";
let cd = "cd ";
let mv = "mv ";
let echo = "echo ";
let mscore = "/Applications/MuseScore\\ 3.app/Contents/MacOS/mscore ";
let mkdir = "cd ~/Documents\n"+"mkdir -p MscExports/";
let dest = "~/Documents/MscExports/";
let br = "\n";
let exp = "-o ";
let sp = " ";
let q = "'";
let qt = "\"";
let mscz = ".mscz"
let xml = ".xml";
let mp3 = ".mp3";
let svg = ".svg";
let mpos = ".mpos";
let jobin = "[{\"in\": \"";
let jobtext1 = "\",";
let jobout = "\"out\": [\"";
let jobtext2 = "\"]}]";
let uip = "Deployed_to_Surge";


byId('location').addEventListener('input', () => {
build();
upl();
getlink();


});


byId('path').addEventListener('change', ()=> {

});


function build() {
  let dir = document.getElementById('path').value;
  let jbo = '[';
  let mov = '';
  let cmd = byId('cmd');
  //for (var i = 0; i < byId('location').files.length; i++) {

  //  console.log(byId('location').files[i].name);
  //}
  let scorename = byId('location').files[0].name.replace(/\s/g, '\\ ');
  //let name = scorename.replace(/(.mscz)/g,'');
  let name = scorename.replace(/\.[^/.]+$/, "");
  if (byId('name').value.length>0) {
   name = byId('name').value.replace(" ", "\ ");
 }
 let allsvgs = "";
 for (var i = 1; i < 10; i++) {
   allsvgs += name+"-"+i+svg+sp;
   allsvgs += name+"-"+"0"+i+svg+sp;
   allsvgs += name+"-"+"00"+i+svg+sp;
 }
 for (var i = 10; i < byId('maxpages').value; i++) {
   allsvgs += name+"-"+i+svg+sp;
 }

 console.log(allsvgs);
  console.log(name);
  console.log(scorename);
  cmd.value = mkdir+name+br;

  if (byId('xml').checked) {
     //cmd.value += cd+dir+br+mscore+exp+q+name+xml+q+sp+q+scorename+q+br+
     mov += mv+name+xml+sp+dest+name+br;

     jbo += ","+qt+name+xml+qt;
     jbo = jbo.replace(/(\[,)/g,'\[');
  }

  if (byId('mp3').checked) {
     //cmd.value += cd+dir+br+mscore+exp+q+name+mp3+q+sp+q+scorename+q+br+
     mov += mv+name+mp3+sp+dest+name+br;


     jbo += ","+qt+name+mp3+qt;
     jbo = jbo.replace(/(\[,)/g,'\[');
  }

  if (byId('mpos').checked) {
     //cmd.value += cd+dir+br+
     //echo+"'"+jobin+scorename+jobtext1+jobout+name+mpos+jobtext2+"'"+sp+">"+sp+"mpos.json"+br+
     //"/Applications/MuseScore\\ 3.app/Contents/MacOS/mscore -j mpos.json"+br+
     mov += mv+name+mpos+sp+dest+name+br;
     //cd+dir+br+
     //"rm mpos.json"+br;

     jbo += ","+qt+name+mpos+qt;
     jbo = jbo.replace(/(\[,)/g,'\[');
  }

  if (byId('svg').checked) {

    ///cmd.value += cd+dir+br+
    //echo+"'"+jobin+scorename+jobtext1+jobout+name+svg+jobtext2+"'"+sp+">"+sp+"mpos.json"+br+
    //"/Applications/MuseScore\\ 3.app/Contents/MacOS/mscore -j mpos.json"+br+
    mov += "for file in "+allsvgs+"; do "+mv+"$file"+sp+dest+name+"; done"+br;


     //cmd.value += cd+dir+br+mscore+exp+q+name+svg+q+sp+q+scorename+q+br+
     //"for file in "+allsvgs+"; do "+mv+"$file"+sp+dest+name+"; done"+br;


     jbo += ","+qt+name+svg+qt;
     jbo = jbo.replace(/(\[,)/g,'\[');

   }

jbo += "]";

cmd.value += cd+dir+br+
echo+"'"+jobin+scorename+jobtext1+"\"out\": "+jbo+"}]"+"'"+sp+">"+sp+"convert.json"+br+
"/Applications/MuseScore\\ 3.app/Contents/MacOS/mscore -j convert.json"+br+
cd+dir+br+
"rm convert.json"+br
+mov+br;


console.log(jbo);

/*  mscore+exp+q+name+svg+q+sp+q+scorename+q+br+
  //mv+name+svg+sp+dest+name+br+
  cd+dir+br+
  echo+"'"+jobin+scorename+jobtext1+jobout+name+mpos+jobtext2+"'"+sp+">"+sp+"mpos.json"+br+
  "/Applications/MuseScore\\ 3.app/Contents/MacOS/mscore -j mpos.json"+br+
  mv+name+mpos+sp+dest+name+br+
  cd+dir+br+
  "rm mpos.json"+br+
  "for file in "+allsvgs+"; do "+mv+"$file"+sp+dest+name+"; done"+br*/
}


window.addEventListener('keydown', function(event){
if (event.altKey && event.which == 80) {
  mp3test();
}
});

window.addEventListener('load', ()=>{
mp3test();
});

function mp3test() {
  let wscorename = byId('location').files[0].name.replace(/\s/g, '\\ ');
  let wname = wscorename.replace(/\.[^/.]+$/, "");
  if (byId('name').value.length>0) {
   wname = byId('name').value.replace(" ", "\ ");
 }
  console.log(wname);
document.getElementsByTagName('audio')[0].src='file:///Users/theo/Documents/MscExports/'+wname+"/"+wname+mp3;
console.log('file:///Users/theo/Documents/MscExports/'+wname+"/"+wname+mp3);
}

function byId(x) {
  return document.getElementById(x);
}


function upl() {

  let dir = byId('path').value;
  let upl = byId('upl');
  let scorename = byId('location').files[0].name.replace(/\s/g, '\\ ');
  //let name = scorename.replace(/(.mscz)/g,'');
  let name = scorename.replace(/\.[^/.]+$/, "");
  if (byId('name').value.length>0) {
   name = byId('name').value.replace(" ", "\ ");
 }


  console.log(name);
  console.log(scorename);

  upl.value = mkdir+name+br;

  var domain, dlc = '';

  if (byId('surge').checked) {
    if (byId('surgedomain').value.indexOf('surge.sh')<1) {
      domain = byId('surgedomain').value+".surge.sh";
    }
    else {
      domain = byId('surgedomain').value;
    }

    if (!byId('localcopy').checked) {
      dlc = cd+"~/Documents/MscExports"+br+"rm\ -rf\ "+name+br;

    }
console.log(byId('cbusername').value);
    localStorage.setItem('surgedomain', domain);
    localStorage.setItem('cbusername', byId('cbusername').value);


     upl.value += cd+"MscExports"+br+
     "mkdir\ -p\ "+uip+br+
     "cp\ -R\ "+name+sp+uip+"/"+name+br+
     cd+uip+br+
     "echo\ '"+byId('surgecors').value+"'\ >\ CORS"+br+
     "echo\ '"+name+br+"'\ >>\ dirs.txt"+br+
     "surge\ --domain\ "+domain+br+
     dlc+br;

  }

  if (byId('codeberg').checked) {
     upl.value += cd+dir+br+mscore+exp+q+name+mp3+q+sp+q+scorename+q+br+
     mv+name+mp3+sp+dest+name+br;
  }

}


function getlink() {


  let scorename;

    scorename = byId('location').files[0].name.replace(/\s/g, '\\ ');
    let name = scorename.replace(/\.[^/.]+$/, "");

  //let name = scorename.replace(/(.mscz)/g,'');

  if (byId('name').value.length>0) {
   name = byId('name').value.replace(" ", "\ ");
 }
  var host, username;
  var sl = "/";
  if (byId('surge').checked) {
   host="s";
   username = byId('surgedomain').value.replace(/(.surge.sh)/g,'');
  }
  if (byId('codeberg').checked) {
   host="c";
   username= byId('cbusername').value;
  }
  var unescapedlink = "mscweb.html?"+username+sl+host+sl+name;
  var params = '';

  if (byId('bgc').value.length>0&&!byId('bgc').value=='#000000') {
   params+= "&bgc="+byId('bgc').value;
  }
  if (byId('tc').value.length>0&&!byId('tc').value=='#000000') {
   params+= "&tc="+byId('tc').value;
  }
  if (byId('tcop').value.length>0) {
   params+= "&tcop="+byId('tcop').value;
  }
  if (byId('shaud').checked) {
   params+= "&showAudio";
  }
  if (byId('sm').value.length>0) {
   params+= "&sm="+byId('sm').value;
  }

  document.getElementById('link').href="scores.html?"+name+"|"+unescapedlink+params;

}



window.addEventListener("load", ()=>{
  try {
    byId('surgedomain').value = localStorage.getItem('surgedomain').replace(/(.surge.sh)/g, '');
    byId('cbusername').value = localStorage.getItem('cbusername').replace(/(.codeberg.page)/g, '');
  } catch (e) {

  }

})
