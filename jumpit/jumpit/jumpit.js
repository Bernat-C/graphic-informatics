/**
 * @file jumpit.js
 * @author Bernat Comas Machuca
 */

var gl, program;

var idMyColor;

const X_LEFT_SCREEN_LIMIT = -2;
const X_RIGHT_SCREEN_LIMIT = 2;
const JUMP_HEIGHT = 0.7;

const canvas = document.getElementById('myCanvas');

// Function that allows the canvas to be represented as 2:1 aspect ratio
function resizeCanvas() {
  const desiredAspectRatio = 2 / 1; // Adjust this to your desired aspect ratio
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const currentAspectRatio = screenWidth / screenHeight;

  let newWidth, newHeight;

  if (currentAspectRatio > desiredAspectRatio) {
      // Screen is wider, adjust canvas height
      newWidth = screenHeight * desiredAspectRatio;
      newHeight = screenHeight;
  } else {
      // Screen is taller, adjust canvas width
      newWidth = screenWidth;
      newHeight = screenWidth / desiredAspectRatio;
  }

  // Set the canvas size
  canvas.width = newWidth;
  canvas.height = newHeight;

  // Set up the WebGL viewport to match the canvas size
  gl.viewport(0, 0, newWidth, newHeight);
}

// The ball the game is going to be played with
var ball = new Ball();

// Instance of the game
var game = new Game();

// Dynamic list of platforms on screen
var platforms = [];

// Dynamic list of coins on screen
var coins = [];

// Dynamic list of fishes on screen
var fishes = [];

/**
 * 
 * @returns WebGL Context
 */
function getWebGLContext() {

  var canvas = document.getElementById("myCanvas");

  try {
    return canvas.getContext("webgl2");
  }
  catch(e) {
  }

  return null;

}

/**
 * Inicialitza el rendering
 */
function initShaders() {
  
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, document.getElementById("myVertexShader").text);
  gl.compileShader(vertexShader);
  
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, document.getElementById("myFragmentShader").text);
  gl.compileShader(fragmentShader);
  
  program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  
  gl.linkProgram(program);
  
  gl.useProgram(program);
  
  program.vertexPositionAttribute = gl.getAttribLocation( program, "VertexPosition");
  gl.enableVertexAttribArray(program.vertexPositionAttribute);
  
  program.vertexColorAttribute = gl.getAttribLocation( program, "VertexColor");
  gl.enableVertexAttribArray(program.vertexColorAttribute);
}

/** DRAWING FIGURES */

/**
 * Dibuixa el background
 */
function drawBackground(){
  // Dibuixem el cel
  const colourSky1 = [0.463, 0.835, 0.961, 1.0];
  const colourSky2 = [1.0, 1.0, 1.0, 1.0];
  drawSquare(0, 0, 2, 4, colourSky2, colourSky2, colourSky1, colourSky1)

  drawTitle();

  // Dibuixem el mar
  const colourSea1 = [0.345, 0.729, 0.827, 1.0];
  const colourSea2 = [0.082, 0.133, 0.22, 1.0];
  drawSquare(0, -0.5-PLATFORM_RADIUS-BALL_RADIUS, 1, 4, colourSea2, colourSea2, colourSea1, colourSea1)
}

/**
 * Mou els objectes segons Game.velocity
 */
function moveObjects(){

  // Moving the ball
  ball.rotationAngle -= Ball.rotation_increment;
  if(game.started && !ball.is_jumping && !ball.isSupported()) ball.fall();

  // Moving the fishes
  fishes = fishes.map(fish => {
    // Updating it's position
    fish.pos_x -= Game.velocity/fish.speed;

    // Checking if fish has disappeared from screen
    if (fish.pos_x < X_LEFT_SCREEN_LIMIT - Fish.max_fish_width) {
      return undefined;
    }
    return fish; // Return the updated value
  }).filter(x => x !== undefined);

  // Moving the coins
  coins = coins.map(coin => {
    // Updating it's position
    coin.pos_x -= Game.velocity;

    // Checking if coin is taken
    if(coin.isCoinTaken(ball)){
      game.score += 20
      return undefined
    }

    // Checking if coin has disappeared from screen
    if (coin.pos_x < X_LEFT_SCREEN_LIMIT - PLATFORM_RADIUS) {
      return undefined;
    }
    return coin; // Return the updated value
  }).filter(x => x !== undefined);

  // Moving the platforms
  platforms = platforms.map(platform => {
    platform.pos_x -= Game.velocity;
    if (platform.pos_x < X_LEFT_SCREEN_LIMIT - PLATFORM_RADIUS) {
      return undefined;
    }
    return platform; // Return the updated value
  }).filter(x => x !== undefined);
}

/**
 * Dibuixa l'escena i crida als actualitzadors de joc. Funció cridada repetitivament.
 */
function drawScene() {

  game.tics_new_platform--;

  // Update position of objects in game
  moveObjects();
  
  // Eliminem el contingut anterior del canvas.
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Dibuixem el background
  drawBackground();

  // Dibuixem pilota
  ball.draw()
  
  // Dibuixem monedes
  fishes.forEach(fish => {
    fish.draw()
  });

  // Dibuixem monedes
  coins.forEach(coin => {
      coin.draw()
  });
  
  // Dibuixem les plataformes
  platforms.forEach(platform => {
    platform.draw()
  });

  // Actualitzem l'estat del joc
  if(game.tics_new_platform <= 0){
    game.updateState()
    game.getNextFish();
  }  
}

/**
 * Crida drawScene repetidament
 */
function animate(){
  
  drawScene();
  
  requestAnimationFrame(animate);
}

/**
 * Inicialitza els listeners de tecles del teclat per a la interacció amb el joc.
 */
function initListeners(){
  window.addEventListener('resize', resizeCanvas);
  document.addEventListener("keydown", (event) => {
    if (event.key === " " && game.running && !ball.is_jumping) { // L'esdeveniment s'executarà quan la tecla pitxada sigui la barra d'espai.
      ball.jump(JUMP_HEIGHT);
    }
    else if (event.key === "f" || event.key === "F"){
      ball.fall();
    }
    else if (game.running && !ball.is_jumping && event.key === "r" || event.key === "R"){
      game.start();
    }
  });
}

/**
 * Inicialitza WebGL
 */
function initWebGL() {
  
  gl = getWebGLContext();
  resizeCanvas();
  
  if (!gl) {
    alert("WebGL 2.0 no está disponible");
    return;
  }
  
  initListeners();
  initShaders();
  
  // Posem el joc en situació d'inici
  game.start();
  
  animate();  
}

initWebGL();
