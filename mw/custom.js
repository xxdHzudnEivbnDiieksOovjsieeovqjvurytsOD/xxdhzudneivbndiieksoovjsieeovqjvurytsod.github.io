window.addEventListener('keydown', function(event) {
  var bnm = location.href.split('&')[0].split('/').pop();
if (event.ctrlKey && event.which == 85) {
newsource();
}
})

function newsource() {
  console.log('working');

  var sourceinput = document.createElement('input');
  sourceinput.placeholder = 'Audio Link';

  var spd = document.createElement('input');
  spd.type = 'number';
  spd.value = 0.75;
  spd.id = 'spd';

  var rst = document.createElement('input');
  rst.type = 'button';
  rst.value = 'reset';
  rst.id = 'rst';

  var sourceparse = document.createElement('input');

  var yts = document.createElement('span');
  yts.innerHTML = 'Youtube:';

  var yt = document.createElement('input');
  yt.type = "checkbox";
  yt.setAttribute('checked', 'true');


  document.body.prepend(rst);
  document.body.prepend(spd);
  document.body.prepend(sourceparse);
  document.body.prepend(yt);
  document.body.prepend(yts);
  document.body.prepend(sourceinput);

  sourceinput.focus();


  sourceinput.addEventListener('change', ()=> {
   if (yt.checked) {
    parseyt(sourceinput, sourceparse);
   }
   else{
     sourceparse.value = sourceinput.value;
     setsrc(sourceinput, sourceparse);
   }
  })
}



function parseyt(x, y) {
  var instances = ['vid.puffyan.us', 'inv.riverside.rocks', 'invidious.slipfox.xyz', 'youtube.076.ne.jp'];
  var px = x.value.split(/[/]+/).pop().replace(/(watch\?v=)/g,'');
  var rint = Math.floor(Math.random() * (instances.length) + 0);
  var rinst = instances [rint];
  console.log(rint);
  console.log(px);
  y.value = 'https://'+rinst+"/latest_version?id="+px+"&itag=22&local=true";

  setsrc(x,y, px)
}

function setsrc(x, y, id) {
  y.blur();
  var aud2 = document.createElement('audio');
  aud2.controls = 'true';
  aud2.id = 'aud2';

  aud2.src= y.value;
  aud2.speed = 2 //document.getElementById('spd').value;

  try{
  elmed.currentTime=0;
  options.tcop = 0;
  document.getElementById('aud').blur();
  var origaud = elmed;
  var audsrc1 = elmed.src;
  elmed.src = '';
  document.getElementById('aud').parentNode.removeChild(document.getElementById('aud'));
  }
  catch(e) {

  }

  document.body.prepend(aud2);

  document.getElementById('aud2').focus();

  document.getElementById('aud2').oncanplay = align(id);

}
function align(id) {
  var elob = '';
  var meas = 0;
  var lses = '[';

//  try {
  //  lses = localStorage.getItem('mpostimes')
//  } catch (e) {
//  }
  window.addEventListener('keydown', function(event){


    if (event.which == 32) {
      event.preventDefault();
      if (document.getElementById('aud2').paused) document.getElementById('aud2').play ();
      else document.getElementById('aud2').pause ();

    }
    if (event.which == 78) {
      var repeatnos = document.getElementById('repeats').innerHTML.split(',');








      for (var i = 0; i < repeatnos.length; i++) {
        if (repeatnos[i].split('|').length > 0) {
          console.log(meas, parseInt(repeatnos[i].split('|')[0]));
          if (meas-1 == parseInt(repeatnos[i].split('|')[0]) && repeatnos[i].split('|')[1] == 'backward' && repeatnos[i].indexOf('done')<1) {
            for (var l = i; l > -1; l--) {
              if (repeatnos[l].split('|')[1] == 'forward') {
                console.log(parseInt(repeatnos[l].split('|')[0]));
                meas = parseInt(repeatnos[l].split('|')[0]);
                console.log('repeating');
                document.getElementById('repeats').innerHTML = document.getElementById('repeats').innerHTML.replace(repeatnos[i], repeatnos[i]+"|done")

              }
            }
          }
        }
      }


      putMark(meas);

      elob += '<event elid=\"'+JSON.stringify(meas)+'\" position=\"'+JSON.stringify(Math.round(document.getElementById('aud2').currentTime * 1000))+'\"/>';
      lses += '<event elid=\"'+JSON.stringify(meas)+'\" position=\"'+JSON.stringify(Math.round(document.getElementById('aud2').currentTime * 1000))+'\"/>'+", ";


        meas ++;



      console.log(document.getElementById('aud2').currentTime * 1000, elob);

    }
    if (event.which == 84) {

      lses += "]";
      lses = lses.replace(/(,])/g,']').replace(/(, ])/g,']').replace(/(\[\])/g,'').replace(/(null)/g,'').replace(/(\]\])/g,'');
      localStorage.setItem('mpostimes'+"_"+location.href.split('&')[0].split('/').pop(), lses);

      console.log(localStorage.getItem('mpostimes'+"_"+location.href.split('&')[0].split('/').pop()));



      console.log(window.location.href+"&mt=local");

      //var link1 = document.createElement('a');
      //link1.href = location.pathname.split(/[/]+/).pop()+location.search+"&mt=local";
      //link1.target = "_blank";
      //link1.rel = "noreferrer";
      //link1.innerHTML = "Test Link";

      //document.body.prepend(link1);

      //link1.click();

    window.open(location.pathname.split(/[/]+/).pop()+location.search+"&aud="+id+"&mt=local", "_blank")

    }
  });



  document.getElementById('rst').addEventListener('click', function() {
    elob = '';
    meas = 0;
    document.getElementById('repeats').innerHTML = document.getElementById('repeats').innerHTML.replace(/(|done)/g,'').replace('done','');
    lses = '[';
    document.getElementById('aud2').currentTime = 0;
    localStorage.removeItem('mpostimes'+"_"+location.href.split('&')[0].split('/').pop());
  });

  document.getElementById('spd').addEventListener('change', function() {
    document.getElementById('aud2').speed = document.getElementById('spd').value;
  });

}
