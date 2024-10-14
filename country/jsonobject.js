/**
 * @file jsonobject.js
 * @author Bernat Comas Machuca
 * @class JsonObject
 */


class JsonObject {
  vertices;
  indices;
  textcoords;
  normals;
  modelMatrix;
  centerX;
  centerZ;
  scaling;

  constructor(jsonobject){
    this.vertices = this.createVerticesArray(jsonobject.vertices, jsonobject.normals);
    this.indices = jsonobject.indices;
    this.modelMatrix = mat4.create();
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
   * @param {number} tx 
   * @param {number} ty 
   * @param {number} tz 
   * @param {number} s 
   */
  setMatrix(tx, ty, tz, scaling=1)
    {
      var M = mat4.create();
      mat4.fromScaling (M, [scaling,scaling,scaling]);
      var T1 = mat4.create();
      mat4.fromTranslation(T1,[tx,ty,tz]);
      mat4.multiply(M, M, T1);
      this.modelMatrix = M;
      this.centerX = tx;
      this.centerZ = tz;
    }

  /**
   * Rotates the plane the specified angle in radians
   * @param {number} angle in radians
   */
  rotate(angle, axis="z")
  {
    let vector = []
    switch (axis) {
      case "x":
        vector = [1,0,0]
        break;
      case "y":
        vector = [0,1,0]
        break;
      case "z":
        vector = [0,0,1]
        break;
    }
    var R = mat4.create();
    mat4.fromRotation(R, angle, vector);
    mat4.multiply(this.modelMatrix, this.modelMatrix, R);
  }

  isContact(camera){
    console.log("Falta implementar")
    return false;
  }
}

class Tree extends JsonObject {
  radius;

  constructor(jsonobject){
    super(jsonobject)
    this.radius = 0.5;
  }

  isContact(camera){
    //console.log(this.distance(camera, [this.centerX, 0,this.centerZ]));
    if(this.distance(camera, [this.centerX, 0,this.centerZ])<this.radius) {
      return true;
    }
    return false
  }

  distance(camera, point) {
    const e = camera.eye;
    return Math.sqrt(Math.pow(e[0] - point[0], 2) + Math.pow(e[2] - point[2], 2));
  }
  
}

class SquareObject extends JsonObject {
  hitbox;

  constructor(jsonobject){
    super(jsonobject)
    this.hitbox = this.createSquareHitbox(jsonobject.vertices);
  }

  setMatrix(tx, ty, tz, scaling=1) {
    super.setMatrix(tx, ty, tz, scaling);
    this.hitbox = this.createSquareHitbox(this.vertices);
  }

  isContact(camera) {
    // Check if the point's coordinates fall within the hitbox boundaries
    const withinXBounds = camera.eye[0] >= this.hitbox[0] - this.hitbox[2] && camera.eye[0] <= this.hitbox[0] + this.hitbox[2];
    const withinZBounds = camera.eye[2] >= this.hitbox[1] - this.hitbox[2] && camera.eye[2] <= this.hitbox[1] + this.hitbox[2];
  
    // Return true if the point is inside the hitbox, false otherwise
    return withinXBounds && withinZBounds;
  }
  

  createSquareHitbox(vertices) {
    let minX = Infinity,
        minZ = Infinity,
        maxX = -Infinity,
        maxZ = -Infinity;
  
    // Find minimum and maximum x, y coordinates
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 2];
  
      minX = Math.min(minX, x);
      minZ = Math.min(minZ, z);
      maxX = Math.max(maxX, x);
      maxZ = Math.max(maxZ, z);
    }
  
    // Calculate width and height of the square hitbox
    const width = maxX - minX;
    const height = maxZ - minZ;
  
    // Determine the size of the square (larger of width or height)
    const size = Math.max(width, height);
  
    // Calculate the center of the square hitbox
    const centerX = (maxX + minX) / 2 + this.centerX;
    const centerZ = (maxZ + minZ) / 2 + this.centerZ;
  
    const squareHitbox = [
      centerX,
      centerZ,
      size/2];

      console.log(squareHitbox);
  
    return squareHitbox;
  }
  
  distance(camera, point) {
    const e = camera.eye;
    return Math.sqrt(Math.pow(e[0] - point[0], 2) + Math.pow(e[2] - point[2], 2));
  }
  
}