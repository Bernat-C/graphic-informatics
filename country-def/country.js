/**
 * @file travelers.js
 * @author Bernat Comas Machuca
 * Main file to run the game.
 */

//VARIABLES

  var gl, program;

  /** Array that contains all objects in a scene */
  objectsScene = [];

  // Afegim totes les llums
  lights = [];
  lights.push(new Light([-20.0,10.0,1.0,1.0],[1.0,1.0,1.0],[1.0,1.0,1.0],[1.0,1.0,1.0],1))
  lights.push(new Light([20.0,15.0,20.0,1.0],[1.0,1.0,1.0],[1.0,1.0,1.0],[1.0,1.0,1.0],1))
  lights.push(new Light([0.0,10.0,-15.0,1.0],[1.0,1.0,1.0],[1.0,1.0,1.0],[1.0,1.0,1.0],1))

  var texturesId = [];
  /**
   * How to display the objects:
   * 0 - Wireframe
   * 1 - Solid
   * 2 - Solid+Wireframe
   */
  model_display = "1";
  
  var camera = new Camera();

  addPoint("Start");

  function drawLights() {
    lights.forEach(light => {
      var l1 = new Figure(defaultCube, 1);
      l1.material = Yellow_plastic;
      l1.setMatrix(light.position[0],light.position[1],light.position[2]);
      createModel(l1);
      objectsScene.push(l1);
    });
  }

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

    // coordenadas de textura
    program.vertexTexcoordsAttribute = gl.getAttribLocation ( program, "VertexTexcoords");
    gl.enableVertexAttribArray(program.vertexTexcoordsAttribute);
    program.myTextureIndex           = gl.getUniformLocation( program, 'myTexture');
    program.repetition               = gl.getUniformLocation( program, "repetition");
    gl.uniform1i(program.myTextureIndex, 3);
    gl.uniform1f(program.repetition,     1.0);
    program.nLights = gl.getUniformLocation( program , "nLights" );
    gl.uniform1i(program.nLights, lights.length)
    
    // material
    program.KaIndex               = gl.getUniformLocation( program, "Material.Ka");
    program.KdIndex               = gl.getUniformLocation( program, "Material.Kd");
    program.KsIndex               = gl.getUniformLocation( program, "Material.Ks");
    program.alphaIndex            = gl.getUniformLocation( program, "Material.alpha");

    var LaIndex = [];
    var LdIndex = [];
    var LsIndex = [];
    var Intensity = [];
    var PositionIndex = [];
    // fuente de luz
    for(let i=0; i<lights.length; i++){
      LaIndex[i]               = gl.getUniformLocation( program, `Lights[${i}].La`);
      LdIndex[i]               = gl.getUniformLocation( program, `Lights[${i}].Ld`);
      LsIndex[i]               = gl.getUniformLocation( program, `Lights[${i}].Ls`);
      Intensity[i]             = gl.getUniformLocation( program, `Lights[${i}].Intensity`);
      PositionIndex[i]         = gl.getUniformLocation( program, `Lights[${i}].Position`);
    }
    
    program.LaIndex = LaIndex;
    program.LdIndex = LdIndex;
    program.LsIndex = LsIndex;
    program.PositionIndex = PositionIndex;
    program.Intensity = Intensity;
    
    // propia del shader
    program.ScaleIndex            = gl.getUniformLocation( program, "Scale");
    program.ThresholdIndex        = gl.getUniformLocation( program, "Threshold");
    
    gl.uniform2f(program.ScaleIndex,     15.0, 15.0);
    gl.uniform2f(program.ThresholdIndex, 0.5, 0.5);

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

    gl.uniform1i(program.nLights, lights.length)
    let n = lights.length;

    for(let i=0; i<n; i++){
      gl.uniform3f(program.LaIndex[i],        lights[i].La[0]/n, lights[i].La[1]/n, lights[i].La[2]/n);
      gl.uniform3f(program.LdIndex[i],        lights[i].Ld[0]/n, lights[i].Ld[1]/n, lights[i].Ld[2]/n);
      gl.uniform3f(program.LsIndex[i],        lights[i].Ls[0]/n, lights[i].Ls[1]/n, lights[i].Ls[2]/n);
      
      let Lp = vec4.create();
      mat4.multiply(Lp, camera.getMatrix(),lights[i].position);
      gl.uniform3f(program.PositionIndex[i], Lp[0], Lp[1], Lp[2]);
      gl.uniform1f(program.Intensity[i], lights[i].Intensity)
    }
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

  function initTextures() {

    var serverUrl    = "http://cphoto.uji.es/vj1221/assets/textures/";
    var texFilenames = [
      "bee.png",                               // 0
      "stone_9290068.JPG",                     // 1
      "bricks_texture_1010277.JPG",            // 2
      "dotted_cracked_concrete_9290255.JPG",   // 3
      "wood_1163214.JPG",                      // 4
      "painted_wood_stained_4185.JPG"];        // 5
  
    for (var texturePos = 0; texturePos < texFilenames.length; texturePos++) {
    
      // creo el objeto textura
      texturesId[texturePos] = gl.createTexture();
      texturesId[texturePos].loaded = false;
      
      // solicito la carga de la textura
      loadTextureFromServer(serverUrl+texFilenames[texturePos], texturePos);
      
    }
  
  }

  /**
   * Draws the current model according to model_display
   * @param {*} model 
   */
  function draw(model) {
    
    gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferVertices);
    gl.vertexAttribPointer (program.vertexPositionAttribute, 3, gl.FLOAT, false, 8*4,   0);
    gl.vertexAttribPointer (program.vertexNormalAttribute,   3, gl.FLOAT, false, 8*4, 3*4);
    gl.vertexAttribPointer (program.vertexTexcoordsAttribute,   2, gl.FLOAT, false, 8*4, 6*4);
      
    gl.bindBuffer   (gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
    if (model_display!=0) {
      if(model.idTextura == -1) { //-1 vol dir textura procedural reixa.
        gl.uniform1i(program.drawTypeUniformLocation, 3);
        gl.drawElements (gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);
      }
      else if(texturesId[model.idTextura]!=null) { // If the solid has textures we draw with textures
        gl.bindTexture(gl.TEXTURE_2D, texturesId[model.idTextura]);
        gl.uniform1i(program.drawTypeUniformLocation, 2);
        gl.drawElements (gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);
      }
      else {
        gl.uniform1i(program.drawTypeUniformLocation, 0);
        gl.drawElements (gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);
      }
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
      setShaderLight();

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
        setShaderMaterial(objectsScene[i].material);
        
        gl.activeTexture(gl.TEXTURE3);
    
        // Draw the object
        draw(objectsScene[i]);
      }
      
      //requestAnimationFrame(drawScene)
  }

  function initHandlers() {
    
    document.onkeydown = handleKeyDown

    var mouseDown = false;
  
    var canvas = document.getElementById("myCanvas");

    function handleColorChange(event) {
      const inputId = event.target.id;
      const colorHex = event.target.value;

      // Convert hex to RGB
      const red = parseInt(colorHex.substring(1, 3), 16) / 255;
      const green = parseInt(colorHex.substring(3, 5), 16) / 255;
      const blue = parseInt(colorHex.substring(5, 7), 16) / 255;

      const rgb = [red, green, blue]
      
      // Perform different actions based on input ID
      switch(inputId) {
        case 'La1':
          lights[0].La = rgb
          break;
        case 'La2':
          lights[1].La = rgb
          break;
        case 'La3':
          lights[2].La = rgb
          break;
        case 'Ld1':
          lights[0].Ld = rgb
          break;
        case 'Ld2':
          lights[1].Ld = rgb
          break;
        case 'Ld3':
          lights[2].Ld = rgb
          break;
        case 'Ls1':
          lights[0].Ls = rgb
          break;
        case 'Ls2':
          lights[1].Ls = rgb
          break;
        case 'Ls3':
          lights[2].Ls = rgb
          break;
      }
    }

    function handleIntensityChange(event) {
      const inputId = event.target.id;
      const intensity = event.target.value;
      
      // Perform different actions based on input ID
      switch(inputId) {
        case 'Li1':
          lights[0].Intensity = intensity
          break;
        case 'Li2':
          lights[1].Intensity = intensity
          break;
        case 'Li3':
          lights[2].Intensity = intensity
          break;
      }
    }

    // Add event listeners to each color input
    const colorInputs = document.querySelectorAll('input[type="color"]');
    colorInputs.forEach(input => {
      input.addEventListener('change', handleColorChange);
    });

    const intensityInputs = document.querySelectorAll('[name="lightIntensity"]');
    intensityInputs.forEach(input => {
      input.addEventListener('change', handleIntensityChange);
    });
  
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

        camera.lastMouseX = newX
        camera.lastMouseY = newY;
        
        camera.updateCenterFromRotation()
  
        requestAnimationFrame(drawScene);
        
        event.preventDefault();
      },
      false);  

      var textureSelector = document.getElementsByName("textureSelector");
      
      for (var i = 0; i < textureSelector.length; i++) {
        textureSelector[i].addEventListener("change",
                                            changeTextureHandler(i),
                                            false);
      }
      
      function changeTextureHandler(texturePos) {
        return function(){
          if (this.files[0]!= undefined) {
            texturesId[texturePos].loaded = false;
            loadTextureFromFile(this.files[0], texturePos);
          }
        };
      }

      var ranges = document.getElementsByName("range");

      for (var i = 0; i < ranges.length; i++) {
        ranges[i].addEventListener("mousemove",
        function(){
          switch (this.getAttribute("id")) {
            case "ScaleS":     
            case "ScaleT":     gl.uniform2f(program.ScaleIndex, ranges[0].value, ranges[1].value); break;
            case "ThresholdS": 
            case "ThresholdT": gl.uniform2f(program.ThresholdIndex, ranges[2].value/100.0, ranges[3].value/100.0); break;
          }
          requestAnimationFrame(drawScene);
        },
        false);
      }
  }
  
  function allTexturesLoaded () {

    for (var i = 0; i < texturesId.length; i++)
      if (! texturesId[i].loaded)
        return false;
    
    return true;
    
  }
  
  function loadTextureFromFile(filename, texturePos) {

    var reader = new FileReader(); // Evita que Chrome se queje de SecurityError al cargar la imagen elegida por el usuario
    
    reader.addEventListener("load",
                            function() {
                              var image = new Image();
                              image.addEventListener("load",
                                                    function() {
                                                      setTexture(image, texturePos);
                                                    },
                                                    false);
                              image.src = reader.result;
                            },
                            false);
    
    reader.readAsDataURL(filename);

  }
  
  function loadTextureFromServer (filename, texturePos) {
      
    var image = new Image();
      
    image.addEventListener("load",
                          function() {
                            setTexture(image, texturePos);
                          },
                          false);
    image.addEventListener("error",
                          function(err) {
                            console.log("MALA SUERTE: no esta disponible " + this.src);
                          },
                          false);
    image.crossOrigin = 'anonymous'; // Esto evita que Chrome se queje de SecurityError al cargar la imagen de otro dominio
    image.src         = filename;

  }
  
  function setTexture (image, texturePos) {

    // se indica el objeto textura
    gl.bindTexture(gl.TEXTURE_2D, texturesId[texturePos]);

    // Descomentar si es necesario voltear la textura
    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      
    // datos de la textura
    gl.texImage2D (gl.TEXTURE_2D, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
      
    // parámetros de filtrado
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      
    // parámetros de repetición (ccordenadas de textura mayores a uno)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
      
    // creación del mipmap
    gl.generateMipmap(gl.TEXTURE_2D);

    texturesId[texturePos].loaded = true; // textura ya disponible

    if (allTexturesLoaded()) {
      
      initHandlers();
      requestAnimationFrame(drawScene);
      
    }

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
          requestAnimationFrame(drawScene);
        }
      }, 10)
    }
  }

  
  function fallAnimation(camera) {
    camera.eye[1]-=1;
    camera.center[1]-=1;
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
        currentTree.name = "Arbre " + objectsScene.length;
        currentTree.idTextura = 5;
        currentTree.material = Green_plastic;

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
      drawLights();

      var floor = new Figure(defaultPlane, 100);
      floor.name = "Terra";
      floor.material = Green_rubber;
      floor.idTextura = 4;
      floor.setMatrix(0,-1.5,0);
      createModel(floor);
      //floor.changeSize(1)
      objectsScene.push(floor);
      
      var house = new SquareObject(casaOBJ);
      house.name = "Casa";
      house.idTextura = 2;
      house.material = Gold;
      house.setMatrix(-10,-1.5,0,1);
      createModel(house);
      objectsScene.push(house);
      
      var esglesia = new SquareObject(esglesiaOBJ);
      esglesia.name = "Esglesia";
      esglesia.idTextura = 2
      esglesia.material = Gold;
      esglesia.setMatrix(-10,-1.5,10,1);
      createModel(esglesia);
      objectsScene.push(esglesia);
      
      var rock = new SquareObject(rockOBJ);
      rock.name = "Roca 1";
      rock.idTextura = -1;
      rock.material = Polished_silver;
      rock.setMatrix(-3,-1.5,30,1);
      createModel(rock);
      objectsScene.push(rock);

      var rock = new SquareObject(rockOBJ);
      rock.name = "Roca 2";
      rock.idTextura = 1;
      rock.material = Polished_silver;
      rock.setMatrix(20,-1.5,20,1);
      createModel(rock);
      objectsScene.push(rock);
      
      var rock = new SquareObject(rockOBJ);
      rock.name = "Roca 3";
      rock.idTextura = 1;
      rock.material = Polished_silver;
      rock.setMatrix(20,0,-20,1);
      createModel(rock);
      objectsScene.push(rock);
      
      var rock = new SquareObject(rockOBJ);
      rock.name = "Roca 4";
      rock.idTextura = 1;
      rock.material = Polished_silver;
      rock.setMatrix(20,-1.5,0,1);
      createModel(rock);
      objectsScene.push(rock);
      
      var piano = new SquareObject(pianoOBJ);
      piano.name = "Piano";
      piano.idTextura = 1;
      piano.material = Obsidian;
      piano.setMatrix(7,-2,20,1);
      createModel(piano);
      objectsScene.push(piano);
      
      var sofa = new SquareObject(sofaTop);
      sofa.name = "Sofa";
      sofa.idTextura = 0;
      sofa.material = Turquoise;
      sofa.setMatrix(10,-1.7,20,1);
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
    initTextures();
    requestAnimationFrame(drawScene);
    
  }

  initWebGL();
