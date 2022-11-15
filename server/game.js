const { FIELD_WIDTH, FIELD_HEIGHT, POINTS_TO_WIN,
        BALL_RADIUS, BALL_COLOR, BALL_SPEED, BALL_ACCELERATION } = require('./constants');

module.exports = {
  initGame,
  gameLoop,
}

function initGame() {
  const state = createGameState()
  return state;
}

function createGameState() {
  return {
    players: [{
      pos: {
        x: 10,
        y: FIELD_HEIGHT/2 - 100/2,
      },
      paddle: {
        width: 10,
        height: 100,
      },
      score : 0,
      color: "WHITE",
    }, {
      pos: {
        x: FIELD_WIDTH - 10 - 10,
        y: FIELD_HEIGHT/2 - 100/2,
      },
      paddle: {
        width: 10,
        height: 100,
      },
      score : 0,
      color: "WHITE",
    }],
    ball: {
      x: FIELD_WIDTH/2,
      y: FIELD_HEIGHT/2,
      speed: BALL_SPEED,
      velocityX: BALL_SPEED,
      velocityY: BALL_SPEED,
      radius: BALL_RADIUS,
      color: BALL_COLOR
    },
  };
}

// collision detection
function collision(ball, player) {
  player.top = player.pos.y;
  player.bottom = player.pos.y + player.paddle.height;
  player.left = player.pos.x;
  player.right = player.pos.x + player.paddle.width;

  ball.top = ball.y - BALL_RADIUS;
  ball.bottom = ball.y + BALL_RADIUS;
  ball.left = ball.x - BALL_RADIUS;
  ball.right = ball.x + BALL_RADIUS;

  return player.left < ball.right && player.top < ball.bottom && player.right > ball.left && player.bottom > ball.top;
}

function gameLoop(state) {
  if (!state) {
    return;
  }

  const playerOne = state.players[0];
  const playerTwo = state.players[1];
  const ball = state.ball;

  // Move ball
  ball.x += ball.velocityX;
	ball.y += ball.velocityY;

  if (playerOne.score == POINTS_TO_WIN) {
    return 1;
  }
  if (playerTwo.score == POINTS_TO_WIN) {
    return 2;
  }

  //  Check if ball hits top or bottom
  if (ball.y + BALL_RADIUS > FIELD_HEIGHT || ball.y - BALL_RADIUS < 0) {
		ball.velocityY = -ball.velocityY;
	}

  let player = (ball.x < FIELD_WIDTH/2) ? playerOne : playerTwo;

  // if the ball hits a paddle
	if (collision(ball, player)){
		// we check where the ball hits the paddle
		let collidePoint = (ball.y - (player.pos.y + player.paddle.height/2));
		// normalize the value of collidePoint, we need to get numbers between -1 and 1.
		// -player.height/2 < collide Point < player.height/2
		collidePoint = collidePoint / (player.paddle.height/2);
		
		// when the ball hits the top of a paddle we want the ball, to take a -45degees angle
		// when the ball hits the center of the paddle we want the ball to take a 0degrees angle
		// when the ball hits the bottom of the paddle we want the ball to take a 45degrees
		// Math.PI/4 = 45degrees
		let angleRad = (Math.PI/4) * collidePoint;
		
		// X direction of the ball when it is hit
		let direction = (ball.x + BALL_RADIUS < FIELD_WIDTH/2) ? 1 : -1;
		// change the X and Y velocity direction
		ball.velocityX = direction * ball.speed * Math.cos(angleRad);
		ball.velocityY = 			       ball.speed * Math.sin(angleRad);
		
		// speed up the ball everytime a paddle hits it.
		ball.speed += BALL_ACCELERATION;
	}

  // update the score
	if (ball.x - BALL_RADIUS < 0) {
		playerTwo.score++;
    ball.x = FIELD_WIDTH/2;
    ball.y = FIELD_HEIGHT/2 - 10;
    ball.speed = BALL_SPEED;
    ball.velocityX = BALL_SPEED;
    ball.velocityY = BALL_SPEED;
    ball.velocityX = -ball.velocityX;
	} else if (ball.x + BALL_RADIUS > FIELD_WIDTH) {
		playerOne.score++;
    ball.x = FIELD_WIDTH/2;
    ball.y = FIELD_HEIGHT/2 - 10;
    ball.speed = BALL_SPEED;
    ball.velocityX = BALL_SPEED;
    ball.velocityY = BALL_SPEED;
    ball.velocityX = -ball.velocityX;
	}

  return false;
}
