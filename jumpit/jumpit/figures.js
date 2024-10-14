/**
 * @file figures.js
 * @author Bernat Comas Machuca
 * @brief Contains all figures needed for the game
 */

/**
 * Dibuixa una espiral.
 * @param {number} cX Posició X del centre
 * @param {number} cX Posició Y del centre
 * @param {number} radius Radi del polígon (des del centre fins als vèrtex)
 * @param {number} numSegments Nombre de segments del polígon, ex un quadrat son 4.
 * 
 */
function drawSpiralBall(cX, cY, radius, rotationAngle, colour) {
    const vertices = [];
    const indices = [];
  
    for (let i = 0; i < 720; i++) {
      const angle = 0.1 * i;
      var x;
      var y;
  
      // Rotem la pilota
      const rotatedAngle = angle + rotationAngle;
  
      if (ball.is_jumping || !game.running) { // Si la pilota salta fem l'animació de saltar.
        x = cX + (2 * radius * angle) * Math.cos(rotatedAngle) * Math.cos(rotationAngle);
        y = cY + (2 * radius * angle) * Math.sin(rotatedAngle) * Math.sin(rotationAngle);
      } else {
        x = cX + (2 * radius * angle) * Math.cos(rotatedAngle);
        y = cY + (2 * radius * angle) * Math.sin(rotatedAngle);
      }
      vertices.push(x, y, 1.0);
      vertices.push(...colour)
  
      if (i > 0) {
        indices.push(i - 1, i);
      }
    }
  
    const idBufferVertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, idBufferVertices);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 7*4, 0); // 7*4 perquè tindrem 3 pos + 4 colour * 1 float (4 bytes)
    gl.vertexAttribPointer(program.vertexColorAttribute,    4, gl.FLOAT, false, 7*4, 3*4);
  
    const idBufferIndices = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idBufferIndices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  
    gl.drawElements(gl.LINE_LOOP, indices.length, gl.UNSIGNED_SHORT, 0);
  }
  
  
/**
 * Dibuixa un Poligon
 * @param {number} cX Posició X del centre
 * @param {number} cX Posició Y del centre
 * @param {number} radius Radi del polígon (des del centre fins als vèrtex)
 * @param {number} numSegments Nombre de segments del polígon, ex un quadrat son 4.
 * 
 */
function drawPolygon(cX, cY, radius, numSegments, rotationAngle, colour) {
    // Instantiate the list of vertices and indices
    const vertices = [];
    const indices = [];
  
    // Recorrem des de i fins numSegments (ja que serà el nombre de punts que haurem d'unir per fer el cercle)
    for (let i = 0; i < numSegments; i++) {
  
      // Calculem on col·locarem el següent punt: que tindrà angle i/numSegments graus (anant des de la fracció 1/numSegments fins a numSegments/numSegments)
      // Ho convertim a Radians multiplicant per 2*PI per poder calcular-ne el cosinus i el sinus.
      const angle = (i / numSegments) * 2 * Math.PI + rotationAngle;
      const x = cX + radius * Math.cos(angle);
      const y = cY + radius * Math.sin(angle);
      vertices.push(x, y, 1.0);
      vertices.push(...colour);
  
      // Afegim els índex de manera ordenada ja que volem que es connecti cada un amb l'anterior.
      if (i > 0) {
        indices.push(i - 1, i);
      }
    }
  
    // Connectem l'últim vèrtex amb el primer per tancar el cercle
    indices.push(numSegments - 1, 0);
  
    // Creem el buffer, que serà un array_buffer static i utilitzarem LINE_LOOP per tancar el recorregut.
    const idBufferVertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, idBufferVertices);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 7*4, 0);
    gl.vertexAttribPointer(program.vertexColorAttribute,    4, gl.FLOAT, false, 7*4, 3*4);
  
    const idBufferIndices = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idBufferIndices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  
    gl.drawElements(gl.TRIANGLE_FAN, indices.length, gl.UNSIGNED_SHORT, 0);
  }
  
/**
 * Dibuixa un quadrat
 * @param {number} centerX Posició X del centre
 * @param {number} centerY Posició Y del centre
 * @param {number} height Altura del quadrat.
 * @param {number} width Amplada del quadrat.
 * @param {number} colourbl Color del vèrtex bottom left.
 * @param {number} colourbr Color del vèrtex bottom right.
 * @param {number} colourtr Color del vèrtex top right.
 * @param {number} colourtl Color del vèrtex top left.
 */
function drawSquare(centerX, centerY, height, width, colourbl, colourbr, colourtr, colourtl) {
    
    h2 = height / 2
    w2 = width / 2
  
    const vertices = [];

    // Top Right
    vertices.push(centerX + w2, centerY + h2, 1.0);
    vertices.push(...colourtr);
    // Top Left
    vertices.push(centerX - w2, centerY + h2, 1.0);
    vertices.push(...colourtl);
    // Bottom left
    vertices.push(centerX - w2, centerY - h2, 1.0);
    vertices.push(...colourbl);
    // Bottom Right
    vertices.push(centerX + w2, centerY - h2, 1.0);
    vertices.push(...colourbr);
  
    //
    const indices = [
      0, 2, 3, 0, 2, 1
    ];
  
    const idBufferVertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, idBufferVertices);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  
    const idBufferIndices = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idBufferIndices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  
    gl.bindBuffer(gl.ARRAY_BUFFER, idBufferVertices);
    gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 7*4, 0);
    gl.vertexAttribPointer(program.vertexColorAttribute,    4, gl.FLOAT, false, 7*4, 3*4);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}
  
/**
 * Dibuixa el títol del joc en pantalla (JUMP IT)
 */
function drawTitle(centerX = 0, height = 0.5){
    const width = 0.05
    const lt_height = 0.3
    const lt_width = 0.3
    const spacing = 0.1
    const space_words = 0.3
  
    const centering = centerX-0.4

    //const colour = [0.169, 0.471, 0.635, 1.0];
    const colour = [1.0, 1.0, 1.0, 1.0];
  
    
    const middle_X_U = -lt_width/2-spacing/2
    const middle_X_J = -spacing-lt_width+middle_X_U
    const middle_X_M = +lt_width/2+spacing/2
    const middle_X_P = +lt_width+spacing+middle_X_M
    const middle_X_I = +middle_X_P+space_words+lt_width/2
    const middle_X_T = +middle_X_I+spacing+lt_width
  
    const middle_Y = height+lt_height/2-width/2
    // J
    drawSquare(centering + middle_X_J, height, width, lt_width, colour, colour, colour, colour)
    drawSquare(centering + -lt_width-spacing/2-spacing-width/2, middle_Y, lt_height, width, colour, colour, colour, colour)
    drawSquare(centering + -lt_width-lt_width+width-spacing/2-spacing-width/2, height+lt_height/8, lt_height/4, width, colour, colour, colour, colour)
    drawSquare(centering + middle_X_J, height+lt_height-width/2, width, lt_width, colour, colour, colour, colour)
    // U
    drawSquare(centering + middle_X_U, height, width, lt_width, colour, colour, colour, colour)
    drawSquare(centering + -lt_width-spacing/2+width/2, middle_Y+width/2, lt_height, width, colour, colour, colour, colour)
    drawSquare(centering + -spacing/2-width/2, middle_Y+width/2, lt_height, width, colour, colour, colour, colour)
    // M
    drawSquare(centering + middle_X_M, height+lt_height-width/2, width, lt_width, colour, colour, colour, colour)
    drawSquare(centering + lt_width+spacing/2-width/2, middle_Y, lt_height, width, colour, colour, colour, colour)
    drawSquare(centering + spacing/2+width/2, middle_Y, lt_height, width, colour, colour, colour, colour)
    drawSquare(centering + spacing/2+lt_width/2, middle_Y, lt_height, width, colour, colour, colour, colour)
    // P
    drawSquare(centering + middle_X_P, height+lt_height-width/2, width, lt_width, colour, colour, colour, colour)
    drawSquare(centering + middle_X_P, middle_Y, width, lt_width, colour, colour, colour, colour)
    drawSquare(centering + lt_width+spacing+width/2+spacing/2, middle_Y, lt_height, width, colour, colour, colour, colour)
    drawSquare(centering + lt_width+spacing+lt_width-width/2+spacing/2, height+3*lt_height/4-width/2, lt_height/2, width, colour, colour, colour, colour)
  
    // I
    drawSquare(centering + middle_X_I, height+lt_height-width/2, width, lt_width, colour, colour, colour, colour)
    drawSquare(centering + middle_X_I, height+width/2, width, lt_width, colour, colour, colour, colour)
    drawSquare(centering + middle_X_I, height+lt_height/2, lt_height, width, colour, colour, colour, colour)
    // T
    drawSquare(centering + middle_X_T, height+lt_height-width/2, width, lt_width, colour, colour, colour, colour)
    drawSquare(centering + middle_X_T, height+lt_height/2, lt_height, width, colour, colour, colour, colour)
}

/**
 * Draws a fusg
 * @param number centerX centerX of the fish
 * @param number centerY centerY of the fish
 * @param number width width of the fish
 * @param number height height of the fish
 * @param array[4] colour1 colour 1 of the fish
 * @param array[4] colour2 colour 2 of the fish
 */
function drawFish(centerX, centerY, width, height, colour1, colour2) {

    const vertices = []
    vertices.push(centerX, centerY, 1.0) // Center point
    vertices.push(...colour1)
    vertices.push(centerX - width / 2, centerY + height / 2, 1.0) // Left fin
    vertices.push(...colour1)
    vertices.push(centerX - width / 4, centerY, 1.0) // Body
    vertices.push(...colour1)
    vertices.push(centerX - width / 2, centerY - height / 2, 1.0) // Left tail
    vertices.push(...colour1)
    vertices.push(centerX + width / 4, centerY, 1.0) // Head
    vertices.push(...colour2)
    vertices.push(centerX + width / 2, centerY + height / 2, 1.0) // Right fin
    vertices.push(...colour2)
    vertices.push(centerX + width / 2, centerY - height / 2, 1.0) // Right tail
    vertices.push(...colour2)
    
    const idBufferVertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, idBufferVertices);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 7*4, 0);
    gl.vertexAttribPointer(program.vertexColorAttribute,    4, gl.FLOAT, false, 7*4, 3*4);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length/7);
}
