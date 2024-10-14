/**
 * @file plane.js
 * @author Bernat Comas Machuca
 * @class Plane
 */


class Plane {
  vertices;
  indices;
  size = 10;
  modelMatrix;

  constructor(size = 10){
    this.vertices = defaultPlane.vertices;
    this.indices = defaultPlane.indices;
    this.modelMatrix = mat4.create();
    this.size = size;
  }

  createVerticesArray(vertices, normals) {
    const result = [];
    let index1 = 0;
    let index2 = 0;

    while (index1 < vertices.length || index2 < normals.length) {
      for (let i = 0; i < 3; i++) {
        if (index1 < vertices.length) {
          result.push(vertices[index1]);
          index1++;
        }
      }
      for (let i = 0; i < 3; i++) {
        if (index2 < normals.length) {
          result.push(normals[index2]);
          index2++;
        }
      }
    }

    return result;
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
      mat4.fromScaling (M, [this.size, 1, this.size]);
      var T1 = mat4.create();
      mat4.fromTranslation(T1,[tx,ty,tz]);
      mat4.multiply(M, M, T1);
      this.modelMatrix = M;
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

  isContact(camera){
    return false;
  }
}