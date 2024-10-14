/**
 * @file ball.js
 * @author Bernat Comas Machuca
 * @class Ball
 */

const BALL_RADIUS = 0.1;

class Ball {
    /** @constant @var pos_x */
    pos_x = 0
    /**@var float */
    pos_y = 0.0;
  // Ball properties
    /**@var float */
    rotationAngle = 0.0;
    /**@var float */
    static radius = BALL_RADIUS;
    /**@var boolean Per no permetre saltar si ens trobem a mig salt. */
    is_jumping = false;
    /**@var float Determines the rotation speeds*/
    static rotation_increment = 0.05;
    /** @constant @var number n_segments */
    n_segments = 8
    /** @constant @var float */
    jumpStep
    /** @const @var */
    static y_step = 0.01
  
    // Reset the ball state
    reset(){
      this.rotationAngle = 0.0;
      this.pos_y = 0.0;
      this.is_jumping = false;
      this.jumpStep = Ball.y_step
    }
  
    /**
     * The ball jumps the height specified
     */
    jump(jumpHeight){
      //Posem la rotació a 0 per tal que faci l'animació des del principi
      this.is_jumping = true;
      this.jumpStep = Ball.y_step
  
      // Altura a la que slatarà el personatge i la velocitat (1/step)
      const jumpDuration = jumpHeight / this.jumpStep; // Calculem el nombre de passos, que serà la duració del salt.
  
      // Comptem el nombre de passos per saber quan hem arribat al final.
      let stepCount = 0;
  
      // Posem un interval per tal que s'actualitzi constantment la posició de la pilota
      const jumpInterval = setInterval(() => {
        this.pos_y += this.jumpStep; // Actualitzem la posició.
        stepCount++;
  
        // Actualitzem jumpStep per fer el salt més realista. Si arribem a la meitat del salt frenem la pilota.
        if (this.pos_y >= jumpHeight / 2) {
          this.jumpStep *= 0.95;
        }
  
        // Check if the jump is complete
        if (stepCount >= jumpDuration) {
          clearInterval(jumpInterval); // Parem l'interval
          const fallInterval = setInterval(() => {
            this.pos_y -= this.jumpStep; // Update this.pos_y by the step size
  
            // Actualitzem jumpStep per fer el salt més realista. Abans d'arribar a la meitat del salt accelerem la pilota.
            if (this.pos_y >= this.jumpStep) {
              this.jumpStep /= 0.95;
            }
  
            // Comprovem si el salt s'ha completat
            if (this.pos_y <= 0.0) {
              this.is_jumping = false;
              this.pos_y = 0.0;
              clearInterval(fallInterval);
            }
          }, 10);
        }
      }, 10);
    }
  
    /**
     * The ball falls and the game ends
     */
    fall(){
      game.running = false
      game.started = false
  
      const fallInterval = setInterval(() => {
  
        ball.pos_y -= Ball.y_step; // Update ball.pos_y by the step size
        
      }, 10);
  
      setTimeout(() => {
        clearInterval(fallInterval);
        alert("You have lost the game!");
        game.start();
      }, 2000);
    }
  
    /**
     * Checks if there is a platform under the ball.
     */
    isSupported(){
  
      let x = false;
  
      if (platforms.find(x => ((-PLATFORM_RADIUS-Platform.ledge)<x.pos_x && x.pos_x<(PLATFORM_RADIUS+Platform.ledge)) )) {
        x = true
      }
  
      return x;
    }
  
    // Draws the ball in it's position
    draw(){
      const colour = [1.0, 1.0, 1.0, 1.0];  
      drawSpiralBall(this.pos_x, this.pos_y, 0.0007, this.rotationAngle, colour);
    }
}