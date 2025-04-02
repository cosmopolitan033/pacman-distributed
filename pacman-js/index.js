import { LEVEL, OBJECT_TYPE } from './setup';
import { randomMovement } from './ghostmoves';
// Classes
import GameBoard from './GameBoard';
import Pacman from './Pacman';
import Ghost from './Ghost';
// Sounds
import soundDot from './sounds/munch.wav';
import soundPill from './sounds/pill.wav';
import soundGameStart from './sounds/game_start.wav';
import soundGameOver from './sounds/death.wav';
import soundGhost from './sounds/eat_ghost.wav';

import { io } from 'socket.io-client';
// Dom Elements
const gameGrid = document.querySelector('#game');
const scoreTable = document.querySelector('#score');
const startButton = document.querySelector('#start-button');
// const leaderboardList = document.querySelector('#leaderboard'); // Assume you have an element to show leaderboard

// Game constants
const POWER_PILL_TIME = 10000; // ms
const GLOBAL_SPEED = 80; // ms
const gameBoard = GameBoard.createGameBoard(gameGrid, LEVEL);

// Initial setup
let score = 0;
let timer = null;
let gameWin = false;
let powerPillActive = false;
let powerPillTimer = null;
let playerId = ""

// --- SOCKET.IO SETUP --- //
const socket = io("http://localhost:5050"); // Assumes the backend is served from the same origin

socket.on('connect', () => {
  console.log('Connected to server with id:', socket.id);
  playerId = socket.id;
});

socket.on('connected', (data) => {
  console.log('Player connected with id:', data.player_id);
});

socket.on('game_started', (data) => {
  console.log(data.message);
});

socket.on('leaderboard_update', (data) => {
  // Convert data.scores into an array of objects and sort by score in descending order
  const leaderboard = Object.entries(data.scores)
      .map(([id, score]) => ({
        id,
        name: `Player ${id}`,
        score
      }))
      .sort((a, b) => b.score - a.score); // Sort players by score (highest first)

  let status = '<span class="title">Leaderboard</span>';
  for (let i = 0; i < leaderboard.length; i++) {
    status += '<br />';
    if (leaderboard[i].id === playerId) {
      if (leaderboard[i].name.length !== 0) {
        status += `<span class="me">${i + 1}. ${leaderboard[i].name} - ${leaderboard[i].score}</span>`;
      } else {
        status += `<span class="me">${i + 1}. An unnamed cell - ${leaderboard[i].score}</span>`;
      }
    } else {
      if (leaderboard[i].name.length !== 0) {
        status += `${i + 1}. ${leaderboard[i].name} - ${leaderboard[i].score}`;
      } else {
        status += `${i + 1}. An unnamed cell - ${leaderboard[i].score}`;
      }
    }
  }

  document.getElementById('status').innerHTML = status;
});

socket.on('game_over', (data) => {
  console.log('Game over for player:', data.player_id);
});

// --- AUDIO FUNCTION --- //
function playAudio(audio) {
  const soundEffect = new Audio(audio);
  soundEffect.play();
}

// --- GAME CONTROLLER FUNCTIONS --- //
function gameOver(pacman, grid) {
  playAudio(soundGameOver);

  document.removeEventListener('keydown', (e) =>
    pacman.handleKeyInput(e, gameBoard.objectExist.bind(gameBoard))
  );

  // Notify backend of game over along with the final score.
  socket.emit('game_over', { score: score });

  gameBoard.showGameStatus(gameWin);
  clearInterval(timer);
  startButton.classList.remove('hide');
}

function checkCollision(pacman, ghosts) {
  const collidedGhost = ghosts.find((ghost) => pacman.pos === ghost.pos);

  if (collidedGhost) {
    if (pacman.powerPill) {
      playAudio(soundGhost);
      gameBoard.removeObject(collidedGhost.pos, [
        OBJECT_TYPE.GHOST,
        OBJECT_TYPE.SCARED,
        collidedGhost.name,
      ]);
      collidedGhost.pos = collidedGhost.startPos;
      score += 100;
    } else {
      gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PACMAN]);
      gameBoard.rotateDiv(pacman.pos, 0);
      gameOver(pacman, gameGrid);
    }
  }
}

function gameLoop(pacman, ghosts) {
  // 1. Move Pacman
  gameBoard.moveCharacter(pacman);
  // 2. Check Ghost collision on the old positions
  checkCollision(pacman, ghosts);
  // 3. Move ghosts
  ghosts.forEach((ghost) => gameBoard.moveCharacter(ghost));
  // 4. Do a new ghost collision check on the new positions
  checkCollision(pacman, ghosts);
  // 5. Check if Pacman eats a dot
  if (gameBoard.objectExist(pacman.pos, OBJECT_TYPE.DOT)) {
    playAudio(soundDot);
    gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.DOT]);
    gameBoard.dotCount--;
    score += 10;
  }
  // 6. Check if Pacman eats a power pill
  if (gameBoard.objectExist(pacman.pos, OBJECT_TYPE.PILL)) {
    playAudio(soundPill);
    gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PILL]);
    pacman.powerPill = true;
    score += 50;
    clearTimeout(powerPillTimer);
    powerPillTimer = setTimeout(() => (pacman.powerPill = false), POWER_PILL_TIME);
  }
  // 7. Change ghost scare mode depending on powerpill
  if (pacman.powerPill !== powerPillActive) {
    powerPillActive = pacman.powerPill;
    ghosts.forEach((ghost) => (ghost.isScared = pacman.powerPill));
  }
  // 8. Check if all dots have been eaten
  if (gameBoard.dotCount === 0) {
    gameWin = true;
    gameOver(pacman, gameGrid);
  }
  // 9. Show new score
  scoreTable.innerHTML = score;
  // Periodically update score on server
  socket.emit('update_score', { score: score });
}

function startGame() {
  playAudio(soundGameStart);
  gameWin = false;
  powerPillActive = false;
  score = 0;
  startButton.classList.add('hide');

  // Notify backend that game is starting
  socket.emit('start_game', {});

  gameBoard.createGrid(LEVEL);

  const pacman = new Pacman(2, 287);
  gameBoard.addObject(287, [OBJECT_TYPE.PACMAN]);
  document.addEventListener('keydown', (e) =>
    pacman.handleKeyInput(e, gameBoard.objectExist.bind(gameBoard))
  );

  const ghosts = [
    new Ghost(5, 188, randomMovement, OBJECT_TYPE.BLINKY),
    new Ghost(4, 209, randomMovement, OBJECT_TYPE.PINKY),
    new Ghost(3, 230, randomMovement, OBJECT_TYPE.INKY),
    new Ghost(2, 251, randomMovement, OBJECT_TYPE.CLYDE),
  ];

  // Gameloop
  timer = setInterval(() => gameLoop(pacman, ghosts), GLOBAL_SPEED);
}

// Optionally, use an HTTP endpoint to fetch the leaderboard on demand.
// function fetchLeaderboard() {
//   fetch('/api/leaderboard')
//     .then((response) => response.json())
//     .then((data) => {
//       let leaderboardHTML = '';
//       data.forEach((entry) => {
//         leaderboardHTML += `<li>Player ${entry[0]}: ${entry[1]}</li>`;
//       });
//       leaderboardList.innerHTML = leaderboardHTML;
//     })
//     .catch((err) => console.error('Error fetching leaderboard:', err));
// }

const leaderboardList = document.getElementById('leaderboard');

function fetchLeaderboard() {
  fetch('/api/leaderboard')
    .then((response) => response.json())
    .then((data) => {
      let leaderboardHTML = '';
      data.forEach((entry) => {
        leaderboardHTML += `<li>Player ${entry[0]}: ${entry[1]}</li>`;
      });
      leaderboardList.innerHTML = leaderboardHTML;
    })
    .catch((err) => console.error('Error fetching leaderboard:', err));
}

// Call the function to load the leaderboard
fetchLeaderboard();

// Initialize game on start button click
startButton.addEventListener('click', startGame);
