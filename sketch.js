var DEFAULT_RULES;
var DEFAULT_ENVSIZE;
var DEFAULT_SEED;
var DEFAULT_TEMPO;
var DEFAULT_MUSICAL_SCALE;

var SCALE;
var CANVAS_WIDTH;
var CANVAS_HEIGHT;


var ca;
var caGraphics;

var scroller = 0;
var loaded = false;

function setup() {
  
	MIDI.loadPlugin({
		soundfontUrl: "./soundfont/",
		instrument: "acoustic_grand_piano", // or multiple instruments
		onsuccess: function() {
		  loaded = true;
  		}
	});
  
  
  
  //initializing global vars
  DEFAULT_RULES = [1, 0, 0, 1, 1, 0, 1, 0];
  DEFAULT_ENVSIZE = 20;
  DEFAULT_SEED = [1]; 
  DEFAULT_TEMPO = 5; //beats / sec
  DEFAULT_MUSICAL_SCALE = [1,3,5,8] // minor
  //[1, 3, 4, 6, 8, 9, 11] // minor
  //[0, 3, 5, 6, 7, 10]; //blues

  SCALE = 8;

  CANVAS_WIDTH = SCALE * DEFAULT_ENVSIZE * 2;
  CANVAS_HEIGHT = 300;
  
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  background(240);
  frameRate(DEFAULT_TEMPO);
  
  caGraphics = createGraphics(CANVAS_WIDTH, 10000);
  
  ca = new CA(DEFAULT_RULES, DEFAULT_SEED, DEFAULT_ENVSIZE); //how do I initialie this?
}

function draw() {
  
  if(loaded) {
    
    clear();
    
    ca.render(); // Draw the current gen's cells and plays a chord
    ca.reRender(); // reDraw the previous gens cells without a highlight
    ca.generate(); // Generate the state values for next frame
    
    //draws a "highlight" rectangle on the level currently being played/rendered
    caGraphics.fill(0, 100, 0 , 50);
    caGraphics.rect(0, generation * SCALE - SCALE, SCALE * DEFAULT_ENVSIZE, SCALE)
    
    
    if(generation * SCALE >= CANVAS_HEIGHT / 2) {
      scroller -= SCALE;
      image(caGraphics, 0, scroller, 0, 0);
    } else {
      image(caGraphics, 0, 0);
    }
  }  
}

function CA(rules, seed, enviroSize) {
  this.rules = new Array(rules);
  this.seed = new Array(seed);
  var cells = []; //current generation's cell array
  var lastGen = []; //last generation's cell array
  generation = 0;
  scl = SCALE; //perhaps this should be adjusted live in the render function to make the CA horizontally flush with the canvas 

  //sets all cells to dead state (0)
  for (var i = 0; i < enviroSize; i++) {
    cells[i] = 0;
  }

  //sets the specified seed cells in cells[] to the alive state
  for (var j = 0; j < seed.length; j++) {
    cells[seed[j]] = 1;
  }



  this.render = function() {
    //render cells[] into visual at this generation (generation controls y value)
    this.drawCells();
    //render cells[] into audio at this generation (call ScaleMapper)
    this.playChord();
  }

  this.drawCells = function() {
    for (var i = 0; i < cells.length; i++) {
      if (cells[i] == 1) {
        caGraphics.fill(0);
      } else {
        caGraphics.fill(240); // 240
      }
      caGraphics.noStroke();
      caGraphics.rect(i * scl, generation * scl, scl, scl);
    }
  }

  this.playChord = function() {
    var pitches = [];
    var index = 0;
    for(var i = 0; i < cells.length; i++) {
      if(cells[i] == 1) {
        pitches[index++] = this.scaleMap(i + 18, DEFAULT_MUSICAL_SCALE);
      }
    }
    print(pitches);
    MIDI.setVolume(0, 127);
		MIDI.chordOn(0, pitches, 70, 0);
		MIDI.chordOff(0, pitches, .1);
    //                         ^ this is the duration of chord
    //                          it should ideally adjust with tempo
  }
  
  //mode is "scale" array
  this.scaleMap = function(pitch, mode) {
    var octave = Math.floor(pitch / (mode.length + 1)) * 12;  
    var offset = round(mode[(pitch - 1) % (mode.length)]);
    return offset + octave;
  }
  
  
  //the purpose of this function is to use the stored lastGen cell states and redraw the last generation 
  //over what is currently on the canvas to get rid of the highlight
  this.reRender = function() {
    generation--;
    for (var i = 0; i < lastGen.length; i++) {
      if (lastGen[i] == 1) {
        caGraphics.fill(0);
      } else {
        caGraphics.fill(240); // 240
      }
      caGraphics.noStroke();
      caGraphics.rect(i * scl, generation * scl, scl, scl);
    }
    generation++;
  }









  this.generate = function() {
    //generate the new cells[] for this generation using the last generation and the ruleset
    //and increment the generation by one

    // First we create an empty array for the new values
    var nextgen = [];
    
    //set the lastGen array as a copy of cells before we change cells to the nextgen
    arrayCopy(cells,0,lastGen,0,enviroSize);
    
    // For every spot, determine new state by examing current state, and neighbor states
    // Ignore edges that only have one neighor
    for (var i = 1; i < cells.length - 1; i++) {
      var left = cells[i - 1]; // Left neighbor state
      var me = cells[i]; // Current state
      var right = cells[i + 1]; // Right neighbor state
      nextgen[i] = this.executeRules(left, me, right); // Compute next generation state based on ruleset
    }
    // Copy the array into current value
    for (var j = 1; j < cells.length - 1; j++) {
      cells[j] = nextgen[j];
    }
      generation++;
  }

  this.executeRules = function(a, b, c) {
    if (a == 1 && b == 1 && c == 1) {
      return rules[0];
    }
    if (a == 1 && b == 1 && c === 0) {
      return rules[1];
    }
    if (a == 1 && b === 0 && c == 1) {
      return rules[2];
    }
    if (a == 1 && b === 0 && c === 0) {
      return rules[3];
    }
    if (a === 0 && b == 1 && c == 1) {
      return rules[4];
    }
    if (a === 0 && b == 1 && c === 0) {
      return rules[5];
    }
    if (a === 0 && b === 0 && c == 1) {
      return rules[6];
    }
    if (a === 0 && b === 0 && c === 0) {
      return rules[7];
    }
    return 0;
  }

}