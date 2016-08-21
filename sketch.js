var DEFAULT_RULES;
var DEFAULT_ENVSIZE;
var DEFAULT_SEED;
var DEFAULT_TEMPO;


var SCALE;
var CANVAS_WIDTH;
var CANVAS_HEIGHT;


var ca;
var caGraphics

var scroller = 0;


function setup() {
  //initializing global vars
  DEFAULT_RULES = new Array(0, 0, 0, 1, 1, 0, 1, 0);
  DEFAULT_ENVSIZE = 80;
  DEFAULT_SEED = new Array(1, 1); //for some reason putting only 1 seed in does not create the array so you have to put it in twice
  DEFAULT_TEMPO = 2; //beats / sec
  
  CANVAS_WIDTH = windowWidth;
  CANVAS_HEIGHT = windowHeight;
  SCALE = 8;
  
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  background(240);
  frameRate(DEFAULT_TEMPO);
  
  caGraphics = createGraphics(CANVAS_WIDTH, CANVAS_HEIGHT);
  
  ca = new CA(DEFAULT_RULES, DEFAULT_SEED, DEFAULT_ENVSIZE); //how do I initialie this?
}

function draw() {
  
  clear();
  
  ca.render(); // Draw the current gen's cells and plays a chord
  ca.reRender(); // reDraw the previous gens cells without a highlight
  ca.generate(); // Generate the state values for next frame
  
  //draws a "highlight" rectangle on the level currently being played/rendered
  caGraphics.fill(0, 100, 0 , 50);
  caGraphics.rect(0, generation * SCALE - SCALE, 640, SCALE)
  
  scroller -= 2 * SCALE;
  image(caGraphics, 0, CANVAS_HEIGHT / 2 + scroller);
  
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
    for (var i = 1; i < cells.length - 1; i++) {
      cells[i] = nextgen[i];
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