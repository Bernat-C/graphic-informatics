/**
 * @file travelers.js
 * @author Bernat Comas Machuca
 * Main file to run the game.
 */

//VARIABLES

  var gl, program;

  /** Array that contains all objects in a scene */
  objectsScene = [];
  /** Array that contains only the cube matrix objects in a scene */
  cubeMatrix = [];
  /** Objects that are movable but are not part of the cube matrix */
  movableObjects = [];
  /** Current Position of the cube matrix. 0 if the center column is in front of the camera, -1 the left column, 1 the right column. */
  posx = 0;
  /** Current Position of the cube matrix. 0 if the center row is in front of the camera, -1 the lowe row, 1 the upper row. */
  posy = 0;
  /** Current game score */
  score = 0;
  /** Current level */
  level = 0;
  /** Wether the level is changing */
  is_level_changing = true;
  /** The length of a level in number of tics (1 tic = DEFAULT_TIMEOUT)*/
  LEVEL_LENGTH = 10;
  /** Controlls the speed of the cubes and the rotation of the toruses */
  speed = 0.05
  /** How many tics it takes to generate a matrix. */
  DEFAULT_TIMEOUT = 60;
  /** Timeout to generate new cube matrices */
  timeout_generation = DEFAULT_TIMEOUT;
  /** Depth where the cubes will be created */
  DEPTH_CUBES = -5

  /**
   * How to display the objects:
   * 0 - Wireframe
   * 1 - Solid
   * 2 - Solid+Wireframe
   */
  model_display = "0";
  /** Wether the game is running (animation=1) or not (animation=0) */
  var animate = 1;


  //FUNCTIONS
  
  /**
   * 
   * @returns webGL context if it is found
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

  function initShaders() {
  
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, document.getElementById("myVertexShader").text);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(vertexShader));
      return null;
    }
   
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, document.getElementById("myFragmentShader").text);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(fragmentShader));
      return null;
    }
    
    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    
    gl.linkProgram(program);
    
    gl.useProgram(program);
    
    program.vertexPositionAttribute = gl.getAttribLocation( program, "VertexPosition");
    gl.enableVertexAttribArray(program.vertexPositionAttribute);

    program.vertexColorAttribute = gl.getAttribLocation( program, "VertexColor");
    gl.enableVertexAttribArray(program.vertexColorAttribute);
    
    gl.enable(gl.DEPTH_TEST)
    //uniforms
    program.modelMatrixIndex = gl.getUniformLocation(program, "modelMatrix");
    program.projectionMatrixIndex = gl.getUniformLocation(program,"projectionMatrix");
  
  }

  function initBuffers(model) {
    
    model.idBufferVertices = gl.createBuffer ();
    gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferVertices);
    gl.bufferData (gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
    
    model.idBufferIndices = gl.createBuffer ();
    gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
    gl.bufferData (gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);
    
  }

  function initRendering() {
    
    // Enable DEPTH
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.1294, 0.1294, 0.1294,1.0);
    gl.lineWidth(1.5);
    
  }

  /**
   * Sets the projection of the scene
   */
  function setProjection() {
    
    // obtiene la matriz de transformación de la proyección perspectiva
    var projectionMatrix  = mat4.create();
    // perspective
    mat4.perspective(projectionMatrix, Math.PI/4.0, 1.0, 0.1, 100.0);
    
    // envía la matriz de transformación de la proyección al shader de vértices
    gl.uniformMatrix4fv(program.projectionMatrixIndex,false,projectionMatrix);
  
    var T1 = mat4.create();
    var M = mat4.create(); 
    // get back the viewer 2 units
    mat4.fromTranslation(T1,[0.,0,-1]);
    mat4.multiply(M, M, T1);
      
    gl.uniformMatrix4fv(program.modelMatrixIndex,false,M);
  }

  /**
   * Inits the primitives of all objects in a scene
   */
  function initPrimitives() {

    for (let i = 0; i < objectsScene.length; i++)
      initBuffers(objectsScene[i]);
  }

  /**
   * Draws the current model according to model_display
   * @param {*} model 
   */
  function draw(model) {
    
    if(model_display !== "0"){   
      
      model.setLayoutColor("solid")
      
      initBuffers(model);
      gl.uniformMatrix4fv(program.modelMatrixIndex, false, model.modelMatrix);

      gl.bindBuffer(gl.ARRAY_BUFFER, model.idBufferVertices);
      gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 7*4, 0);
      gl.vertexAttribPointer(program.vertexColorAttribute,    4, gl.FLOAT, false, 7*4, 3*4);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
      for (var i = 0; i < model.indices.length; i += 3)
        gl.drawElements (gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, i*2);
      
    }
    if(model_display !== "1"){

      model.setLayoutColor("wireframe")

      initBuffers(model);
      gl.uniformMatrix4fv(program.modelMatrixIndex, false, model.modelMatrix);

      gl.bindBuffer(gl.ARRAY_BUFFER, model.idBufferVertices);
      gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 7*4, 0);
      gl.vertexAttribPointer(program.vertexColorAttribute,    4, gl.FLOAT, false, 7*4, 3*4);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
      for (var i = 0; i < model.indices.length; i += 3)
        gl.drawElements (gl.LINE_LOOP, 3, gl.UNSIGNED_SHORT, i*2);

      //model.setColor([0.1, 0.9, 0.3]);
    }
    
  }

  /**
   * Executes the necessary functions to change level
   */
  function changeLevel(){
    level++;
    is_level_changing = true;

    // Create a torus to show level is changing
    createTorus (Cube.CUBE_SIDE*posx,Cube.CUBE_SIDE*posy);

    // Update the level indicator
    const levelSpan = document.getElementById('level');
    levelSpan.textContent = level;

    // Set timeout while the level is changing
    setTimeout(function() {
      is_level_changing = false
      speed += 0.01
      DEFAULT_TIMEOUT *= 0.8
    }, 3000);
  }

  // Resets all elements to the default value
  function resetAll(){
    objectsScene = [];
    cubeMatrix = [];
    movableObjects = [];
    posx = 0;
    posy = 0;
    DEFAULT_TIMEOUT = 60;
    speed=0.05
    timeout_generation = DEFAULT_TIMEOUT;
    level=0;
    score=0;
    composeScene();
  }

  // Allows to start/stop the animation
  function animation (v)
  {
    animate = v;
  }

  // Creates a cube matrix, consisting of a 3x3 grid in front of the player
  function createCubeMatrix(centerX, centerY){
    const r1 = Math.random();
    const r2 = Math.random();
    const r3 = Math.random();
    const r4 = Math.random();
    const r5 = Math.random();
    
    if(r1<0.5) CreateCube(0+centerX,-0.22+centerY,DEPTH_CUBES);
    if(r1>0.5) CreateCube(-0.22+centerX,0+centerY,DEPTH_CUBES);
    if(r2<0.5) CreateCube(0+centerX,0.22+centerY,DEPTH_CUBES);
    if(r2>0.5) CreateCube(0.22+centerX,0+centerY,DEPTH_CUBES);
    if(r3<0.5) CreateCube(-0.22+centerX,-0.22+centerY,DEPTH_CUBES);
    if(r3>0.5) CreateCube(0.22+centerX,-0.22+centerY,DEPTH_CUBES);
    if(r4<0.5) CreateCube(0.22+centerX,0.22+centerY,DEPTH_CUBES);
    if(r4>0.5) CreateCube(-0.22+centerX,0.22+centerY,DEPTH_CUBES);
    if(r5<0.5) CreateCube(0+centerX,0+centerY,DEPTH_CUBES);
  }

  /**
   * Creates a torus taking by center the specified position
   * @param {number} centerX 
   * @param {number} centerY 
   */
  function createTorus(centerX, centerY){
    var torus = new Torus();
    torus.setMatrix(centerX, centerY, DEPTH_CUBES,0.5);
    objectsScene.push(torus); 
    movableObjects.push(torus);
  }

  /**
   * Function called recursivelly
   */
  function drawScene()
  {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // Controls the speed of the cubes
      for (let i = 0; i < objectsScene.length; i++)
      {
          if (animate == 1)
            objectsScene[i].animate(speed);
          draw(objectsScene[i]);    
      }
      
      if(animate){
        if(timeout_generation<0){
          update_score();
          if(!is_level_changing) createCubeMatrix(Cube.CUBE_SIDE*posx,Cube.CUBE_SIDE*posy)
          timeout_generation = DEFAULT_TIMEOUT;
          console.log(movableObjects.length)

          if(score%LEVEL_LENGTH==0){
            changeLevel();
          }
        }
        else timeout_generation--;

        checkCubeDeletion();
        checkCubeHit();
      }

      
      requestAnimationFrame(drawScene);
  }

  /**
   * Deletes all cubes that are off-screen
   */
  function checkCubeDeletion(){
    cubeMatrix = cubeMatrix.filter(x => !x.shouldBeDeleted(0));
    movableObjects = movableObjects.filter(x => !x.shouldBeDeleted(0));
  }

  /**
   * Executed when displayTypeSelector is changed
   */
  function changeSelectType(){
    var select = document.getElementById("displayType");
    model_display = select.options[select.selectedIndex].value;
  }

  /**
   * Checks if any cube has been hit and acts accordingly
   */
  function checkCubeHit(){
    cubeMatrix.filter(x => {
      if(x.hitsCamera(0,0,0)) {

        // We display different messages according to how far you traveled.
        var msg = "You did not just do that!"
        if(score<20) msg = "Maybe try practicing more!"
        else if(score<40) msg = "You may be starting to get good!"
        else if (score<60) msg = "Great Job!"
        alert("YOU HAVE BEEN HIT! \n " + msg + " \n You reached Level " + level + " and you managed to score " + score + " points!")
        resetAll();
      }
    });
  }
  
  // Updates the scoreboard and adds 1 point.
  function update_score(){
    score++;
    // Get a reference to the score span element
    const scoreSpan = document.getElementById('score');

    scoreSpan.textContent = score;
  }

  function initHandlers() 
  {    
    document.addEventListener("keydown", handleArrowKey);
  }

  /**
   * Handles the arrow key event
   * @param {*} event 
   */
  function handleArrowKey(event) {
    //console.log(posx + " - " + posy)
    switch (event.keyCode) {
        case 37: // Left arrow key
          if(posx<1) {
            moveCubes("right");
            posx++;
          }
            break;
        case 38: // Up arrow key
          if(posy>-1) {
            moveCubes("down");
            posy--;
          }
            break;
        case 39: // Right arrow key
          if(posx>-1) {
            moveCubes("left");
            posx--;
          }
            break;
        case 40: // Down arrow key
          if(posy<1) {
            moveCubes("up");
            posy++;
          }
            break;
    }
  }

  /**
   * Moves all cubes in the 3x3 matrix in the desired direction
   * @param {string} dir 
   */
  function moveCubes(dir){
    for (let i = 0; i < cubeMatrix.length; i++)
    {
        cubeMatrix[i].moveDir(dir);
    }
  }

  /**
   * Creates a cube
   * @param {*} x 
   * @param {*} y 
   * @param {*} z 
   */
  function CreateCube (x,y,z)
  {
      var cube = new Cube();
      cube.setMatrix(x, y, z,0.5);
      objectsScene.push(cube); 
      cubeMatrix.push(cube);
  }

  // compose scene
  function composeScene()
  {
      var floor = new Plane();
      floor.setMatrix(0,-0.5,-1);
      objectsScene.push(floor);
      
      var ceiling = new Plane();
      ceiling.setMatrix(0,0.5,-1);
      objectsScene.push(ceiling);
      
      var lwall = new Plane();
      lwall.setMatrix(-0.5,0,-1);
      lwall.rotate(Math.PI/2)
      objectsScene.push(lwall);
            
      var rwall = new Plane();
      rwall.setMatrix(0.5,0,-1);
      rwall.rotate(Math.PI/2)
      objectsScene.push(rwall);
      initPrimitives();

      changeLevel();

  }
  function initWebGL() {
    
    gl = getWebGLContext();
    
    if (!gl) {
      alert("WebGL 2.0 no está disponible");
      return;
    }
    
    initShaders();
    initRendering();
    initHandlers();
    composeScene();
    setProjection();
    requestAnimationFrame(drawScene);
    
  }

  initWebGL();
