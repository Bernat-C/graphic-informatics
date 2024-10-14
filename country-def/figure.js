/**
 * @file figure.js
 * @author Bernat Comas Machuca
 * @class Figure
 */


class Figure {
  vertices;
  indices;
  textcoords;
  size = 10;
  modelMatrix;
  material=Yellow_plastic;
  idTexture=null;

  constructor(figure, size = 10){
    this.vertices = figure.vertices;
    this.indices = figure.indices;
    this.textcoords = this.calculateTextureCoordinates();
    this.modelMatrix = mat4.create();
    this.size = size;
  }

  /**
   * Translates the object the specified coordinates.
   * It also scales the Figure s units in every axis.
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
   * Rotates the figure the specified angle in radians
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

  calculateTextureCoordinates() {

      let minX = Infinity;
      let maxX = -Infinity;
      let minZ = Infinity;
      let maxZ = -Infinity;

      // Find the bounds of the plane
      for (let i = 0; i < this.vertices.length; i += 8) {
          const x = this.vertices[i];
          const z = this.vertices[i + 2];

          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minZ = Math.min(minZ, z);
          maxZ = Math.max(maxZ, z);
      }

      const textureCoordinates = [];

      // Calculate texture coordinates for each vertex
      for (let i = 0; i < this.vertices.length; i += 3) {
          const x = this.vertices[i];
          const z = this.vertices[i + 2];

          const u = (x - minX) / (maxX - minX);
          const v = (z - minZ) / (maxZ - minZ);

          textureCoordinates.push({ u, v });
      }

      return textureCoordinates;
  }

}