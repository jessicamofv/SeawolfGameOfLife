/*
 * Conway's Game of Life (Seawolf Edition)
 * 
 * This JavaScript file should contain the full implementation of
 * our Game of Life simulation. It does all data management, including
 * updating the game grid, as well as controlling frame rate timing
 * and all rendering to the canvas.
 * 
 * Authors: Richard McKenna & Jessica Mortellaro
 */

// GAME OF LIFE GLOBAL CONSTANTS & VARIABLES

// CONSTANTS
var DEAD_CELL;
var LIVE_CELL;
var LIVE_COLOR;
var GRID_LINES_COLOR;
var TEXT_COLOR;
var MILLISECONDS_IN_ONE_SECOND;
var MAX_FPS;
var MIN_FPS;
var FPS_INC;
var FPS_X;
var FPS_Y;
var MAX_CELL_LENGTH;
var MIN_CELL_LENGTH;
var CELL_LENGTH_INC;
var CELL_LENGTH_X;
var CELL_LENGTH_Y;
var GRID_LINE_LENGTH_RENDERING_THRESHOLD;

// FRAME RATE TIMING VARIABLES
var timer;
var fps;

// CANVAS VARIABLES
var canvasWidth;
var canvasHeight;
var canvas;
var canvas2D;

// GRID VARIABLES
var gridWidth;
var gridHeight;
var updateGrid;
var renderGrid;

// RENDERING VARIABLES
var cellLength;

// PATTERN PIXELS
var patterns;
var imgDir;

// requirement 1
var isStarted;

// requirement 2
var isPaused;

// INITIALIZATION METHODS

/*
 * This method initializes the Game of Life, setting it up with
 * and empty grid, ready to accept additions at the request
 * of the user.
 */
function initGameOfLife()
{
    // INIT ALL THE CONSTANTS, i.e. ALL THE
    // THINGS THAT WILL NEVER CHANGE
    initConstants();
    
    // INIT THE RENDERING SURFACE
    initCanvas();
    
    // INIT ALL THE GAME-RELATED VARIABLES
    initGameOfLifeData();
    
    // LOAD THE PATTERNS FROM IMAGES
    initPatterns();
            
    // SETUP THE EVENT HANDLERS
    initEventHandlers();
            
    // RESET EVERYTHING, CLEARING THE CANVAS
    resetGameOfLife();
}

/*
 * This function initializes all the things that never change.
 */
function initConstants()
{
    // THESE REPRESENT THE TWO POSSIBLE STATES FOR EACH CELL
    DEAD_CELL = 0;   
    LIVE_CELL = 1; 
    
    // COLORS FOR RENDERING
    LIVE_COLOR = "#FF0000";
    GRID_LINES_COLOR = "#CCCCCC";
    TEXT_COLOR = "#7777CC";
    
    // FPS CONSTANTS
    MILLISECONDS_IN_ONE_SECOND = 1000;
    MAX_FPS = 33;
    MIN_FPS = 1;
    FPS_INC = 1;
    
    // CELL LENGTH CONSTANTS
    MAX_CELL_LENGTH = 128;
    MIN_CELL_LENGTH = 1;
    CELL_LENGTH_INC = 2;
    GRID_LINE_LENGTH_RENDERING_THRESHOLD = 8;
    
    // RENDERING LOCATIONS FOR TEXT ON THE CANVAS
    FPS_X = 20;
    FPS_Y = 450;
    CELL_LENGTH_X = 20;
    CELL_LENGTH_Y = 480;
}

/*
 * This method retrieves the canvas from the Web page and
 * gets a 2D drawing context so that we can render to it
 * when the time comes.
 */
function initCanvas()
{
    // GET THE CANVAS
    canvas = document.getElementById("game_of_life_canvas");
    
    // GET THE 2D RENDERING CONTEXT
    canvas2D = canvas.getContext("2d");
    
    // INIT THE FONT FOR TEXT RENDERED ON THE CANVAS. NOTE
    // THAT WE'LL BE RENDERING THE FRAME RATE AND ZOOM LEVEL
    // ON THE CANVAS
    canvas2D.font = "24px Arial";
    
    // NOTE THAT THESE DIMENSIONS SHOULD BE THE
    // SAME AS SPECIFIED IN THE WEB PAGE, WHERE
    // THE CANVAS IS SIZED
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
}

/*
 * This function initializes all the important game-related
 * variables, including the necessary data structures for
 * managing the game grid.
 */
function initGameOfLifeData()
{    
    // INIT THE TIMING DATA
    timer = null;
    fps = MAX_FPS;

    // INIT THE CELL LENGTH
    cellLength = MIN_CELL_LENGTH;
}

/*
 * This method initializes all the patterns that the user
 * may put into the simulation. This is done by reading in
 * the images listed in the drop-down list, and then examining
 * the contents of those images, considering anything that is
 * not white as a "LIVE_CELL". Note that this allows us to
 * easily add any new image we like as a pattern.
 */
function initPatterns()
{
    // THIS IS WHERE ALL THE IMAGES SHOULD BE
    imgDir = "/img/";
    
    // THIS WILL STORE ALL THE PATTERNS IN AN ASSOCIATIVE ARRAY
    patterns = new Array();
    
    // GET THE DROP DOWN LIST
    var patternsList = document.getElementById("game_of_life_patterns");
    
    // GO THROUGH THE LIST AND LOAD ALL THE IMAGES
    for (var i = 0; i < patternsList.options.length; i++)
        {
            // GET THE NAME OF THE IMAGE FILE AND MAKE
            // A NEW ARRAY TO STORE IT'S PIXEL COORDINATES
            var key = patternsList.options[i].value;
            var pixelArray = new Array();
            
            // NOW LOAD THE DATA FROM THE IMAGE
            loadOffscreenImage(key, pixelArray);
            
            // AND PUT THE DATA IN THE ASSIATIVE ARRAY,
            // BY KEY
            patterns[key] = pixelArray;
        }
}

/*
 * This function initializes all the event handlers, registering
 * the proper response methods.
 */
function initEventHandlers()
{
    // WE'LL RESPOND TO MOUSE CLICKS ON THE CANVAS
    canvas.onclick = respondToMouseClick;
    
    // AND ALL THE APP'S BUTTONS
    // requirement 1
    document.getElementById("start_button").onclick=startGameOfLife;
    // requirement 2
    document.getElementById("pause_button").onclick=pauseGameOfLife;
    document.getElementById("reset_button").onclick=resetGameOfLife;
    document.getElementById("dec_cell_length_button").onclick=decCellLength;
    document.getElementById("inc_cell_length_button").onclick=incCellLength;
    // requirement 3
    document.getElementById("dec_fps_button").onclick=decFPS;
    document.getElementById("inc_fps_button").onclick=incFPS;
}

/*
 * This function loads the image and then examines it, extracting
 * all the pixels and saving the coordinates that are non-white.
 */
function loadOffscreenImage(imgName, pixelArray)
{    
    // FIRST GET THE IMAGE DATA
    var img = new Image();
    
    // NOTE THAT THE IMAGE WILL LOAD IN THE BACKGROUND, BUT
    // WE CAN TELL JavaScript TO LET US KNOW WHEN IT HAS FULLY
    // LOADED AND RESPOND THEN.
    img.onload = function() { respondToLoadedImage(imgName, img, pixelArray); };
    
    // document.URL IS THE URL OF WHERE THE WEB PAGE IS FROM WHICH THIS
    // JavaScript PROGRAM IS BEING USED. NOTE THAT ASSIGNING A URL TO
    // A CONSTRUCTED Image's src VARIABLE INITIATES THE IMAGE-LOADING
    // PROCESS
    var path = document.URL;
    var indexLocation = path.indexOf("index.html");
    path = path.substring(0, indexLocation);
    img.src = path + imgDir + imgName;
}

// EVENT HANDLER METHODS

/*
 * This method is called in response to an Image having completed loading. We
 * respond by examining the contents of the image, and keeping the non-white
 * pixel coordinates in our patterns array so that the user may use those
 * patterns in the simulation.
 */
function respondToLoadedImage(imgName, img, pixelArray)
{
    // WE'LL EXAMINE THE PIXELS BY FIRST DRAWING THE LOADED
    // IMAGE TO AN OFFSCREEN CANVAS. SO FIRST WE NEED TO
    // MAKE THE CANVAS, WHICH WILL NEVER ACTUALLY BE VISIBLE.
    var offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = img.width;
    offscreenCanvas.height = img.height;
    var offscreenCanvas2D = offscreenCanvas.getContext("2d");
    offscreenCanvas2D.drawImage(img, 0, 0);
    
    // NOW GET THE DATA FROM THE IMAGE WE JUST DREW TO OUR OFFSCREEN CANVAS
    var imgData = offscreenCanvas2D.getImageData( 0, 0, img.width, img.height );
    
    // THIS WILL COUNT THE FOUND NON-WHITE PIXLS
    var pixelArrayCounter = 0;
   
    // GO THROUGH THE IMAGE DATA AND PICK OUT THE COORDINATES
    for (var i = 0; i < imgData.data.length; i+=4)
        {
            // THE DATA ARRAY IS STRIPED RGBA, WE'LL IGNORE 
            // THE ALPHA CHANNEL
            var r = imgData.data[i];
            var g = imgData.data[i+1];
            var b = imgData.data[i+2];
            
            // KEEP THE PIXEL IF IT'S NON-WHITE
            if ((r < 255) && (g < 255) && (b < 255))
                {
                    // CALCULATE THE LOCAL COORDINATE OF
                    // THE FOUND PIXEL. WE DO THIS BECAUSE WE'RE
                    // NOT KEEPING ALL THE PIXELS
                    var x = Math.floor((i/4)) % img.width;
                    var y = Math.floor(Math.floor((i/4)) / img.width);
                    
                    // STORE THE COORDINATES OF OUR PIXELS
                    pixelArray[pixelArrayCounter] = x;
                    pixelArray[pixelArrayCounter+1] = y;
                    pixelArrayCounter += 2;
                }            
        }    
}

/*
 * This is the event handler for when the user clicks on the canvas,
 * which means the user wants to put a pattern in the grid at
 * that location.
 */
function respondToMouseClick(event)
{
    // GET THE PATTERN SELECTED IN THE DROP DOWN LIST
    var patternsList = document.getElementById("game_of_life_patterns");
    var selectedPattern = patternsList.options[patternsList.selectedIndex].value;
    
    // LOAD THE COORDINATES OF THE PIXELS TO DRAW
    var pixels = patterns[selectedPattern];
    
    // CALCULATE THE ROW,COL OF THE CLICK
    var canvasCoords = getRelativeCoords(event);
    var clickCol = Math.floor(canvasCoords.x/cellLength);
    var clickRow = Math.floor(canvasCoords.y/cellLength);
    
    // GO THROUGH ALL THE PIXELS IN THE PATTERN AND PUT THEM IN THE GRID
    for (var i = 0; i < pixels.length; i += 2)
        {
            var col = clickCol + pixels[i];
            var row = clickRow + pixels[i+1];
            setGridCell(renderGrid, row, col, LIVE_CELL);
            setGridCell(updateGrid, row, col, LIVE_CELL);
        }
        
    // RENDER THE GAME IMMEDIATELY
    renderGame();
}

// requirement 1
function startGameOfLife()
{
    if (isStarted === false)
    {
        isStarted = true;
    }
    
    if (isPaused === true)
        {
            isPaused = false;
            // when a game is started or unpaused, start the timer for updating
            // the grid and rendering the simulation
            // call the function at the current frame rate. e.g., if the
            // frame rate is 33, call the function 33 times a second or
            // once every 1/33 of a second (1000/33 milliseconds)
            timer = setInterval(function(){stepGameOfLife()},1000/fps);
        }
}

// requirement 2
function pauseGameOfLife()
{
    if (isPaused === false)
        {
            isPaused = true;
            // when the game is paused, stop the timer for updating the
            // grid and rendering the simulation
            clearInterval(timer);
        }
}

/*
 * This function resets the grid containing the current state of the
 * Game of Life such that all cells in the game are dead.
 */
function resetGameOfLife()
{
    // requirement 1
    isStarted = false;
    
    //requirement 2
    isPaused = true;
    
    // requirement 1; when the simulation is reset, stop the timer for
    // updating the grid and rendering the simulation (if the simulation
    // has been started at least once and thus the timer set at least once)
    if (timer !== null)
        {
            clearInterval(timer);
        }
    
    // RESET ALL THE DATA STRUCTURES TOO
    gridWidth = canvasWidth/cellLength;
    gridHeight = canvasHeight/cellLength;
    updateGrid = new Array();
    renderGrid = new Array();
    
    // INIT THE CELLS IN THE GRID
    for (var i = 0; i < gridHeight; i++)
        {
            for (var j = 0; j < gridWidth; j++)
                {
                    setGridCell(updateGrid, i, j, DEAD_CELL); 
                    setGridCell(renderGrid, i, j, DEAD_CELL);
                }
        }

    // RENDER THE CLEARED SCREEN
    renderGame();
}

/*
 * This function decrements the cellLength factor for rendering. Note the 
 * cellLength starts at 1, which is cellLengthed all the way out, where cells are
 * on a one-to-one ratio with pixels in the canvas. The numeric value
 * of the cellLength translates into the length of each side for each cell.
 */
function decCellLength()
{
    // 1 IS THE LOWEST VALUE WE ALLOW
    if (cellLength > MIN_CELL_LENGTH)
        {
            // DEC THE CELL LENGTH
            cellLength /= CELL_LENGTH_INC;
            
            // AND RESET THE DATA STRUCTURES
            resetGameOfLife();
           
            // IF WE DON'T HAVE AN UPDATE/RENDER LOOP
            // RUNNING THEN WE HAVE TO FORCE A ONE-TIME
            // RENDERING HERE
            if (timer === null)
                {
                    renderGame();
                }
    }
}

/*
 * This function increments the cellLength factor for rendering. Note the 
 * cellLength starts at 1, which is cellLengthed all the way out, where cells are
 * on a one-to-one ratio with pixels in the canvas. The numeric value
 * of the cellLength translates into the length of each side for each cell.
 */
function incCellLength()
{
    // 100 IS THE LARGEST VALUE WE ALLOW
    if (cellLength < MAX_CELL_LENGTH)
        {
            // INC THE CELL LENGTH
            cellLength *= CELL_LENGTH_INC;
            
            // AND RESET THE DATA STRUCTURES
            resetGameOfLife();
            
            // IF WE DON'T HAVE AN UPDATE/RENDER LOOP
            // RUNNING THEN WE HAVE TO FORCE A ONE-TIME
            // RENDERING HERE
            if (timer === null)
                {
                    renderGame();
                }
        }
}

// requirement 3
function decFPS()
{
    // 1 is the lowest value we allow
    if (fps > MIN_FPS)
        {
            // dec fps
            fps -= FPS_INC;
            
            // only when the simulation is in progress,
            if (isPaused === false)
                {
                    // do we need to update the timer to account for the new
                    // frame rate
                    // otherwise it's done when the "Start" button is
                    // pressed
                    clearInterval(timer);
                    timer = setInterval(function(){stepGameOfLife()},1000/fps);
                }
            // when a simulation isn't in progress,
            else
                {
                    // we need to make sure the FPS text still gets updated,
                    // but just the text
                    renderGameWhilePaused();
                }
        }
}

// requirement 3
function incFPS()
{
    // 33 is the largest value we allow
    if (fps < MAX_FPS)
        {
            // inc fps
            fps += FPS_INC;
           
            // only when the simulation is in progress,
            if (isPaused === false)
                {
                    // do we need to update the timer to account for the new
                    // frame rate
                    // otherwise it's done when the "Start" button is
                    // pressed
                    clearInterval(timer);
                    timer = setInterval(function(){stepGameOfLife()},1000/fps);
                }
            // when a simulation isn't in progress,
            else
                {
                    // we need to make sure the FPS text still gets updated,
                    // but just the text
                    renderGameWhilePaused();
                }
        }
}

// HELPER METHODS FOR THE EVENT HANDLERS

/*
 * This function gets the mouse click coordinates relative to
 * the canvas itself, where 0,0 is the top, left corner of
 * the canvas.
 */
function getRelativeCoords(event) 
{
    if (event.offsetX !== undefined && event.offsetY !== undefined) 
    { 
        return { x: event.offsetX, y: event.offsetY }; 
    }
    else
    {
        return { x: event.layerX, y: event.layerY };
    }
}

// GRID CELL MANAGEMENT METHODS

/*
 * This function tests to see if (row, col) represents a 
 * valid cell in the grid. If it is a valid cell, true is
 * returned, else false.
 */
function isValidCell(row, col)
{
    // IS IT OUTSIDE THE GRID?
    if (    (row < 0) || 
            (col < 0) ||
            (row >= gridHeight) ||
            (col >= gridWidth))
        {
            return false;
        }    
    // IT'S INSIDE THE GRID
    else
        {
            return true;
        }
}

/*
 * Accessor method for getting the cell value in the grid at
 * location (row, col).
 */
function getGridCell(grid, row, col)
{
    // IGNORE IF IT'S OUTSIDE THE GRID
    if (!isValidCell(row, col))
        {
            return -1;
        }
    var index = (row * gridWidth) + col;
    return grid[index];
}

/*
 * Mutator method for setting the cell value in the grid at
 * location (row, col).
 */
function setGridCell(grid, row, col, value)
{
    // IGNORE IF IT'S OUTSIDE THE GRID
    if (!isValidCell(row, col))
        {
            return;
        }
    var index = (row * gridWidth) + col;
    grid[index] = value;
}

/*
 * Should be called each frame on a timed basis, this method updates the grid
 * and renders the simulation.
 */
function stepGameOfLife()
{
    // FIRST PERFORM GAME LOGIC
    updateGame();
    
    // RENDER THE GAME
    renderGame();
}

/*
 * This function is called each frame of the simulation and
 * it tests and updates each cell according to the rules
 * of Conway's Game of Life.
 */
function updateGame()
{
    // CURRENTLY DOES NOTHING
    // requirement 1
    var numLiveNeighbors = 0;
    // go through every cell in the grid
    for (var i = 0; i < gridHeight; i++)
        {
           for (var j = 0; j < gridWidth; j++)
               {
                   var cell = getGridCell(renderGrid, i, j);
                   // check how many of the current cell's neighbors
                   // (the 8 surrounding cells) are live
                   for (var k = i - 1; k <= i + 1; k++)
                       {
                           for (var l = j - 1; l <= j + 1; l++)
                               {
                                   // first make sure that the neighbor we're
                                   // checking isn't equal to the current cell
                                   if (!(k === i && l === j))
                                       {
                                           var neighbor = getGridCell(renderGrid, k, l);
                                           if (neighbor === LIVE_CELL)
                                               {
                                                   numLiveNeighbors++;
                                               }
                                       }
                               }
                       }
                   // apply rules of Conway's Game of Life
                   if (cell === LIVE_CELL)
                       {
                           // a live cell with fewer than two live neighbors
                           // dies
                           if (numLiveNeighbors < 2)
                               {
                                   setGridCell(updateGrid, i, j, DEAD_CELL);
                               }
                           // a live cell with two or three live neighbors
                           // lives
                           // the cell remains live
                           else if (numLiveNeighbors === 2 || numLiveNeighbors === 3)
                               {
                                   setGridCell(updateGrid, i, j, LIVE_CELL)
                               }
                           // a live cell with more than three live neighbors
                           // dies
                           else // numLiveNeighbors > 3
                               {
                                   setGridCell(updateGrid, i, j, DEAD_CELL);
                               }
                               
                           // reset numLiveNeighbors for the next cell whose
                           // neighbors are examined
                           numLiveNeighbors = 0;
                       }
                  // otherwise, the cell has to be dead (it can't equal -1
                  // because i and j start at zero, ensuring that "cell" is
                  // within the grid)
                  else
                      {
                          // a dead cell with exactly three live neighbors
                          // becomes a live cell
                          if (numLiveNeighbors === 3)
                              {
                                  setGridCell(updateGrid, i, j, LIVE_CELL);
                              }
                          // otherwise, the cell remains dead
                          else
                              {
                                  setGridCell(updateGrid, i, j, DEAD_CELL);
                              }
                              
                          // reset numLiveNeighbors for the next cell whose
                          // neighbors are examined
                          numLiveNeighbors = 0;
                      }
               }
        }
}

/*
 * This function renders a single frame of the simulation, including
 * the grid itself, as well as the text displaying the current
 * fps and cellLength levels.
 */
function renderGame()
{
    // CLEAR THE CANVAS
    canvas2D.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // requirement 5; render grid lines if the cell length
    // is 8 or larger
    if (cellLength >= GRID_LINE_LENGTH_RENDERING_THRESHOLD)
    {
        renderGridLines();
    }
    
    // RENDER THE GAME CELLS
    renderCells();
    
    // AND RENDER THE TEXT
    renderText();
    
    // THE GRID WE RENDER THIS FRAME SHOULD BE USED AS THE BASIS
    // FOR THE UPDATE GRID NEXT FRAME
    swapGrids();
}

// requirement 3
// allows for the fps text to be updated while the game is
// paused, without updating the image on the canvas
// (is equivalent to the renderGame method minus the call
// to swapGrids)
function renderGameWhilePaused()
{
   // CLEAR THE CANVAS
    canvas2D.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // requirement 5; render grid lines if the cell length
    // is 8 or larger
    if (cellLength >= GRID_LINE_LENGTH_RENDERING_THRESHOLD)
    {
        renderGridLines();
    }
    
    // RENDER THE GAME CELLS
    renderCellsWhilePaused();
    
    // AND RENDER THE TEXT
    renderText();
}

// requirement 5
function renderGridLines()
{
    canvas2D.strokeStyle=GRID_LINES_COLOR;
    // ensures that the previous cell length's grid
    // is cleared before drawing the current cell
    // length's grid
    canvas2D.beginPath();
    
    for (var i = 0; i <= canvasHeight; i+=cellLength)
    {
        canvas2D.moveTo(0,i);
        canvas2D.lineTo(canvasWidth,i);
        canvas2D.stroke();
    }
   
    for (var j = 0; j <= canvasWidth; j+=cellLength)
    {
        canvas2D.moveTo(j,0);
        canvas2D.lineTo(j,canvasHeight);
        canvas2D.stroke();
    }
}

/*
 * Renders the cells in the game grid, with only the live
 * cells being rendered as filled boxes. Note that boxes are
 * rendered according to the current cell length.
 */
function renderCells()
{
    // SET THE PROPER RENDER COLOR
    canvas2D.fillStyle = LIVE_COLOR;
    
    // RENDER THE LIVE CELLS IN THE GRID
    for (var i = 0; i < gridHeight; i++)
        {
           for (var j = 0; j < gridWidth; j++)
               {
                   var cell = getGridCell(renderGrid, i, j);
                   if (cell === LIVE_CELL)
                       {
                           var x = j * cellLength;
                           var y = i * cellLength;
                           canvas2D.fillRect(x, y, cellLength, cellLength);
                       }
               }
        }      
}

// requirement 3
// allows for the fps text to be updated while the game is
// paused, without updating the image on the canvas
// (is equivalent to the renderCells method except it uses
// the cells of updateGrid instead of renderGrid)
function renderCellsWhilePaused()
{
    // SET THE PROPER RENDER COLOR
    canvas2D.fillStyle = LIVE_COLOR;
    
    // RENDER THE LIVE CELLS IN THE GRID
    for (var i = 0; i < gridHeight; i++)
        {
           for (var j = 0; j < gridWidth; j++)
               {
                   var cell = getGridCell(updateGrid, i, j);
                   if (cell === LIVE_CELL)
                       {
                           var x = j * cellLength;
                           var y = i * cellLength;
                           canvas2D.fillRect(x, y, cellLength, cellLength);
                       }
               }
        }      
}

/*
 * Renders the text on top of the grid.
 */
function renderText()
{
    // SET THE PROPER COLOR
    canvas2D.fillStyle = TEXT_COLOR;
    
    // RENDER THE TEXT
    canvas2D.fillText("FPS: " + fps, FPS_X, FPS_Y);
    canvas2D.fillText("Cell Length: " + cellLength, CELL_LENGTH_X, CELL_LENGTH_Y);
}

/*
 * We need one grid's cells to determine the grid's values for
 * the next frame. So, we update the render grid based on the contents
 * of the update grid, and then, after rending, we swap them, so that
 * the next frame we'll be progressing the game properly.
 */
function swapGrids()
{
    var temp = updateGrid;
    updateGrid = renderGrid;
    renderGrid = temp;
}


