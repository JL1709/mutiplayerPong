// Start with "npx live-server"

import { FIELD_WIDTH, FIELD_HEIGHT, FIELD_COLOR,
         NET_WIDTH, NET_HEIGHT, NET_COLOR,
         SCORE_PLAYER_ONE_COLOR, SCORE_PLAYER_TWO_COLOR, SCORE_FONT } from './utils.js';

const socket = io.connect('http://localhost:3000');

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);
// socket.on('countdown', handleCountdown);

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const watchGameBtn = document.getElementById('watchGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeInput2 = document.getElementById('gameCodeInput2');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);
watchGameBtn.addEventListener('click', watchGame);


function newGame() {
  socket.emit('newGame');
  init();
}

function joinGame() {
  const code = gameCodeInput.value;
  socket.emit('joinGame', code);
  init();
}

function watchGame() {
  const code = gameCodeInput2.value;
  console.log(code);
  socket.emit('watchGame', code);
  initWatchGame();
}

let canvas, context;
let playerNumber;
// let audience = 0;
let gameActive = false;

function init() {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";

  canvas = document.getElementById('canvas');
  context = canvas.getContext('2d');

  canvas.width = FIELD_WIDTH
  canvas.height = FIELD_HEIGHT;

  context.fillStyle = FIELD_COLOR;
  context.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener('keydown', keydown);
  document.addEventListener('keyup', keyup);
  gameActive = true;
}

function initWatchGame() {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";

  canvas = document.getElementById('canvas');
  context = canvas.getContext('2d');

  canvas.width = FIELD_WIDTH
  canvas.height = FIELD_HEIGHT;

  context.fillStyle = FIELD_COLOR;
  context.fillRect(0, 0, canvas.width, canvas.height);

  gameActive = true;
}


function keydown(e) {
  socket.emit('keydown', e.keyCode);
}
function keyup(e) {
  socket.emit('keyup', e.keyCode);
}

function paintGame(state) {
  // Extract input
  const playerOne = state.players[0];
  const playerTwo = state.players[1];
  const ball = state.ball;

  // Create / Cleare field
  drawRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT, FIELD_COLOR);

  // Draw the net
  drawNet();

  // Draw the score
	drawText(playerOne.score, FIELD_WIDTH/4, FIELD_HEIGHT/5, SCORE_FONT, SCORE_PLAYER_ONE_COLOR);
	drawText(playerTwo.score, 3 * FIELD_WIDTH/4, FIELD_HEIGHT/5, SCORE_FONT, SCORE_PLAYER_TWO_COLOR);

	// Draw paddle of playerOne and playerTwo
	drawRect(playerOne.pos.x, playerOne.pos.y, playerOne.paddle.width, playerOne.paddle.height, playerOne.color);
	drawRect(playerTwo.pos.x, playerTwo.pos.y, playerTwo.paddle.width, playerTwo.paddle.height, playerTwo.color);

	// Draw the ball
	drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

// function paintCountdown(timer) {
//   drawText(timer, FIELD_WIDTH/2, FIELD_HEIGHT/2, SCORE_FONT, "WHITE");
// }

// function handleCountdown(timer) {
//   if (!gameActive) {
//     return;
//   }
//   requestAnimationFrame(() => setTimeout(paintCountdown(3), 5000));
// }

function handleInit(number) {
  if (number < 3) {
    playerNumber = number;
  }
  else {
    audience += 1;
  }
}


function handleGameState(gameState) {
  if (!gameActive) {
    return;
  }
  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
  if (!gameActive) {
    return;
  }
  data = JSON.parse(data);

  gameActive = false;

  if (data.winner === playerNumber) {
    alert('You Win!');
  } else {
    alert('You Lose :(');
  }
}

function handleGameCode(gameCode) {
  gameCodeDisplay.innerText = gameCode;
}

function handleUnknownCode() {
  reset();
  alert('Unknown Game Code')
}

function handleTooManyPlayers() {
  reset();
  alert('This game is already in progress');
}

function reset() {
  playerNumber = null;
  audience = 0;
  gameCodeInput.value = '';
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
}


// HELPER FUNCTIONS

// Draw rect function
function drawRect(x, y, width, height, color) {
  context.fillStyle = color;
  context.fillRect(x, y, width, height);
}
// Draw net function
function drawNet() {
  const x = FIELD_WIDTH/2 - 1;
  const y = 0;
	for (let i = 0; i <= canvas.height; i += (NET_HEIGHT + 5)) {
		drawRect(x, y + i, NET_WIDTH, NET_HEIGHT, NET_COLOR);
	}
}

// Draw circle function
function drawCircle(x, y, radius, color) {
	context.fillStyle = color;
	context.beginPath();
	context.arc(x, y, radius, 0, Math.PI*2, false);
	context.closePath();
	context.fill();
}

// Draw text function
function drawText(text, x, y, font, color) {
	context.fillStyle = color;
	context.font = font;
	context.fillText(text, x, y);
}