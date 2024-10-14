/**
 * @file fish.js
 * @author Bernat Comas Machuca
 * @class Fish
 */

class Fish {
    // center X of the fish
    pos_x
    // center Y of the fish
    pos_y
    // Height of the fish
    height
    // Width of the fish
    width
    // Speed of movement of the fish. It has to be higher than 1 because it can't go faster than the ball. Used as game_velocity/speed
    speed
    // Main colour of the fish
    colour1
    // Secondary colour of the fish
    colour2
    // Maximum fish width allowed.
    static max_fish_width = 0.2
  
    constructor(pos_x, pos_y, size, speed, colour1 = [0.961, 0.282, 0.118, 1.0], colour2 = [0.357, 0.596, 0.647, 1.0]){
      this.pos_x = pos_x
      this.pos_y = pos_y
      this.height = size/2
      this.width = size
      this.speed = speed
      this.colour1 = colour1
      this.colour2 = colour2
    }
  
    // Draws current fish
    draw(){
        drawFish(this.pos_x, this.pos_y, this.width, this.height, this.colour1, this.colour2)
    }
}