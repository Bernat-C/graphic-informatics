/**
 * @file game.js
 * @author Bernat Comas Machuca
 * @class Game
 */

class Game {
    // Velocity will be 0.6 blocks every 60 ticks.
    static velocity = 0.6/60
    // Interval where you will be immune
    static grace_interval = 2000
    // Probability of a coin appearing every 60 ticks.
    static coin_probability = 0.1
    // Probability of a fish appearing every tick
    static fish_probability = 0.3
    // Number of successive platforms that have appeared. Used to control max following platforms appearing
    n_succ_platform
    // Number of successive holes that have appeared. Used to control max following holes appearing
    n_succ_hole
    // Number of ticks remaining for new platform
    tics_new_platform
    // Wether the game is running or ball has died (fallen from platform)
    running
    // Wether the game has started and grace interval has finished
    started
    // Current score of this run
    score
  
    constructor(){
      this.score = 0
      this.tics_new_platform = 20
      this.running = true
      this.started = false
      this.n_succ_platform = 0
      this.n_succ_hole = 0
    }
  
    // Updates the game state. Done once every 1/3 seconds (20 ticks, as 60 ticks = 1 second)
    updateState(){
      this.update_score()

      // Reset tick counter
      this.tics_new_platform = 20;
  
      // Getting next platform or false if it is hole.
      if(this.getNextPlatform()) {
        let platform = new Platform();
        platforms.push(platform);
      }
  
      // Try and get a new coin depending on coin probability
      game.getNextCoin();
    }
  
    // Updates the scoreboard and adds 1 point.
    update_score(){
      this.score++;
      // Get a reference to the score span element
      const scoreSpan = document.getElementById('score');
  
      // Update the score
      function updateScore(newScore) {
          scoreSpan.textContent = newScore;
      }
  
      // Example usage:
      updateScore(this.score); // Update the score to 42
    }

    /**
     * Returns the next platform that will be generated.
     */
    getNextPlatform() {

        var random = Math.random();
        var platform;
    
        // Deciding if next platform will be there or it will be a hole
        if(!game.started){ //If the game has not started only create platforms
            platform = true;
        }
        else if( game.n_succ_hole > 0 ){ // Otherwise if the last one was a hole.
            var prob_platform = game.n_succ_hole / 3; // We allow max 3 holes one after the other.
            if( random < prob_platform ) platform = true;
            else platform = false;
        }
        else if ( game.n_succ_platform > 0 ){ // If the last one was a platform
            var prob_hole = game.n_succ_platform / 8; // We allow max 8 platforms one after the other.
            if( random < prob_hole ) platform = false;
            else platform = true;
        }
        else { // If error, platform.
            platform = true;
        }
    
        // Incrementing as a result of the shape rendered
        if(platform){
            game.n_succ_hole = 0;
            game.n_succ_platform++;
        }
        else {
            game.n_succ_platform = 0;
            game.n_succ_hole++;
        }
    
        return platform;
    }
  
    // Fills the map between the ball and the end of the screen of platforms
    fillPlatforms(){
      let inc = BALL_RADIUS*2
      for (let i = 0; i <= X_RIGHT_SCREEN_LIMIT+2*BALL_RADIUS; i += inc) {
        var x = new Platform(i);
        platforms.push(x)
      }
    }
  
    // Adds a new coin randomly or not depending on coin_probability
    getNextCoin(){
  
      let rand1 = Math.random()
      if(rand1<Game.coin_probability){ // Wether a new coin should be added
  
        let pos_x = X_RIGHT_SCREEN_LIMIT+Coin.radius // We add it outside the screen
        let rand2 = Math.random()
        const pos_y = JUMP_HEIGHT*rand2; // Position where it should be added
  
        coins.push(new Coin(pos_x, pos_y))
  
      }
    }

    // Adds a new fish randomly or not depending on fish_probability
    getNextFish(){
  
        let rand1 = Math.random()
        if(rand1<Game.fish_probability){
    
          let pos_x = X_RIGHT_SCREEN_LIMIT+Fish.max_fish_width
          let rand2 = Math.random()
          // The y position will be in the sea, which is 0- ball radius -platform radius
          const pos_y = -1+rand2*(-BALL_RADIUS-PLATFORM_RADIUS+1);
          const size = Math.random()*Fish.max_fish_width
          
          // Speed has to be higher than 1 because it can't go faster than the ball.
          const speed = 1.5+Math.random()*2
          const colour1 = [Math.random(), Math.random(), Math.random(), 1.0]
          const colour2 = [Math.random(), Math.random(), Math.random(), 1.0]
    
          fishes.push(new Fish(pos_x, pos_y, size, speed, colour1, colour2))
    
        }
      }
  
    // Resets all components and starts a game
    start(){  
      // Game properties
      this.tics_new_platform = 20; // Each second one new platform.
      this.running = true;
      this.started = false;
      this.score = 0;
  
      // Ball properties
      ball.reset()
      
      // Platform properties
      platforms.length = 0;
      coins.length = 0;
      this.fillPlatforms()
      
      // Generation properties
      this.n_succ_platform = 0;
      this.n_succ_hole = 0;
    
      // Setting grace interval
      setTimeout(() => {
        this.started = true;
      }, Game.grace_interval);
    }
  }