// ---------------------------------------------------------------------------
// Primitivas geometricas basicas
// J. Ribelles, A. Lopez
// Mayo 2018
// Modified by Bernat Comas
// ---------------------------------------------------------------------------

var defaultPlane = {  // 4 vértices, 2 triángulos

    "vertices" : [-0.5, 0.0, 0.5,   1, 1, 1, 1,
                   0.5, 0.0, 0.5,   1, 1, 1, 1,
                   0.5, 0.0,-0.5,   1, 1, 1, 1,
                  -0.5, 0.0,-0.5,   1, 1, 1, 1
                ],
    
    "indices" : [0, 1, 2, 0, 2, 3]

};
  
var defaultCube = {  // 8 vértices, 12 triángulos
    
    "vertices" : [-0.1,-0.1,  0.1,   0.1, 1, 1, 1, 
                   0.1,-0.1,  0.1,   0.1, 1, 1, 1, 
                   0.1, 0.1,  0.1,   0.1, 1, 1, 1, 
                  -0.1, 0.1,  0.1,   0.1, 1, 1, 1, 
                  -0.1,-0.1, -0.1,   0.1, 1, 1, 1, 
                   0.1,-0.1, -0.1,   0.1, 1, 1, 1, 
                   0.1, 0.1, -0.1,   0.1, 1, 1, 1, 
                  -0.1, 0.1, -0.1,   0.1, 1, 1, 1
                ],

    "indices" : [ 0, 1, 2, 0, 2, 3, 
                  1, 5, 6, 1, 6, 2,
                  3, 2, 6, 3, 6, 7,
                  5, 4, 7, 5, 7, 6,
                  4, 0, 3, 4, 3, 7,
                  4, 5, 1, 4, 1, 0]

};

/**
 * Returns a default torus with the specified inner Radius, outer Radius, number of sides and number of rings.
 * @param {*} innerRadius 
 * @param {*} outerRadius 
 * @param {*} nSides 
 * @param {*} nRings 
 * @returns an object torus with a list of vertices and list of indices to follow to draw the torus.
 */
function makeTorus (innerRadius, outerRadius, nSides, nRings) {
        
  var torus = {
      "vertices" : [],
      "indices"  : []
  };
  
  if (nSides < 3 ) nSides = 3;
  if (nRings < 3 ) nRings = 3;
        
  var dpsi =  2.0 * Math.PI / nRings ;
  var dphi = -2.0 * Math.PI / nSides ;
  var psi  =  0.0;
  
  for (var j = 0; j < nRings; j++) {
    
    var cpsi = Math.cos ( psi ) ;
    var spsi = Math.sin ( psi ) ;
    var phi  = 0.0;

    for (var i = 0; i < nSides; i++) {
      
      var offset = 7 * ( j * (nSides+1) + i ) ;
      var cphi   = Math.cos ( phi ) ;
      var sphi   = Math.sin ( phi ) ;
      
      torus.vertices[offset + 0] = cpsi * ( outerRadius + cphi * innerRadius ) ;
      torus.vertices[offset + 1] = spsi * ( outerRadius + cphi * innerRadius ) ;
      torus.vertices[offset + 2] =                        sphi * innerRadius   ;
      torus.vertices[offset + 3] = 1;
      torus.vertices[offset + 4] = 1;
      torus.vertices[offset + 5] = 1;
      torus.vertices[offset + 6] = 1;
      
      phi += dphi;
      
    }

    var offset = torus.vertices.length;
    for (var i = 0; i < 7; i++)
      torus.vertices[offset + i] = torus.vertices[offset-nSides*7+i];

    psi += dpsi;
    
  }

  var offset = torus.vertices.length;
  for (var i = 0; i < 7*(nSides+1); i++)
    torus.vertices[offset+i] = torus.vertices[i];

  for (var j = 0; j < nRings; j++){
    
    var desp = j * (nSides + 1);

    for (var i = 0; i < nSides; i++){
      
      torus.indices.push(desp + i,     desp + i + 1,              desp + i + (nSides+1)); 
      torus.indices.push(desp + i + 1, desp + i + (nSides+1) + 1, desp + i + (nSides+1)); 
      
    }
    
  }

  return torus; 
  
}