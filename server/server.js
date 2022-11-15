// run "npm install socket.io express"
// Start server with "npx nodemon server.js" (auto refresh server when changes are made)

const { initGame, gameLoop } = require('./game');
const { FRAME_RATE, PADDLE_SPEED, FIELD_HEIGHT } = require('./constants');
const { makeid } = require('./utils')

const Express = require("express")();
const http = require("http").createServer(Express);
const io = require("socket.io")(http, {
	cors: {
		origins: "http://localhost:8080"
	}
});

const state = {};
const clientRooms = {};
let playerOneUp = false;
let playerOneDown = false;
let playerTwoUp = false;
let playerTwoDown = false;

io.on('connection', client => {

	client.on('keydown', handleKeydown);
	client.on('keyup', handleKeyup);
	client.on('newGame', handleNewGame);
	client.on('joinGame', handleJoinGame);
	client.on('watchGame', handleWatchGame);
  
	function handleJoinGame(roomName) {
	  const room = io.sockets.adapter.rooms[roomName];

	  let allUsers;
	  if (room) {
		  allUsers = room.sockets;
	  }
    
	  let numClients = 0;
	  if (allUsers) {
      numClients = Object.keys(allUsers).length;
	  }
  
	  if (numClients > 1) {
		  client.emit('tooManyPlayers');
		  return;
	  }
  
	  clientRooms[client.id] = roomName;
  
	  client.join(roomName);
	  client.number = 2;
	  client.emit('init', 2);

	  startGameInterval(roomName);
	}

  function handleWatchGame(roomName) {
    console.log(roomName);
	  const room = io.sockets.adapter.rooms[roomName];

    console.log("room =", room);
  
	  let allUsers;
	  if (room) {
		  allUsers = room.sockets;
	  }
    console.log("allUsers =", allUsers);
    
	  let numClients = 0;
	  if (allUsers) {
      numClients = Object.keys(allUsers).length;
	  }
    console.log("numClients =", numClients);
    
	  clientRooms[client.id] = roomName;

    console.log("client.id =", client.id);
    console.log("roomName =", roomName);
  
	  client.join(roomName);
	  client.number = 3;
	  client.emit('init', 3);
  }
  
	function handleNewGame() {
	  let roomName = makeid(5);
	  clientRooms[client.id] = roomName;
	  client.emit('gameCode', roomName);
  
	  state[roomName] = initGame();
  
	  client.join(roomName);
	  client.number = 1;
	  client.emit('init', 1);
	}
  
	function handleKeydown(keyCode) {
	  const roomName = clientRooms[client.id];
	  if (!roomName) {
		  return;
	  }
	  try {
		  keyCode = parseInt(keyCode);
	  } catch(e) {
      console.error(e);
      return;
	  }

    if (keyCode == 38 && client.number == 1) {
      playerOneUp = true;
    }
    if (keyCode == 40 && client.number == 1) {
      playerOneDown = true;
    }
    if (keyCode == 38 && client.number == 2) {
      playerTwoUp = true;
    }
    if (keyCode == 40 && client.number == 2) {
      playerTwoDown = true;
    }
	}

  function handleKeyup(keyCode) {
	  const roomName = clientRooms[client.id];
	  if (!roomName) {
		  return;
	  }
	  try {
		  keyCode = parseInt(keyCode);
	  } catch(e) {
      console.error(e);
      return;
	  }

    if (keyCode == 38 && client.number == 1) {
      playerOneUp = false;
    }
    if (keyCode == 40 && client.number == 1) {
      playerOneDown = false;
    }
    if (keyCode == 38 && client.number == 2) {
      playerTwoUp = false;
    }
    if (keyCode == 40 && client.number == 2) {
      playerTwoDown = false;
    }
	}

  function startGameInterval(roomName) {
    const intervalId = setInterval(() => {
      const winner = gameLoop(state[roomName]);
      
      if (!winner) {
        emitGameState(roomName, state[roomName])
      } else {
        emitGameOver(roomName, winner);
      state[roomName] = null;
        clearInterval(intervalId);
      }
      const playerOne = state[roomName].players[0];
      const playerTwo = state[roomName].players[1];

      if (playerOneUp) {
        if (playerOne.pos.y - PADDLE_SPEED >= 0) {
          playerOne.pos.y -= PADDLE_SPEED;
        }
      }
      if (playerOneDown) {
        if (playerOne.pos.y + playerOne.paddle.height + PADDLE_SPEED <= FIELD_HEIGHT) {
          playerOne.pos.y += PADDLE_SPEED;
        }
      }
      if (playerTwoUp) {
        if (playerTwo.pos.y - PADDLE_SPEED >= 0) {
          playerTwo.pos.y -= PADDLE_SPEED;
        }
      }
      if (playerTwoDown) {
        if (playerTwo.pos.y + playerTwo.paddle.height + PADDLE_SPEED <= FIELD_HEIGHT) {
          playerTwo.pos.y += PADDLE_SPEED;
        }
      }

    }, 1000 / FRAME_RATE);
  }
});

function countdown(time){
  if (time > 0) {
    console.log(time);
    setTimeout(function() {countdown(time-1)}, 1000);
    } else {
      console.log("GO"); // replace with any function
    };
}

function startCountdown(room, timer) {
  io.sockets.in(room)
	.emit('coutndown', timer);
}
	
function emitGameState(room, gameState) {
// Send this event to everyone in the room.
io.sockets.in(room)
	.emit('gameState', JSON.stringify(gameState));
}

function emitGameOver(room, winner) {
	io.sockets.in(room)
	  .emit('gameOver', JSON.stringify({ winner }));
  }

http.listen(3000, () => {
	console.log("Listening at :3000..toExponential.")
});