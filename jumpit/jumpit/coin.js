/**
 * @file coin.js
 * @author Bernat Comas Machuca
 * @class Coin
 */

class Coin {
    // center X of the coin
    pos_x
    // center Y of the coin
    pos_y
    // Coin radius, static predefined
    static radius = 0.1
  
    constructor(pos_x, pos_y){
      this.pos_x = pos_x
      this.pos_y = pos_y
    }
  
    // Checks if the ball passed should take the current token and returns true or false accordingly. Uses euclidean distance
    isCoinTaken(ball) {
      const dx = this.pos_x - ball.pos_x;
      const dy = this.pos_y - ball.pos_y;
      const distance = Math.sqrt(dx * dx + dy * dy);
    
      // Check if the distance is less than or equal to the sum of their radius
      if (distance <= Coin.radius + Ball.radius) {
        return true;
      } else {
        return false;
      }
    }  
  
    // Draws a coin
    draw(){
      const colourMain = [1, 0.867, 0, 1.0]
      const colourSec = [0.0, 0.0, 0.0, 1.0]
      const colourSq = [0,0,0,1]
      drawPolygon(this.pos_x, this.pos_y, Coin.radius, 64, 0, colourMain)
      drawPolygon(this.pos_x, this.pos_y, 26*Coin.radius/30, 64, 0, colourSec)
      drawPolygon(this.pos_x, this.pos_y, 25*Coin.radius/30, 64, 0, colourMain)
      drawSquare(this.pos_x, this.pos_y, Coin.radius, Coin.radius/10, colourSq, colourSq, colourSq, colourSq)
    }
}