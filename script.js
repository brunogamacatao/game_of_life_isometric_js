var initialCubes = 100;
var width        = 30;
var height       = 30;
var layers       = [];
var maxLayers    = 30;

var fps, fpsInterval, startTime, now, then, elapsed;
var canvas = document.getElementById("art");
var iso = new Isomer(canvas, {
  scale: 10,
  originY: canvas.height
});

var Point  = Isomer.Point;
var Path   = Isomer.Path;
var Shape  = Isomer.Shape;
var Vector = Isomer.Vector;
var Color  = Isomer.Color;

function drawGrid(xSize, ySize) {
  for (var x = 0; x < xSize + 1; x++) {
      iso.add(new Path([
          new Point(x, 0, 0),
          new Point(x, ySize, 0),
          new Point(x, 0, 0)
      ]), new Color(255, 255, 255));
  }

  for (var y = 0; y < ySize + 1; y++) {
      iso.add(new Path([
          new Point(0, y, 0),
          new Point(xSize, y, 0),
          new Point(0, y, 0)
      ]), new Color(140, 140, 140));
  }
}

function randRange(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min) + min)
}

function createFirstLayer() {
  var layer = [];
  for (var i = 0; i < initialCubes; i++) {
    layer.push({x: randRange(0, width), y: randRange(0, height)});
  }
  layers.push(layer);
}

const createBlankGrid = () => {
  let newGrid = [];

  for (let y = 0; y < width; y++) {
    newGrid.push(new Array(height).fill(0));
  }

  return newGrid;
};

function layerToGrid(layer) {
  var grid = createBlankGrid();

  for (var i = 0; i < layer.length; i++) {
    var point = layer[i];
    grid[point.y][point.x] = 1;
  }

  return grid;
}

const countNeighbors = (x, y, grid) => {
  let neighbors = 0;

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx != 0 || dy != 0) {
        let nx = x + dx;
        let ny = y + dy;
        if ((nx >= 0 && nx < width) &&
            (ny >= 0 && ny < height)) 
          neighbors += grid[ny][nx];
      }
    }
  }

  return neighbors;
};

function nextLayer() {
  var nextLayer = [];
  var lastLayer = layers[layers.length - 1];

  var grid = layerToGrid(lastLayer);
  var newGrid = createBlankGrid();

  // Rules
  /*
    1. Any live cell with fewer than two live neighbors dies, as if by underpopulation.
    2. Any live cell with two or three live neighbors lives on to the next generation.
    3. Any live cell with more than three live neighbors dies, as if by overpopulation.
    4. Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
  */

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let neighbors = countNeighbors(x, y, grid);
      if (grid[y][x] === 1) { // any life cell ...
        if (neighbors < 2) { // rule 1
          newGrid[y][x] = 0;
        } else if (neighbors === 2 || neighbors === 3) { // rule 2
          newGrid[y][x] = 1;
          nextLayer.push({x: x, y: y});
        } else { // rule 3
          newGrid[y][x] = 0;
        }
      } else { // any dead cell with three live neighbors - rule 4
        if (neighbors === 3) {
          newGrid[y][x] = 1;
          nextLayer.push({x: x, y: y});
        }
      }
    }
  }  
  
  layers.push(nextLayer);

  if (layers.length > maxLayers) {
    layers.shift();
  }
}


// the main draw function
function draw() {
  requestAnimationFrame(draw);

  now = Date.now();
  elapsed = now - then;

  if (elapsed > fpsInterval) {
    then = now - (elapsed % fpsInterval);
    iso.canvas.clear();


    drawGrid(width, height);
    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i];
      for (var j = 0; j < layer.length; j++) {
        var point = layer[j];
        iso.add(Shape.Prism(new Point(point.x, point.y, i)));
      }
    }

    nextLayer();
  }
}

function startAnimating(fps) {
  fpsInterval = 1000 / fps;
  then = Date.now();
  startTime = then;
  draw();
}

function main() {
  createFirstLayer();
  startAnimating(30);
}

main();