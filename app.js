// ==APP-LOGIC-START==

// Makes a new stopwatch. You can pass your own clock for testing;
// normally it uses the browser's precise clock.
function Stopwatch(clock){
  // The clock: a function that returns "now" in milliseconds.
  this.clock = clock || function(){ return (typeof performance!=='undefined'?performance.now():Date.now()); };
  this.reset(); // set everything to the starting state
}

// Puts the stopwatch back to zero and clears the laps.
Stopwatch.prototype.reset = function(){
  this.elapsed=0; // time banked from earlier runs
  this.running=false; // not ticking
  this.startAt=0; // no start time set
  this.laps=[]; // the lap list, empty
  this.lastLapTotal=0; // total time at the last lap, for working out splits
};

// Starts the stopwatch (does nothing if already running).
Stopwatch.prototype.start = function(){
  if(this.running) return; // already running? do nothing
  this.running=true; // now ticking
  this.startAt=this.clock(); // remember when this run started
};

// Stops the stopwatch and banks the time (does nothing if not running).
Stopwatch.prototype.stop = function(){
  if(!this.running) return; // not running? do nothing
  this.elapsed+=this.clock()-this.startAt; // add this run's time to the bank
  this.running=false; // stop ticking
};

// The total time right now, including the current run if ticking.
Stopwatch.prototype.time = function(){
  return this.elapsed+(this.running?this.clock()-this.startAt:0);
};

// Records a lap. Returns the lap entry (number, this lap's time, total time).
Stopwatch.prototype.lap = function(){
  var total=this.time(); // total time right now
  // Build the lap: its number, this lap's split, and the running total.
  var entry={n:this.laps.length+1, lapTime:total-this.lastLapTotal, total:total};
  this.laps.push(entry); // add it to the list
  this.lastLapTotal=total; // remember where this lap ended
  return entry; // hand the lap back
};

// Pads a number to two digits: 5 -> "05".
function pad2(n){return (n<10?'0':'')+n;}

// Turns milliseconds into "MM:SS.mmm" text.
function fmtSw(ms){
  ms=Math.max(0,Math.floor(ms)); // never negative, drop fractions
  // Split into minutes, seconds, milliseconds.
  var m=Math.floor(ms/60000), s=Math.floor(ms/1000)%60, milli=ms%1000;
  // Glue together, e.g. "02:05.340".
  return pad2(m)+':'+pad2(s)+'.'+('00'+milli).slice(-3);
}

// Same as fmtSw, but the milliseconds go in a <small> tag (for the grey look).
function fmtSwHtml(ms){
  ms=Math.max(0,Math.floor(ms)); // never negative, drop fractions
  var m=Math.floor(ms/60000), s=Math.floor(ms/1000)%60, milli=ms%1000;
  return pad2(m)+':'+pad2(s)+'<small>.'+('00'+milli).slice(-3)+'</small>';
}
// ==APP-LOGIC-END==

// Everything below only runs in a browser (not when testing the logic in Node).
if(typeof document!=='undefined'){
  var sw=new Stopwatch(); // the stopwatch itself
  // Grab the page pieces: the big time display, the state label,
  // the start button, and the laps area.
  var display=document.getElementById('display');
  var stateEl=document.getElementById('state');
  var startBtn=document.getElementById('startBtn');
  var lapsEl=document.getElementById('laps');
  // Redraws the time, label, and button from the stopwatch's state.
  function draw(){
    display.innerHTML=fmtSwHtml(sw.time()); // the big digits
    // The small label: Running, Stopped, or Ready.
    stateEl.textContent=sw.running?'Running':(sw.time()>0?'Stopped':'Ready');
    startBtn.textContent=sw.running?'Stop':'Start'; // button says what it will do
    startBtn.classList.toggle('running',sw.running); // red while running, green otherwise
  }
  // Redraws the laps table (latest lap first, fastest green, slowest red).
  function drawLaps(){
    // No laps yet? Show the friendly empty message.
    if(!sw.laps.length){lapsEl.innerHTML='<div id="empty">No laps yet — hit Lap while running.</div>';return;}
    var times=sw.laps.map(function(l){return l.lapTime;}); // just the split times
    var fast=Math.min.apply(null,times), slow=Math.max.apply(null,times); // fastest and slowest
    // Build the table, newest lap first.
    var h='<table><tr><th>Lap</th><th>Lap time</th><th>Total</th></tr>';
    for(var i=sw.laps.length-1;i>=0;i--){
      var l=sw.laps[i]; // this lap
      // Color the row green if fastest, red if slowest (needs at least 2 laps).
      var cls=(sw.laps.length>1&&l.lapTime===fast)?' class="fastest"':((sw.laps.length>1&&l.lapTime===slow)?' class="slowest"':'');
      h+='<tr'+cls+'><td>'+l.n+'</td><td>'+fmtSw(l.lapTime)+'</td><td>'+fmtSw(l.total)+'</td></tr>';
    }
    lapsEl.innerHTML=h+'</table>'; // put the table on the page
  }
  var raf=null; // holds the screen-refresh loop, when running
  // The loop: redraw, then ask the browser to call us again next frame.
  function loop(){draw();raf=requestAnimationFrame(loop);}
  // Start/Stop button: stop the loop when stopping, start it when starting.
  startBtn.addEventListener('click',function(){
    if(sw.running){sw.stop();cancelAnimationFrame(raf);raf=null;}
    else{sw.start();if(!raf)loop();}
    draw();
  });
  // Lap button: record a lap (ignored if the clock never started).
  document.getElementById('lapBtn').addEventListener('click',function(){
    if(!sw.running&&sw.time()===0) return;
    sw.lap();drawLaps();
  });
  // Reset button: stop everything, clear the stopwatch and the laps.
  document.getElementById('resetBtn').addEventListener('click',function(){
    if(raf){cancelAnimationFrame(raf);raf=null;}
    sw.reset();draw();drawLaps();
  });
  draw(); // draw once right away so the page isn't blank
}
