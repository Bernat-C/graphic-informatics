/**
 * @file cube.js
 * @author Bernat Comas Machuca
 * @class Cube
 */

class Cube {
  wireframeColour=[1,1,1];
  solidColour=[0.1, 0.5, 0.5];

  /**
   * Length of the side of a cube
   */
  static CUBE_SIDE = 0.2

  /**
   * Threshold to detect collisions with the cube
   */
  static CUBE_THRESHOLD = this.CUBE_SIDE/2-0.01

  constructor(){
    this.vertices = defaultCube.vertices;
    this.indices = defaultCube.indices;
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
      this.vertices[i+7] = arrCol[0]+0.2;
      this.vertices[i + 8] = arrCol[1]+0.2;
      this.vertices[i + 9] = arrCol[2]+0.2;
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
   * It also scales the cube s units in every axis.
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
     * Animates the cube it is moven s/4 units closer to the user
     * @param {number} s 
     */
   animate (s)
   {
        var T = mat4.create();
        mat4.fromTranslation(T,[0,0,s/4])
        mat4.multiply(this.modelMatrix, this.modelMatrix, T);
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
    * Returns true if the position touches the cube's position
    * @param {Posx of camera} camX 
    * @param {Posy of camera} camY 
    * @param {Posz of camera} camZ 
    * @returns 
    */
   hitsCamera(camX, camY, camZ) {
      // Calculate the transformed position of the cube
      const cubePosition = vec4.create();

      // Get the position of the camera
      vec4.transformMat4(cubePosition, [0, 0, 0, 1], this.modelMatrix);

      // Check if cube is in distance of camera
      const distance = vec3.distance([cubePosition[0], cubePosition[1], cubePosition[2]], [camX, camY, camZ]);

      if(distance <= Cube.CUBE_THRESHOLD) console.log("D" + distance)

      return distance <= Cube.CUBE_THRESHOLD;
    }

   /**
    * Moves cube in the desired direction
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
