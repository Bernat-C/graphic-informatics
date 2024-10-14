/**
 * @file pltform.js
 * @author Bernat Comas Machuca
 * @class Platform
 */

const PLATFORM_RADIUS = 0.1;

class Platform {
    // Current center x of the platform
    pos_x 
    // All platforms are in the same height
    static pos_y = 0 - BALL_RADIUS - PLATFORM_RADIUS
    // Ledge or how much can a ball be outside of a platform before falling. Eases the game.
    static ledge = 0.05
  
    constructor(position = X_RIGHT_SCREEN_LIMIT + PLATFORM_RADIUS) {
      // Les plataformes es generaran fora la pantalla
      this.pos_x = position;
    }
  
    // Draws a platform.
    draw(){
        const colour1 = [0.506, 0.282, 0.153, 1.0]
        const colour2 = [0.361, 0.141, 0.078, 1.0]
        drawSquare(this.pos_x, Platform.pos_y, PLATFORM_RADIUS*2, PLATFORM_RADIUS*2, colour2, colour2, colour1, colour1);
        const colour3 = [0.729, 0.549, 0.388, 1.0]
        drawSquare(this.pos_x, Platform.pos_y, PLATFORM_RADIUS/2, PLATFORM_RADIUS*2, colour3, colour3, colour1, colour1);
    }
}