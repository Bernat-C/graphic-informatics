/**
 * @file light.js
 * @author Bernat Comas Machuca
 * @class Light
 */


class Light {
    
    position;
    La;
    Ld;
    Ls;
    Intensity;
  
    constructor(position, La, Ld, Ls, intensity){
        this.position = position;
        this.La = La;
        this.Ld = Ld;
        this.Ls = Ls;
        this.Intensity = intensity;
    }
}