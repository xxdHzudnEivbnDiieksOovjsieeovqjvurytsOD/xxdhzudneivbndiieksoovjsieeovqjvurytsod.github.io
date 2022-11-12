//~ Copyright (C) 2021: Willem Vree, contributtions Bernard Greenberg, Gertim Alberda
//~ This program is free software; you can redistribute it and/or modify it under the terms of the
//~ GNU General Public License as published by the Free Software Foundation; either version 3 of
//~ the License, or (at your option) any later version.
//~ This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
//~ without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
//~ See the GNU General Public License for more details. <http://www.gnu.org/licenses/gpl.html>.

'use strict'

const revision = 34;
var theSvgs,    // array of all svg pictures (dom trees) on the page
    svgWidth,   // width of the svg picture (we only remember one width ...)
    xmlWidth,   // width of the MusicXML document in tenths (1/10 of spatium == space between staff lines)
    xmlMm,      // spatium in millimeters
    msrRects = [],  // array of measure positions (from mpos file)
    times = [], // array of start time of each measure in milliseconds
    maten = [], // index into msrRects for each measure start time (times.length == maten.length)
    rMark,      // the shading cursor
    curPage,    // the page where the cursor is
    scrollMargin = 56,  // margin from top/bottom of #notation area to trigger/position scrolling
    elmed,      // the dom element of the audio player
    spdElm,     // input element for speed control
    curtix = 0, // current index in maten/times of the cursor position
    line2msr1 = [], // line number -> (number of) first measure on that line
    msr2line = [],  // measure number -> line number
    tickOpt = 0,    // tick opimization
    mnumStop = -1,  // == mnum after being paused by stops option
    options = { dpi: 300, stops: {}, noScroll: 0, counter: 0, stopOnce: 0,
                blib: 0, stflns: 5, pw: 0, lsp: 0, speed: 1,
                tc: "#add8e6", tcop: 0.5, bgc: 'beige', bname: '',
                showAudio: 0, Scroll: 0, sm: 56, dowload: 0,
                aud: '', mt: '' }; // URL options

function prepareSvgs (page) {
    theSvgs = $('#notation').find ('svg').get ();   // get all svg's in the notation area
    theSvgs.forEach (function (svg) {
        svg.setAttribute ('width', '100%');         // scale svg to full page width
        svg.removeAttribute ('height');             // height should not be set
        svg.addEventListener ('mousedown', scoreClick);
        svgWidth = svg.viewBox.baseVal.width;       // svg page width (assume all pages equal)
    });
    if (page == 1) {
        rMark = document.createElementNS ('http://www.w3.org/2000/svg','rect');
        rMark.setAttribute ('id', 'cursor');
        rMark.setAttribute ('fill', options.tc);  //default fill = #add8e6
        rMark.setAttribute ('fill-opacity', JSON.stringify(options.tcop) ); //default opacity = 0.5
        rMark.setAttribute ('width', '0');
        document.body.style.backgroundColor = options.bgc;
        document.title = options.bname;
        scrollMargin = options.sm;

        document.getElementById('loadmessage').remove();

        if (options.showAudio) {
          document.getElementById('aud').classList.remove('hidden');
          resize();
        }

        var pn = theSvgs [0];                           // insert the cursor into the first page
        pn.insertBefore (rMark, pn.firstChild);
        computeMusic ();
    }
    rMark = document.getElementById ('cursor');
}

function computeMusic () {
    if (options.lsp && options.pw) {
        xmlMm = options.lsp * (options.stflns - 1);
        xmlWidth = options.pw * 10 * (options.stflns - 1) / xmlMm;
    }
    var xml2msc = 25 * xmlMm / 7.05556;             // reverse engineered factor: mpos unit / xml unit (tenths)
    var scale = svgWidth / (xmlWidth * xml2msc);    // mpos coors -> svg coors
    //console.log (scale.toFixed (4), xmlMm, xmlWidth);
    msrRects = msrRects.map (function (m) {         // scale all measure rects
        return {
            x: m.x * scale,
            y: m.y * scale,
            sx: m.sx * scale,
            sy: m.sy * scale,
            page: m.page }
    });
    curtix = 0;
    curPage = -1;   // valid after first click or tick
    putMark (curtix, options.noScroll);
}

function putMark (mnum, noScroll) { // put the cursor on measure mnum
    if (mnum in options.stops && mnum != mnumStop && !elmed.paused) {    // auto-stop at the given measure numbers
        elmed.pause ();
        elmed.blur ();              // remove focus from player for next space bar press
        tickOpt = 0;                // catch all ticks again
        mnumStop = mnum;
        if (options.stopOnce) delete options.stops [mnum];
        return;
    }
    if (elmed.paused && mnum == mnumStop) return;   // tick from pause() after stopping
    var r = msrRects [mnum], pn, br, n, nr;
    if (r.page + 1 > theSvgs.length) { // playback moves to page not loaded yet
        tickOpt = 0;                // catch every tick until new page is loaded
        return;
    }
    if (r.page != curPage) {        // jumping to a different page
        pn = rMark.parentNode;      // remove the cursor from the current page
        if (pn) pn.removeChild (rMark);
        pn = theSvgs [r.page]       // insert the cursor into the destination page
        pn.insertBefore (rMark, pn.firstChild);
        curPage = r.page;           // update current page
    }
    rMark.setAttribute ('x', r.x);  // position and resize the cursor
    rMark.setAttribute ('y', r.y);
    rMark.setAttribute ('width', r.sx);
    rMark.setAttribute ('height', r.sy);
    if (noScroll) return;
    tickOpt = 1;                    // selection set, enable tick optimzation
    n = document.getElementById ('notation');   // now handle scrolling
    nr = n.getBoundingClientRect ();            // position notation area relative to viewport
    br = rMark.getBoundingClientRect ();        // same of the cursor rectangle
    if (br.bottom > nr.bottom - scrollMargin)   // bottom cursor below bottom notation area (- margin !!)
        n.scrollTop += br.top - nr.top - scrollMargin;
    if (br.top < nr.top)                        // top cursor above top notation area
        n.scrollTop += br.top - nr.top - scrollMargin;
}

function readSvg (svg) {
    var n = document.getElementById ('notation');
    n.innerHTML += svg; // concatenate all svgs into the notation area
}

function readMpos (xmltxt) {
    var xmldom = $.parseXML (xmltxt);   // dom tree
    var $xml = $(xmldom);               // make a jquery element of the dom tree
    var es = $xml.find ('score>elements>element');  // get all measure recangles
    var npages = 0;                     // number of svg pages
    var scale = options.dpi / 300;
    var xprev = Infinity;               // x-coor of previous measure
    var nline = 0;                      // count score lines
    for (var i = 0; i < es.length; ++i) {
        var e = es [i];
        var mrect = {                   // extract data for each measure rectangle
            x: e.getAttribute ('x') / scale,
            y: e.getAttribute ('y') / scale,
            sx: e.getAttribute ('sx') / scale,
            sy: e.getAttribute ('sy') / scale,
            page: parseInt (e.getAttribute ('page'))
        }
        if (mrect.x < xprev) {          // begin of a new line
            line2msr1.push (i);         // i is first measure of line nline
            nline += 1;
        }
        msr2line.push (nline - 1);      // measure i belongs to line nline-1
        xprev = mrect.x
        msrRects.push (mrect);          // store all rectangles
        if (mrect.page > npages) npages = mrect.page;   // hightest page -> number of svg files needed
    }


    if (options.mt=='local') {
      var kig = document.createElement('span');
      kig.innerHTML = ''
      var lst = localStorage.getItem('mpostimes'+"_"+location.href.split('&')[0].split('/').pop()).split(",");
      for (var i = 0; i < lst.length; i++) {
        console.log(lst[i]);
        kig.innerHTML += lst[i]
      }
      document.body.appendChild(kig);
      es = $.find('body>span>event');}
      else if ($.find('event').length>0) {es = $.find('event')}

    else {es = $xml.find ('score>events>event');} // get all measure starting times
    console.log(es);
    console.log(es[1]);
    for (i = 0; i < es.length; ++i) {
        maten.push (es [i].getAttribute ('elid'));      // index into msrRects for each time point
        times.push (es [i].getAttribute ('position'));  // milliseconds for each starting time
    }
    times.push (Infinity);  // barrier for searching later on
    for (i in options.stops) {  // lag correction for measures in option.stops
        times [i] = 1 * times [i] + options.blib;
    }
    return parseInt (npages) + 1;
}

function readMusicXML (xmltxt) {
    var xmldom = $.parseXML (xmltxt);   // dom tree
    var $xml = $(xmldom);               // make a jquery element of the dom tree
    xmlWidth = $xml.find ('page-width').text ();
    xmlMm = $xml.find ('millimeters').text ();


    var repeatmeasures = $xml.find ('repeat');

    for (var i = 0; i < repeatmeasures.length; i++) {
      var repnum = $xml.find('repeat')[i].closest('measure').getAttribute('number');
      var repdir = $xml.find('repeat')[i].getAttribute('direction');
      console.log(repnum, repdir);
      document.getElementById('repeats').innerHTML += repnum + "|" + repdir + ",";

      }

}

function scoreClick (evt) {
    var x, xp, y, yp, scale, svgBox, i, r, page;
    evt.preventDefault ();
    evt.stopPropagation();
    spdElm.blur ();
    for (page = 0; page < theSvgs.length; ++page)   // find page where click comes from
        if (this == theSvgs [page]) break;          // this == svg where clicked
    y = evt.clientY;                // position click relative to viewport (browser window client area)
    x = evt.clientX;                // position click relative to viewport
    svgBox = this.getBoundingClientRect (); // relative to viewport (this == svg)
    x -= svgBox.left;               // x, y relative to svgBox
    y -= svgBox.top;
    scale = svgWidth / svgBox.width;
    xp = x * scale;                 // xp, yp now in svg coordinates
    yp = y * scale;
    for (i = 0; i < msrRects.length; ++i) { // find rectangle in which click point lies
        r = msrRects [i];
        if (r.page < page) continue;        // wrong page
        if (yp > r.y + r.sy) continue;      // click was on a lower rect
        if (xp > r.x + r.sx) continue;      // click was more to the right
        if (elmed.error == null) setTime (i);   // -> putMark, because tick is called by setting currentTime
        else putMark (i);           // no media loaded or error, but still put the marker
        break;
    }
}

function setTime (mix) {                            // measure index in msrRects
    mnumStop = -1;  // don't do any stopping when manual positioning
    if (msrRects [mix].page + 1 > theSvgs.length) { // page is not loaded yet
        return; // impatient user tried to move cursor to unloaded page
    }
    for (var i = 0; i < maten.length; ++i)  {       // measure array from mpos (includes repeats)
        if (maten [i] == mix) {                     // first occurrence for the measure in time order
            elmed.currentTime = (1 * times [i] + 10) / 1000;   // currentTime in seconds
            break;                  // * 1 == integer conversion, 10 == avoid measure border
        }
    }
}

function tick () {  // position cursor at current player time point
    var t = elmed.currentTime * 1000;   // mpos times are in millisecs
    if (tickOpt && t >= times [curtix] && t < times [curtix + 1]) return;  // optimization
    for (var i = 0; i < times.length; ++i) {    // dumb search
        if (times [i] < t) continue;    // first measure where staring time > currentTime
        curtix = i - 1                  // previous measure is the right one
        putMark (maten [curtix]);       // put the cursor there
        break;
    }
}

function gotoMsrOnLine (mnumDelta, line) {  // go to (first measure on line + mnumDelta)
    var mfirst = line2msr1 [line];      // first measure on line
    var nxtline = line < line2msr1.length - 1 ? line + 1 : 0;
    var mlast = line2msr1 [nxtline] - 1;            // last measure on line
    if (nxtline == 0) mlast = msr2line.length - 1;  // when wrapped to line 0
    var mnum = mfirst + mnumDelta;      // destination measure
    if (mnum > mlast) mnum = mlast;     // limit to last measure on line
    setTime (mnum);
}

function goUpDown (updown) {            // go one score line up or down
    var mnum = maten [curtix];          // current measure number
    var curline = msr2line [mnum];      // current score line
    var nxtline = curline + updown;     // next line
    if (nxtline > line2msr1.length - 1) nxtline = 0;    // wrap
    if (nxtline < 0) nxtline = line2msr1.length - 1;    // wrap
    var mnum1 = line2msr1 [curline];    // first measure on current line
    gotoMsrOnLine (mnum - mnum1, nxtline);
}

function keyDown (evt) {
    if (evt.target == spdElm) {
        if (evt.key != ' ') return; // default key handling is done by the speed input
        spdElm.blur (); // take the focus from the speed input when playing starts
    }
    var n = document.getElementById ('notation'), k, curline, nxtline, mnum1, mnum, nxtmnum1, nxtmnum;
    switch (evt.key) {
    case ' ': case 'Spacebar':
        evt.preventDefault ();  // prevent default scrolling of document
        if (elmed.paused) elmed.play ();
        else elmed.pause ();
        break;
    case 'ArrowLeft': case 'Left':  // setTime changes currentTime -> tick -> putMark
        k = maten [curtix] - 1;
        setTime (k < 0 ? msrRects.length - 1 : k);
        break;
    case 'ArrowRight': case 'Right':
        k = 1 * maten [curtix] + 1; // 1 * converts string to number
        setTime (k == msrRects.length ? 0 : k);
        break;
    case 'ArrowUp': case 'Up':
        if (evt.ctrlKey) { setSpeed (0.05); return };
        goUpDown (-1)
        break;
    case 'ArrowDown': case 'Down':
        if (evt.ctrlKey) { setSpeed (-0.05); return };
        goUpDown (1)
        break;
    case 'PageUp':
        n.scrollTop -= n.clientHeight;
        break;
    case 'PageDown':
        n.scrollTop += n.clientHeight;
        break;
    }
}

function setSpeed (n) {
    if (n != 1) spdElm.value = (1 * spdElm.value + n).toFixed (2);    // value is a string!
    if (!spdElm.checkValidity ()) { spdElm.value = 1.0 };
    options.speed = spdElm.value;
    elmed.playbackRate = options.speed;
}

function readUrlFiles (basename, svgPageCount, user) {   // read all needed files with given basename
    var npages, page, flsite, fldir, https = 'https://';
    var userdata = user.replace('/'+basename,'');
    var host = userdata.split(/[/]+/).pop();
    var username = userdata.replace('/'+host,'');

    if (host.toLowerCase()=='c') {
     flsite = https+"raw.codeberg.page/"+username+"/pages/"+basename+"/";
     //fldir = "/pages/";
    }
    if (host.toLowerCase()=='s') {
     flsite = https+username+".surge.sh/"+basename+"/";
     //fldir = "/pages/";
    }

    //console.log(host);
    //console.log(username);
    //console.log(flsite);

    function padNum (n) {
        var digits = npages > 99 ? 3 : npages > 9 ? 2 : 1;
        return n.toString().padStart (digits, 0);
    }
    function parseFile (ext, txt) { // also chains file reads (calls to getFile)
        if (ext == '.svg') {
            readSvg (txt);
            prepareSvgs (page);
            if (options.counter) $('#comp').html (npages - page);   // update downcounter during load
            page += 1;                      // see if we got all pages, else read next svg
            if (npages >= page) getFile (flsite, basename, basename + '-' + padNum (page), '.svg');
            else $('#comp').remove ();      // remove downcounter after loading
        } else if (ext == '.mpos') {
            npages = readMpos (txt);
            if (svgPageCount > npages) npages = svgPageCount;
            page = 1;                       // continue reading the svg pages
            getFile (flsite, basename, basename + '-' + padNum (page), '.svg');
        } else if (ext == '.xml') {
            readMusicXML (txt);
            getFile (flsite, basename, basename, '.mpos');    // continue reading the mpos file
        }
    }
    function getFile (flsite, subname, name, ext) {
    //console.log(flsite);
               // use jquery $.get (wrapper for XMLHTTPrequest)
        $.get (
        //  "ScoreData/"+subname+"/"+name + ext, '', null, 'text'
        flsite+name + ext, '', null, 'text'
        )
        .done (function (data, status) {
            parseFile (ext, data);
        }).fail (function (jqxhr, textStatus, errorThrown) {
            if (jqxhr.status != 0)          // XHR response status code > 0 (e.g. 404)
                document.title = "404 Error"
                alert ('cannot load file: ' + name + ext + '\nstatus: ' + jqxhr.status);
                //window.location.assign("scores.html?"+name+"|"+"remove")
        });
    }
    $('#notation').html ('<div id="comp"></div>');  // add temporary page downcounter
    $('#comp').css ({ position:"absolute", "z-index":9, right:"0px" }); // overlay in top-right corner
    // we read all files in sequence
    if (options.lsp && options.pw) getFile (flsite, basename, basename, '.mpos')   // skip xml file
    else getFile (flsite, basename,  basename, '.xml')  // start with reading MusicXml file
    elmed = document.getElementById ('aud');        // get the audio element
    if (options.aud) {var instances = ['vid.puffyan.us', 'inv.riverside.rocks', 'invidious.slipfox.xyz', 'youtube.076.ne.jp']; var rint = Math.floor(Math.random() * (instances.length) + 0); var rinst = instances [rint]; elmed.src = 'https://'+rinst+"/latest_version?id="+options.aud+"&itag=22&local=true";}
    else {elmed.src = flsite+basename + '.mp3';}               // supply the media file
    elmed.addEventListener ('timeupdate', tick);    // when currentTime changes -> update music cursor
    spdElm = document.getElementById ('speed');
    spdElm.value = options.speed;
    spdElm.addEventListener ('change', function () { setSpeed (1) });
    setSpeed (1);
}

$(document).ready (function () {
    var parstr, ps, i, r, p, svgPageCount = 0, basename = '', host = '';
    try {
     parstr = ['',document.getElementById('url').title];} catch (e) {try {parstr = ['',document.getElementById('url').value];}
    catch (e) {
      parstr = window.location.href.split ('?');  // parse the URL for "basename" and parameters
     }
    }

    console.log(parstr);

    if (parstr.length > 1) {
        ps = parstr [1].split ('&');
        for (i = 0; i < ps.length; i++) {
            p = ps [i];
            if      (r = p.match (/npages=([\d]+)/)) svgPageCount = parseInt (r[1]);
            else if (r = p.match (/dpi=([\d]+)/)) options.dpi = parseInt (r[1]);
            else if (p == 'noScroll') options.noScroll = 1;
            else if (p == 'Scroll') options.noScroll = 0;
            else if (r = p.match (/stops=([\d,]+)/))
                [...r[1].matchAll (/([\d]+),?/g)].forEach (x => options.stops [x [1]] = 1);
            else if (p == 'stopOnce') options.stopOnce = 1;
            else if (r = p.match (/blib=([+-]?[\d]+)/)) options.blib = parseInt (r[1]);
            else if (p == 'counter') options.counter = 1;
            else if (r = p.match (/lsp=([\d.]+)/)) options.lsp = parseFloat (r[1]);
            else if (r = p.match (/pw=([\d.]+)/)) options.pw = parseFloat (r[1]);
            else if (r = p.match (/stflns=([\d])/)) options.stflns = parseInt (r[1]);
            else if (r = p.match (/speed=([\d.]+)/)) options.speed = parseFloat (r[1]);
            else if (r = p.match (/tc=([A-Z-a-z0-9#-]+)/)) options.tc = r[1];
            else if (r = p.match (/tcop=([\d.]+)/)) options.tcop = parseFloat (r[1]);
            else if (r = p.match (/sm=([\d.]+)/)) options.sm = parseFloat (r[1]);
            else if (r = p.match (/bgc=([A-Z-a-z0-9#-]+)/)) options.bgc = r[1];
            else if (p == 'showAudio') options.showAudio = 1;
            else if (r = p.match (/download=([A-Z-a-z3,]+)/)) options.download = r[1];
            else if (p == 'download') options.download = 1;
            else if (r = p.match (/aud=([A-Z-a-z0-9#-/:._%]+)/)) options.aud = r[1];
            else if (r = p.match (/mt=([A-Z-a-z0-9#-/:._%]+)/)) options.mt = r[1];
            else if (r = p.match (/[^=]+/)) basename = p;
        }

        var user = basename;
        basename = basename.split(/[/]+/).pop();
        options.bname = basename;



        if (options.download) {
          var urlparams = window.location.href.split('?')[1].replace("&download=", '&what=').replace("&download", '');
          //console.log( urlparams);
          window.location.assign("download.html?"+urlparams);
        }

        var dots = ".";
        var loadmessage = document.createElement('span');
        loadmessage.classList.add('abmid');
        loadmessage.id = 'loadmessage';
        document.body.prepend(loadmessage);
        loadmessage.innerHTML = "Loading "+basename+dots;

        var animatedots = setInterval(function(){
          if (dots.length>=3) {
            dots = ".";
          }
          else {
            dots += ".";
          }
          loadmessage.innerHTML = "Loading "+basename+dots;

        }, 800)


        //loadmessage.innerHTML = "Loading "+basename+dots;

        //document.title = "Loading "+basename+"...";

        if (basename) readUrlFiles (basename, svgPageCount, user, host);   // read all needed files

    }
    document.body.addEventListener ('keydown', keyDown);
    $('#aud').on ('keydown keyup', function (evt) {
        if (evt.ctrlKey || evt.shiftKey || evt.altKey || evt.metaKey) return;
        evt.preventDefault ();  // prevent default key handling which conflicts with our keyDown
    });
    $('#notation').scrollTop (0);   // Firefox does not reset the scrollTop when reloading the document
});

window.addEventListener('resize', ()=> {
  resize();
})

function resize() {
  var prcnt = document.getElementById('btns').offsetHeight/window.innerHeight*100;
  //console.log(window.innerHeight, document.getElementById('btns').offsetHeight, document.getElementById('btns').offsetHeight/window.innerHeight*100);
  document.getElementById('notation').style.height = JSON.stringify(100 - prcnt) + "%";
  //console.log(document.getElementById('notation').style.height);

}
