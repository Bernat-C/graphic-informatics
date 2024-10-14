/**
 * @file travelers.js
 * @author Bernat Comas Machuca
 * Main file to run the game.
 */

//VARIABLES

  var gl, program;

  /** Array that contains all objects in a scene */
  objectsScene = [];

  /**
   * How to display the objects:
   * 0 - Wireframe
   * 1 - Solid
   * 2 - Solid+Wireframe
   */
  model_display = "2";
  
  var camera = new Camera();

  addPoint("Start");

  function loadPoint() {
    const pl = document.getElementById("pointList");
    const selected = pl.options[pl.selectedIndex].value;
    if(selected!==undefined)
      camera.loadPoint(selected)
    pl.selectedIndex = 0;
    requestAnimationFrame(drawScene);
  }

  function clickAddPoint(){
    const input = document.getElementById("newPointName");
    addPoint(input.value);
    input.value = "";
  }

  function addPoint(name) {
    camera.points.push(new Point(name,camera))
    const pl = document.getElementById("pointList");
    const newOption = document.createElement('option');
    newOption.value = name;
    newOption.textContent = name;
    pl.appendChild(newOption);
  }

  function speed(op) {
    switch(op){
      case 0: 
      if(camera.speed-0.1<=0) return;
        camera.speed -= 0.1;
        break;
      case 1:
        camera.speed += 0.1;
        break;
    }
  }
  
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

    //uniforms
    program.modelViewMatrixIndex = gl.getUniformLocation(program, "modelViewMatrix");
    program.projectionMatrixIndex = gl.getUniformLocation(program,"projectionMatrix");
  
    // normales
    program.vertexNormalAttribute = gl.getAttribLocation ( program, "VertexNormal");
    program.normalMatrixIndex     = gl.getUniformLocation( program, "normalMatrix");
    gl.enableVertexAttribArray(program.vertexNormalAttribute);
    
    // material
    program.KaIndex               = gl.getUniformLocation( program, "Material.Ka");
    program.KdIndex               = gl.getUniformLocation( program, "Material.Kd");
    program.KsIndex               = gl.getUniformLocation( program, "Material.Ks");
    program.alphaIndex            = gl.getUniformLocation( program, "Material.alpha");

    // fuente de luz
    program.LaIndex               = gl.getUniformLocation( program, "Light.La");
    program.LdIndex               = gl.getUniformLocation( program, "Light.Ld");
    program.LsIndex               = gl.getUniformLocation( program, "Light.Ls");
    program.PositionIndex         = gl.getUniformLocation( program, "Light.Position");

    // To draw wireframes
    program.drawTypeUniformLocation = gl.getUniformLocation(program, 'drawType');    
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
    
    gl.clearColor(0.443, 0.737, 0.882,1.0);
    gl.enable(gl.DEPTH_TEST);

    gl.lineWidth(1.5);
    setShaderLight();
  }

  function setShaderProjectionMatrix(projectionMatrix) {
  
    gl.uniformMatrix4fv(program.projectionMatrixIndex, false, projectionMatrix);
    
  }
  
  function setShaderModelViewMatrix(modelViewMatrix) {
    
    gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
    
  }
  
  function setShaderNormalMatrix(normalMatrix) {
    
    gl.uniformMatrix3fv(program.normalMatrixIndex, false, normalMatrix);
    
  }
  
  function getNormalMatrix(modelViewMatrix) {
    
    return mat3.normalFromMat4(mat3.create(), modelViewMatrix);
    
  }
  
  function getProjectionMatrix() {
    
    return mat4.perspective(mat4.create(), camera.fovy, 1.0, 0.1, 1000.0);
    
  }

  function setShaderMaterial(material) {

    gl.uniform3fv(program.KaIndex,    material.mat_ambient);
    gl.uniform3fv(program.KdIndex,    material.mat_diffuse);
    gl.uniform3fv(program.KsIndex,    material.mat_specular);
    gl.uniform1f (program.alphaIndex, material.alpha);
    
  }  

  function setShaderLight() {

    gl.uniform3f(program.LaIndex,        1.0,  1.0, 1.0);
    gl.uniform3f(program.LdIndex,        1.0,  1.0, 1.0);
    gl.uniform3f(program.LsIndex,        1.0,  1.0, 1.0);
    gl.uniform3f(program.PositionIndex, 10.0, 10.0, 0.0); // en coordenadas del ojo
    //gl.uniform3f(program.PositionIndex, 0.0, 0.0, 10.0); // en coordenadas del ojo
  }

  function createModel(model){
    initBuffers(model);
    gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, model.modelMatrix);
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
      
    gl.uniformMatrix4fv(program.modelViewMatrixIndex,false,M);
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
    
    gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferVertices);
    gl.vertexAttribPointer (program.vertexPositionAttribute, 3, gl.FLOAT, false, 2*3*4,   0);
    gl.vertexAttribPointer (program.vertexNormalAttribute,   3, gl.FLOAT, false, 2*3*4, 3*4);
      
    gl.bindBuffer   (gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
    if (model_display!=0) {
      gl.uniform1i(program.drawTypeUniformLocation, 0);
      gl.drawElements (gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);
    }
    
    if (model_display!=1){
      gl.uniform1i(program.drawTypeUniformLocation, 1);
      gl.drawElements (gl.LINES, model.indices.length, gl.UNSIGNED_SHORT, 0);
    }
  }

  /**
   * Function called recursivelly
   */
  function drawScene()
  {
      var c = document.getElementById("eye");
      c.innerHTML = camera.eye;
      var c = document.getElementById("center");
      c.innerHTML = camera.center;

      // se inicializan los buffers de color y de profundidad
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      
      // se obtiene la matriz de transformacion de la proyeccion y se envia al shader
      setShaderProjectionMatrix( getProjectionMatrix() );
     
      for (let i = 0; i < objectsScene.length; i++) {
    
        // Update the model view matrix based on the position of the object
        var modelViewMatrix = mat4.create();
        mat4.multiply(modelViewMatrix, camera.getMatrix(), objectsScene[i].modelMatrix);

        setShaderModelViewMatrix(modelViewMatrix);
    
        // Update the normal matrix
        setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
        setShaderMaterial(Yellow_plastic);
    
        // Draw the object
        draw(objectsScene[i]);
      }
      
      //requestAnimationFrame(drawScene)
  }

  function initHandlers() {
    
    document.onkeydown = handleKeyDown

    var mouseDown = false;
  
    var canvas = document.getElementById("myCanvas");
  
    canvas.addEventListener("mousedown",
      function(event) {
        mouseDown  = true;
        camera.lastMouseX = event.clientX;
        camera.lastMouseY = event.clientY;
      },
      false);
  
    canvas.addEventListener("mouseup",
      function() {
        mouseDown = false;
      },
      false);
    
    canvas.addEventListener("wheel",
      function (event) {
        
        var delta = 0.0;
  
        if (event.deltaMode == 0)
          delta = event.deltaY * 0.001;
        else if (event.deltaMode == 1)
          delta = event.deltaY * 0.03;
        else
          delta = event.deltaY;
  
        if (event.shiftKey == 1) { // fovy
            
          camera.fovy *= Math.exp(-delta)
          camera.fovy = Math.max (0.1, Math.min(3.0, camera.fovy));
          
  //         htmlFovy.innerHTML = (fovy * 180 / Math.PI).toFixed(1);
          
        } else {
          
          camera.radius *= Math.exp(-delta);
          camera.radius  = Math.max(Math.min(camera.radius, 30), 0.05);
          
        }
        
        event.preventDefault();
        requestAnimationFrame(drawScene);
  
      }, false);
  
    canvas.addEventListener("mousemove",
      function (event) {
        if (!mouseDown) {
          return;
        }
        
        var newX = event.clientX;
        var newY = event.clientY;
        
        camera.myZeta -= (newX - camera.lastMouseX) * 0.005;
        camera.myPhi  -= (newY - camera.lastMouseY) * 0.005;

        var margen = 0.01;
        camera.myPhi = Math.min (Math.max(camera.myPhi, margen), Math.PI - margen);

        var htmlPhi = document.getElementById("myPhi")
        var htmlZeta = document.getElementById("myZeta") 
          
        htmlPhi.innerHTML  = camera.myPhi;
        htmlZeta.innerHTML = camera.myZeta;
       
        camera.lastMouseX = newX
        camera.lastMouseY = newY;
        
        camera.updateCenterFromRotation()
  
        requestAnimationFrame(drawScene);
        
        event.preventDefault();
      },
      false);  
  }        

  function setColor (index, value) {

    var myColor = value.substr(1); // para eliminar el # del #FCA34D
        
    var r = myColor.charAt(0) + '' + myColor.charAt(1);
    var g = myColor.charAt(2) + '' + myColor.charAt(3);
    var b = myColor.charAt(4) + '' + myColor.charAt(5);
  
    r = parseInt(r, 16) / 255.0;
    g = parseInt(g, 16) / 255.0;
    b = parseInt(b, 16) / 255.0;
    
    gl.uniform3f(index, r, g, b);
    
  }

  /**
   * Executed when displayTypeSelector is changed
   */
  function changeSelectType(){
    var select = document.getElementById("displayType");
    model_display = select.options[select.selectedIndex].value;

    requestAnimationFrame(drawScene)
  }
  
  // Updates the scoreboard and adds 1 point.
  function update_score(){
    score++;
    // Get a reference to the score span element
    const scoreSpan = document.getElementById('score');

    scoreSpan.textContent = score;
  }

  /**
   * Handles the arrow key event
   * @param {*} event 
   */
  function handleKeyDown(event) {
    // 1: forward | 2: right | 3: backwards | 4: left
    var shouldFall = 0;
    switch (event.key) {
      case 'a': // Left key
        shouldFall = camera.moveCamera(4, objectsScene)
        break;
      case 'w': // Up key
        shouldFall = camera.moveCamera(1, objectsScene)
        break;
      case 'd': // Right key
        shouldFall = camera.moveCamera(2, objectsScene)
        break;
      case 's': // Down key
        shouldFall = camera.moveCamera(3, objectsScene)
        break;
    }
    
    if(shouldFall && !camera.isFalling) {
      camera.isFalling = true
      setInterval(function(){
        if(camera.isFalling) {
          camera.eye[1]-=camera.speed;
          camera.center[1]-=camera.speed;
          console.log("fall")
          requestAnimationFrame(drawScene);
        }
      }, 10)
    }
  }

  
  function fallAnimation(camera) {
    camera.eye[1]-=1;
    camera.center[1]-=1;
    console.log("fall")
    requestAnimationFrame(drawScene);
  }

  /**
   * Creates a forest
   */
  function initBosc(){
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        var rand = Math.random();

        // Generem aleatoriament un arbre d'entre els 3 models que tenim per fer-ho més realista
        var tree = arbreOBJ;
        if(rand<0.3) tree = arbre2OBJ;
        else if (rand < 0.6) tree = arbre3OBJ;
        var currentTree = new Tree(tree);
        var num = 0.1;

        // Afegim un random per semblar més natural.
        currentTree.setMatrix(i*3+rand-10,-1.5,j*3-20-rand);
        createModel(currentTree);
        objectsScene.push(currentTree);
        
        (function (currentTree) {
          var intervalName = 0.02;

          setInterval(function () {
              currentTree.rotate(intervalName, "z");
              intervalName = -intervalName;
              requestAnimationFrame(drawScene);
          }, 100);
      })(currentTree); 
      }
    }    
  }

  // compose scene
  function composeScene()
  {
      initBosc();

      var floor = new Plane(100);
      floor.setMatrix(0,-1.5,0);
      createModel(floor);
      //floor.changeSize(1)
      objectsScene.push(floor);
      
      var house = new SquareObject(casaOBJ);
      house.setMatrix(-10,-1.5,0,1);
      createModel(house);
      objectsScene.push(house);
      
      var esglesia = new SquareObject(esglesiaOBJ);
      esglesia.setMatrix(-10,-1.5,10,1);
      createModel(esglesia);
      objectsScene.push(esglesia);
      
      var rock = new SquareObject(rockOBJ);
      rock.setMatrix(-3,-1.5,30,1);
      createModel(rock);
      objectsScene.push(rock);

      var rock = new SquareObject(rockOBJ);
      rock.setMatrix(20,-1.5,20,1);
      createModel(rock);
      objectsScene.push(rock);
      
      var rock = new SquareObject(rockOBJ);
      rock.setMatrix(20,0,-20,1);
      createModel(rock);
      objectsScene.push(rock);
      
      var rock = new SquareObject(rockOBJ);
      rock.setMatrix(20,-1.5,0,1);
      createModel(rock);
      objectsScene.push(rock);
      
      var piano = new SquareObject(pianoOBJ);
      piano.setMatrix(10,-2,20,1);
      piano.rotate(Math.PI,"y")
      createModel(piano);
      objectsScene.push(piano);
      
      var sofa = new SquareObject(sofaTop);
      sofa.setMatrix(7,-1.7,20,1);
      sofa.rotate(Math.PI,"y")
      createModel(sofa);
      objectsScene.push(sofa);
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
