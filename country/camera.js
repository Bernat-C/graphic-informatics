
class Point {
    name;
    eye;
    center;
    myPhi;
    myZeta;
    isFalling;
    lastMouseX;
    lastMouseY;

    constructor(name, camera){
        this.name = name;
        this.eye = {...camera.eye};
        this.center = {...camera.center};
        this.isFalling = camera.isFalling;
        this.myPhi = camera.myPhi;
        this.myZeta = camera.myZeta;
        this.lastMouseX = camera.lastMouseX;
        this.lastMouseY = camera.lastMouseY;
    }
}
  
/**
 * Class to control the camera
 */
class Camera {
    eye;
    center;
    myZeta;
    myPhi;
    radius;
    fovy;
    speed;
    points;
    lastMouseX;
    lastMouseY;
    isFalling;
  
    constructor(speed=0.2){
      this.eye = [0, 0, 0];
      this.center = [0, 0, 0];
      this.myZeta = 1.50;
      this.myPhi = 1.50;
      this.radius = 1;
      this.fovy = 1.4;
      this.lastMouseX = 0;
      this.lastMouseY = 0;
      this.isFalling = false;
      this.speed = speed;
      this.points = [];
    }
  
    // Returns the camera matrices
    getMatrix() {
  
      return mat4.lookAt(mat4.create(), this.eye, this.center, [0, 1, 0]);
    }
  
    /**
     * @param dir: 1: forward | 2: right | 3: backwards | 4: left
     * 
     */
    moveCamera(dir, objs){
  
      // Calculem l'angle en x i en y en que es troba la càmera
      const prevEye = {...this.eye}
      const prevCenter = {...this.center}

      const mX = this.center[0] - this.eye[0];
      const mY = this.center[1] - this.eye[1];
      const mZ = this.center[2] - this.eye[2];

      if(this.eye[0]>50 || this.eye[0]<-50 || this.eye[2]>50 || this.eye[2]<-50) return -1;
  
      switch(dir){
        case 1:
          camera.eye[0] += mX * this.speed;
          camera.eye[2] += mZ * this.speed;
          camera.center[0] += mX * this.speed;
          camera.center[2] += mZ * this.speed;
          break;
        case 2:
          const rightDirection = this.crossProduct([mX, mY, mZ], [0, 1, 0]);
  
          this.eye[0] += rightDirection[0] * this.speed;
          this.eye[2] += rightDirection[2] * this.speed;
  
          this.center[0] += rightDirection[0] * this.speed;
          this.center[2] += rightDirection[2] * this.speed;
          break;
        case 3:
          camera.eye[0] -= mX * this.speed;
          camera.eye[2] -= mZ * this.speed;
          camera.center[0] -= mX * this.speed;
          camera.center[2] -= mZ * this.speed;
          break;  
        case 4:
          const rightDir = this.crossProduct([mX, mY, mZ], [0, 1, 0]);
  
          this.eye[0] -= rightDir[0] * this.speed;
          this.eye[2] -= rightDir[2] * this.speed;
  
          this.center[0] -= rightDir[0] * this.speed;
          this.center[2] -= rightDir[2] * this.speed;
          break;
      }

      for(let i=0; i<objs.length; i++) {
        if(objs[i].isContact(this)) {
          console.log("CONTACTE ARBIT")
          this.center = {...prevCenter};
          this.eye = {...prevEye};
        }
      }

      requestAnimationFrame(drawScene);
    }
  
    crossProduct(vec1, vec2) {
      return [
        vec1[1] * vec2[2] - vec1[2] * vec2[1],
        vec1[2] * vec2[0] - vec1[0] * vec2[2],
        vec1[0] * vec2[1] - vec1[1] * vec2[0],
      ];
    }
    
  
    updateCenterFromRotation(){
      
        // Calculate spherical coordinates
        const x = -this.radius * Math.sin(this.myPhi) * Math.cos(this.myZeta);
        const y = -this.radius * Math.cos(this.myPhi);
        const z = -this.radius * Math.sin(this.myPhi) * Math.sin(this.myZeta);
  
        // Calculate viewpoint (add eye position to the spherical coordinates)
        this.center = [
          x + this.eye[0],
          y + this.eye[1],
          z + this.eye[2]]
    }

    savePoint(name) {
        this.points.push(new Point(name, this));
    }

    loadPoint(name) {
        const p = this.points.find(point => point.name === name);
        if(p!==undefined){
            this.eye = {...p.eye};
            this.center = {...p.center};
            this.myPhi = p.myPhi;
            this.myZeta = p.myZeta;
            this.lastMouseX = p.lastMouseX;
            this.lastMouseY = p.lastMouseY;
            this.isFalling = p.isFalling;
        }
        else console.log("The point was not found.")
    }
  }