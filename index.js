const board = document.querySelector('.board');
const ctx = board.getContext('2d');
const cellSize = 7;
let gameIsGoing = false;
let generation = 0;
let cache = {};
let history = [];

const boardWidth = document.querySelector('.setupBar__sideWidth');
const boardHeight = document.querySelector('.setupBar__sideHeight');
let randomGenerating = true;

let currentBoardState = [];
let previousBoardState = [];
let currentLife = new Set();
let previousLife = new Set();
let cellsToCalc = new Set();
// createBoardState();
// drawBoard();

function drawBoard() {
  if (!boardWidth.value || !boardHeight.value) {
    return alert('Поле не возможно создать');
  }
  board.height = boardHeight.value * cellSize;
  board.width = boardWidth.value * cellSize;
  ctx.fillStyle = 'grey';
  ctx.fillRect(0, 0, board.width, board.height);
  ctx.fillStyle = 'black';
  for (let x = 1; x < boardWidth.value; x++) {
    ctx.fillRect(x * cellSize, 0, 1, board.height);
  }
  for (let y = 1; y < boardHeight.value; y++) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, y * cellSize, board.width, 1);
  }
  // debugger;
  previousLife.forEach((lifeCell) => {
    const [x, y] = lifeCell.split(',');
    drawCell(x, y, cellSize, `red`);
  });
}
function drawCell(x, y, size, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = 'black';

  ctx.fillRect(x * cellSize, y * cellSize, size - 1, size - 1);
  ctx.strokeRect(x * cellSize, y * cellSize, size, size);
}
function createBoardState(random = false) {
  let newState = [];
  for (let x = 0; x < boardWidth.value; x++) {
    newState[x] = [];
    for (let y = 0; y < boardHeight.value; y++) {
      // каждая ~5 клетка
      const value = random ? (Math.random() > 0.8 ? 1 : 0) : 0;
      if (value) previousLife.add(`${x},${y}`);
      newState[x][y] = value;
    }
  }
  return newState;
}
function startRound() {
  console.log(`round`, generation);
  if (!gameIsGoing || previousLife.size === 0) {
    console.log(`GameOver!!!!`);
    return;
  }
  console.log(`Generation №${++generation}`);
  const startTime = performance.now();

  // console.log(`previousLife`, previousLife);

  for (let x = 0; x < boardWidth.value; x++) {
    for (let y = 0; y < boardHeight.value; y++) {
      currentBoardState[x][y] = checkLife(x, y);
    }
  }
  // console.log(`currentLife`, currentLife);

  const endTime = performance.now();
  console.log(`Call to checkLife took ${endTime - startTime} milliseconds`);
  checkRules();

  function isEqualStates() {
    if (currentLife.size === previousLife.size) {
      return [...currentLife].every((lifeCell) => previousLife.has(lifeCell));
    }
    return false;
  }
  function countNeighbours(x, y) {
    const xLeft = x - 1 >= 0 ? x - 1 : boardWidth.value - 1;
    const xRight = Number(x) + 1 <= boardWidth.value - 1 ? Number(x) + 1 : 0;
    const yUp = y - 1 >= 0 ? y - 1 : boardHeight.value - 1;
    const yDown = Number(y) + 1 <= boardHeight.value - 1 ? Number(y) + 1 : 0;

    return (
      previousBoardState[xLeft][yUp] +
      previousBoardState[x][yUp] +
      previousBoardState[xRight][yUp] +
      previousBoardState[xLeft][y] +
      previousBoardState[xRight][y] +
      previousBoardState[xLeft][yDown] +
      previousBoardState[x][yDown] +
      previousBoardState[xRight][yDown]
    );
  }
  function checkLife(x, y) {
    let isLife = previousLife.has(`${x},${y}`);
    const count = countNeighbours(x, y);
    if ((isLife && (count === 2 || count === 3)) || (!isLife && count === 3)) {
      currentLife.add(`${x},${y}`);
      return 1;
    }
    return 0;
  }
  function isCycled() {
    return history.some((moment) => {
      if (moment.size === currentLife.size) {
        return [...currentLife].every((lifeCell) => moment.has(lifeCell));
      }
    });
  }
  function checkRules() {
    console.log(`lifeSize`, currentLife.size);
    if (isCycled() || currentLife.size === 0 || !gameIsGoing) {
      endGame();
    } else {
      previousBoardState = structuredClone(currentBoardState);
      // previousBoardState = [...currentBoardState];
      previousLife = structuredClone(currentLife);
      history.push(previousLife);
      if (history.length > 5) {
        history.shift();
      }
      // previousLife = new Set(currentLife);
      currentLife.clear();
      ctx.reset();
      const startTime = performance.now();
      drawBoard();
      const endTime = performance.now();
      console.log(`DrawBoardIn in ${endTime - startTime} milliseconds`);
      setTimeout(() => {
        if (gameIsGoing) {
          window.requestAnimationFrame(startRound);
        }
      }, 40);
    }
  }
  function endGame() {
    // clearTimeout(game);
    alert('Игра окончена');
    gameIsGoing = false;
    generation = 0;
    previousLife.clear();
    currentLife.clear();
    previousBoardState = createBoardState();
    currentBoardState = createBoardState();
  }
}

const genBtn = document.querySelector('.setupBar__generateButton');
const resetBtn = document.querySelector('.setupBar__resetButton');
const runBtn = document.querySelector('.setupBar__runButton');

genBtn.addEventListener('click', () => {
  currentBoardState = createBoardState();
  drawBoard();
});
resetBtn.addEventListener('click', () => {
  currentBoardState = createBoardState();
  previousBoardState = createBoardState();
  previousLife.clear();
  ctx.reset();
  drawBoard();
  randomGenerating = true;
  if (gameIsGoing) {
    gameIsGoing = false;
    generation = 0;
  }
});
runBtn.addEventListener('click', () => {
  if (gameIsGoing) {
    return;
  }
  gameIsGoing = true;
  console.log(`runCurrentLife`, currentLife);

  console.log(`runPreviousLife`, previousLife);
  if (randomGenerating) {
    ctx.reset();
    currentBoardState = createBoardState(true);
    // previousBoardState = [...currentBoardState];
    previousBoardState = structuredClone(currentBoardState);
    drawBoard();
    startRound();
  } else {
    // previousBoardState = [...currentBoardState];

    previousBoardState = structuredClone(currentBoardState);
    drawBoard();
    startRound();
  }
});
function getMousePosition(canvas, event) {
  let rect = canvas.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;
  return [x, y];
}
board.addEventListener('mousedown', (e) => {
  if (gameIsGoing) return;
  randomGenerating = false;
  const coords = getMousePosition(board, e);
  const x = Math.min(Math.floor(coords[0] / cellSize), board.width);
  const y = Math.min(Math.floor(coords[1] / cellSize), board.height);
  currentBoardState[x][y] = 1;
  previousLife.add(`${x},${y}`);
  console.log(`prevLifeMouse`, previousLife);
  drawCell(x, y, cellSize, 'red');
});
