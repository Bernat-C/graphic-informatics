/**
 * @file plane.js
 * @author Bernat Comas Machuca
 * @class Plane
 */


class Plane {
  vertices;
  indices;
  modelMatrix;
  wireframeColour=[1,1,1];
  solidColour=[0.7, 0.7, 0.7];

  constructor(){
    this.vertices = defaultPlane.vertices;
    this.indices = defaultPlane.indices;
    this.modelMatrix = mat4.create();
  }

  /**
   * Translates the object the specified coordinates.
   * It also scales the plane s units in every axis.
   * @param {number} tx 
   * @param {number} ty 
   * @param {number} tz 
   * @param {number} s 
   */
  setMatrix(tx, ty, tz)
    {
      var M = mat4.create();
      mat4.fromScaling (M, [1, 1, 1]);
      var T1 = mat4.create();
      mat4.fromTranslation(T1,[tx,ty,tz]);
      mat4.multiply(M, M, T1);
      this.modelMatrix = M;
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
   * Rotates the plane the specified angle in radians
   * @param {number} angle 
   */
  rotate(angle)
  {
    var R = mat4.create();
    mat4.fromRotation(R, angle, [0,0,1]);
    mat4.multiply(this.modelMatrix, this.modelMatrix, R);
  }

  /**
   * Animates the plane
   * Currently it does not do anything due to the requirements of the application but it has to implement the method because it is an object.
   * @param {number} s 
   */
   animate (s)
   {
   }
}