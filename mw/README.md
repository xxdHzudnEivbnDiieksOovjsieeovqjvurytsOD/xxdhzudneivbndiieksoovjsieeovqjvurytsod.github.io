###A web player for MuseScore.

*Mscweb* is a web player that shows a musical score with a cursor synchronized to an *mp3* file.
Both the score and *mp3* are exported from MuseScore.

You can scroll and click in the score to reposition the cursor, or drag the player progress bar.
The player scrolls up or down when needed to keep the cursor in view.
When you have a keybord, the space bar starts/pauses playback and the arrow keys also reposition the
cursor.

###Examples
- [Simple Cycle of fifths Elaboration][2] (Bernard Greenberg)
- [BWV 12/7][3] (Gertim Alberda)

###Usage
The player consists of two files:

- mscweb.html
- mscweb.js

These two files need to be in the same directory (on a web server or just in your local file system).
When you open *mscweb.html* with a browser, you have to append the *base name* of the file you want
to play to the URL (or to the local file path), as follows:

- `.../mscweb.html?basename`

The program then loads the following files in sequence:

- basename.xml
- basename.mpos
- basename-1.svg
- \...
- basename-n.svg

and installs 

- basename.mp3

in the audio player on the web page.

All these files need to be in the same directory as the player.
(or in a subdirectory, when you prepend the directory name to the basename in the URL)

The files can be exported from MuseScore. The *.xml*, *.mp3* and *.svg* formats are alreay present
in the export dialog of MuseScore. Only the *.mpos* file is special.
You have to type the .mpos extension manually
in the file name field of the export dialog (for instance, while exporting a MusicXML file).
MuseScore then silently exports this special file[^1].

The *MusicXML* format has a default extension of *.musicxml* in newer versions of MuseScore.
You can change the extension to *.xml* before exportation in the file type drop down list.

The SVG files exported by MuseScore are named *basename-n.svg* (where n is a positive integer).
You should not change these names. *Mscweb* expects them as MuseScore exports them. When exporting
more than 9 files, MuseScore pads the lower numbers, like 01, 02, ..., which is likewise expected
by *mscweb*.

### Important
The data in the .mpos file depends on the setting of the resolution for *.png* files.
You can find this resolution in the settings dialog of MuseScore (*Menu Edit/Preferences/tab Export*).

***mscweb*** **assumes that the .mpos file is exported with a *png* resolution setting of**
***300 dots per inch***.
If you have a different resolution setting, then you must add the parameter *&dpi=your_resolution* to
the URL of *mscweb*. For example, with a setting of *600 dpi*:

`.../mscweb.html?basename&dpi=600`

### URL parameters

- dpi=&lt;integer&gt;

Needed when the *.png* resolution in MuseScore differs from *300 dpi*. Should be set to the value
of the *.png* resolution as given in the settings dialog of MuseScore at the time when
the .mpos was exported.

- npages=&lt;integer&gt;

This parameter will be necessary when there are trailing pages that do not contain 
measures of music, e.g., text or pictures. If it is not supplied, 
*mscweb* will assume that the last page is the one containing the last measure of music, 
and additional trailing pages will not appear.

The integer should be the total number of pages to be displayed.

- noScroll

The presence of this parameter will inhibit *mscweb* from scrolling to the first measure
until playback is started or the score is clicked on. This feature is usefull to display
(and read) initial text above the first measure until playback is started.

- stops=m1,m2,...mn

This parameters accepts a comma separated (no spaces!) list of measure numbers. At those
measures playback will be paused and has to be resumed manually (pressing the space bar).

- blib=[+/-]nnn

Corrects the stop points with +nnn or -nnn milliseconds. The correction can compensate
for the latency of the pausing operation. A value of -100 to -200 avoids hearing the
attack of the next note after the pause (blib).

- stopOnce

When this option is present, the stop points are only executed once, until reload.
That is, when repositioning the cursor before a stop point where the player already
stopped once, it will not stop there anymore.

- pw=nnn.nn

Sets the page width of the score to nnn.nn millimeters. This is the same value
as shown in the page layout dialog of MuseScore.
Without this parameter the page width (and line space) are read from the .xml file.
But when both *pw* and *lsp* are specified, *mscweb* skips reading the .xml file.

- lsp=n.nn

Sets the line space. This is the space between two staff lines in millimeters. This is
the same value as shown in the page dialog of MuseScore.

- stflns=n

Sets the number of staff lines. Default value is 5.

- counter

When this parameter is present, a down counter will be visible in the top-right corner of
the score, while score pages are still being downloaded. The downcounter shows the 
number of pages still to be loaded. When all pages are loaded the counter disappears.

- speed=n.nn

Sets the playback speed (default 1.0). The value must be within the range 0.1 to 4.
If it is outside this range the parameter is ignored.

[^1]: mentioned in [musescore docs][1]

[1]:https://musescore.org/en/handbook/3/command-line-options#Batch_conversion_job_JSON_format
[2]:https://bernardgreenberg.com/Scores/6023045.html
[3]:https://www.bach-chorales.info/BachChorales/B340.html