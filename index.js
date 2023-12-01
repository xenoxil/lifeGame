const board = document.querySelector('.board');
const ctx = board.getContext('2d');
const cellSize = 5;
let gameIsGoing = false;
let generation = 0;

const boardWidth = document.querySelector('.setupBar__sideWidth');
const boardHeight = document.querySelector('.setupBar__sideHeight');
let randomGenerating = true;

let currentBoardState = [];
let previousBoardState = [];
let currentLife = [];
let previousLife = [];
// createBoardState();
// generateBoard();

function generateBoard() {
  if (!boardWidth.value || !boardHeight.value) {
    return alert('Поле не возможно создать');
  }
  board.height = boardHeight.value * cellSize;
  board.width = boardWidth.value * cellSize;
  for (let x = 0; x < boardWidth.value; x++) {
    for (let y = 0; y < boardHeight.value; y++) {
      drawCell(x, y, cellSize, currentBoardState[x][y] ? `#cc3939` : 'grey');
    }
  }
}
function drawCell(x, y, size, color) {
  ctx.fillStyle = color;
  // ctx.strokeStyle = 'black';

  ctx.fillRect(x * cellSize, y * cellSize, size, size);
  // ctx.strokeRect = (x * cellSize, y * cellSize, size, size);
}
function createBoardState(random = false) {
  const newState = [];
  for (let x = 0; x < boardWidth.value; x++) {
    newState[x] = [];
    for (let y = 0; y < boardHeight.value; y++) {
      // каждая ~3 клетка
      newState[x][y] = random ? (Math.random() > 0.8 ? 1 : 0) : 0;
    }
  }
  return newState;
}
function startRound() {
  if (!gameIsGoing || currentBoardState.length === 0) return;
  console.log(`Generation №${++generation}`);
  const game = setTimeout(() => {
    var startTime = performance.now();
    for (let x = 0; x < boardWidth.value; x++) {
      for (let y = 0; y < boardHeight.value; y++) {
        currentBoardState[x][y] = checkLife(x, y);
      }
    }
    var endTime = performance.now();
    if (generation === 1)
      console.log(`Call to doSomething took ${endTime - startTime} milliseconds`);

    checkRules();
  }, 1000);
  function isEqualStates() {
    if (currentLife.length === previousLife.length) {
      return currentLife.every((lifeCell) => {
        return previousLife.includes(lifeCell);
      });
    }
    return false;
  }
  function findAllNeighbours(x, y) {
    const xLeft = x - 1 >= 0 ? x - 1 : boardWidth.value - 1;
    const xRight = x + 1 <= boardWidth.value - 1 ? x + 1 : 0;
    const yUp = y - 1 >= 0 ? y - 1 : boardHeight.value - 1;
    const yDown = y + 1 <= boardHeight.value - 1 ? y + 1 : 0;

    return [
      currentBoardState[xLeft][yUp],
      currentBoardState[x][yUp],
      currentBoardState[xRight][yUp],
      currentBoardState[xLeft][y],
      ,
      currentBoardState[xRight][y],
      currentBoardState[xLeft][yDown],
      currentBoardState[x][yDown],
      currentBoardState[xRight][yDown],
    ];
  }
  function checkLife(x, y) {
    let isLife = !!currentBoardState[x][y];
    let count = 0;
    findAllNeighbours(x, y).forEach((neighbour) => count < 4 && neighbour === 1 && count++);
    //     в пустой (мёртвой) клетке, с которой соседствуют три живые клетки, зарождается жизнь;
    // если у живой клетки есть две или три живые соседки, то эта клетка продолжает жить;
    //  в противном случае (если живых соседей меньше двух или больше трёх) клетка умирает («от одиночества» или «от перенаселённости»).
    if ((isLife && (count === 2 || count === 3)) || (!isLife && count === 3)) {
      currentLife.push(`${x},${y}`);
      return 1;
    }
    return 0;
  }
  function checkRules() {
    // debugger;
    if (isEqualStates() || currentLife.length === 0) {
      endGame();
    } else {
      previousBoardState = structuredClone(currentBoardState);
      previousLife = structuredClone(currentLife);
      currentLife = [];
      ctx.reset();
      generateBoard();
      startRound();
    }
  }
  function endGame() {
    alert('Игра окончена');
    clearTimeout(game);
    gameIsGoing = false;
    generation = 0;
  }
}

const genBtn = document.querySelector('.setupBar__generateButton');
const resetBtn = document.querySelector('.setupBar__resetButton');
const runBtn = document.querySelector('.setupBar__runButton');
genBtn.addEventListener('click', () => {
  currentBoardState = createBoardState();
  generateBoard();
});
resetBtn.addEventListener('click', () => {
  currentBoardState = createBoardState();
  ctx.reset();
  generateBoard();
  randomGenerating = true;
  gameIsGoing = false;
});
runBtn.addEventListener('click', () => {
  gameIsGoing = true;
  if (randomGenerating) {
    ctx.reset();
    currentBoardState = createBoardState(true);
    generateBoard();
    startRound();
  } else {
    generateBoard();
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
  const x = Math.floor(coords[0] / cellSize);
  const y = Math.floor(coords[1] / cellSize);
  currentBoardState[x][y] = 1;
  drawCell(x, y, cellSize, 'red');
});

// заполнить  кол-во клеток в высоту и ширину
/*
сгенерировать поле нужного размера
старт 
проверка условий:
if(true){
запись в временый стейт
сравнение стейта:
if(true){
  конец игры
}
}

 */
