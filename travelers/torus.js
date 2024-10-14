/**
 * @file torus.js
 * @author Bernat Comas Machuca
 * @class Torus
 */

class Torus {
  wireframeColour=[0.5,0.5,0.5];
  solidColour=[1,0,0];

  /**
   * Length of the side of a cube
   */
  static TORUS_RADIUS = 0.5

  constructor(){
    var torus = makeTorus (0.1, 0.8, 1, Math.random()*20);
    this.vertices = torus.vertices;
    this.indices = torus.indices;
    this.modelMatrix = mat4.create();
  }

  /**
   * Sets the color of all vertices to arrCol
   * @param {} arrCol 
   */
  setColor(arrCol){
    for (var i = 3; i < this.vertices.length; i += 14) {
      this.vertices[i] = arrCol[0];
      this.vertices[i + 1] = arrCol[1];
      this.vertices[i + 2] = arrCol[2];
      this.vertices[i+7] = arrCol[0]-0.2;
      this.vertices[i + 8] = arrCol[1]-0.2;
      this.vertices[i + 9] = arrCol[2]-0.2;
    }
  }

  /**
   * Sets the colour by type of layout
   */
  setLayoutColor(layout){
    switch(layout){
      case "wireframe":
        this.setColor(this.wireframeColour)
        break;
      case "solid":
        this.setColor(this.solidColour)
        break;
    }
  }

  /**
   * Translates the object the specified coordinates.
   * It also scales the torus s units in every axis.
   * @param {number} tx 
   * @param {number} ty 
   * @param {number} tz 
   * @param {number} s 
   */
  setMatrix(tx, ty, tz, s)
    {
      var M = mat4.create();
      var T1 = mat4.create();
      mat4.fromScaling (M, [s, s, s]);
      mat4.fromTranslation(T1,[tx,ty,tz]);
      mat4.multiply(M, M, T1);
      this.modelMatrix = M;
    }

    /**
     * Animates the torus it is moven s/4 units closer to the user and it is rotated s radians in the z axis.
     * @param {number} s 
     */
   animate (s)
   {
        var T = mat4.create();
        mat4.fromTranslation(T,[0,0,s/4])
        mat4.multiply(this.modelMatrix, this.modelMatrix, T);
        var R = mat4.create();
        mat4.fromRotation(R, s, [0,0,1]);
        mat4.multiply(this.modelMatrix, this.modelMatrix, R);
   }

   /**
    * Returns true if the cube's Z is further in z index than the camera plus cube side and therefore should be deleted
    * @param {*} zCamera 
    */
   shouldBeDeleted(zCamera){
    const cubePosition = vec4.create();
    // Obtain cube Z position
    vec4.transformMat4(cubePosition, [0, 0, 0, 1], this.modelMatrix);
    
    return cubePosition[2] > zCamera + Cube.CUBE_SIDE;
   }

   /**
    * Moves torus in the desired direction
    */
   moveDir(direction){
    switch(direction){
      case "up":
        var T = mat4.create();
        mat4.fromTranslation(T,[0,Cube.CUBE_SIDE+0.02,0])
        mat4.multiply(this.modelMatrix, this.modelMatrix, T);
        break;
      case "down":
        var T = mat4.create();
        mat4.fromTranslation(T,[0,-Cube.CUBE_SIDE-0.02,0])
        mat4.multiply(this.modelMatrix, this.modelMatrix, T);
        break;
      case "left":
        var T = mat4.create();
        mat4.fromTranslation(T,[-Cube.CUBE_SIDE-0.02,0,0])
        mat4.multiply(this.modelMatrix, this.modelMatrix, T);
        break;
      case "right":
        var T = mat4.create();
        mat4.fromTranslation(T,[Cube.CUBE_SIDE+0.02,0,0])
        mat4.multiply(this.modelMatrix, this.modelMatrix, T);
        break;
    }
   }
}
