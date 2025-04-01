import { GRID_SIZE, CELL_SIZE, OBJECT_TYPE, CLASS_LIST } from './setup';

class GameBoard {
  constructor(DOMGrid) {
    this.dotCount = 0;
    this.grid = [];
    this.DOMGrid = DOMGrid;
  }

  showGameStatus(gameWin) {
    const div = document.createElement('div');
    div.classList.add('game-status');
    div.innerHTML = `${gameWin ? 'WIN!' : 'GAME OVER!'}`;
    this.DOMGrid.appendChild(div);
  }

  createGrid(level) {
    this.dotCount = 0;
    this.grid = [];
    this.DOMGrid.innerHTML = '';
    this.DOMGrid.style.cssText = `grid-template-columns: repeat(${GRID_SIZE}, ${CELL_SIZE}px);`;

    level.forEach((square) => {
      const div = document.createElement('div');
      div.classList.add('square', CLASS_LIST[square]);
      div.style.cssText = `width: ${CELL_SIZE}px; height: ${CELL_SIZE}px;`;
      this.DOMGrid.appendChild(div);
      this.grid.push(div);

      if (CLASS_LIST[square] === OBJECT_TYPE.DOT) this.dotCount++;
    });
  }

  // Dynamically add a new row to the bottom.
  appendRow() {
    for (let i = 0; i < GRID_SIZE; i++) {
      const div = document.createElement('div');
      let cellType;
      
      // Ensure the left and right edges are always walls.
      if (i === 0 || i === GRID_SIZE - 1) {
        cellType = OBJECT_TYPE.WALL;
      } else {
        const rand = Math.random(); // a value between 0 and 1
        // For interior cells:
        // 20% chance to be a wall.
        if (rand < 0.3) {
          cellType = OBJECT_TYPE.WALL;
        }
        // 30% chance to be a power pellet (PILL) — very random.
        else if (rand < 0.30) {
          cellType = OBJECT_TYPE.PILL;
        }
        // Otherwise, it's a dot.
        else {
          cellType = OBJECT_TYPE.DOT;
        }
      }
      
      div.classList.add('square', cellType);
      div.style.cssText = `width: ${CELL_SIZE}px; height: ${CELL_SIZE}px;`;
      this.DOMGrid.appendChild(div);
      this.grid.push(div);
      
      if (cellType === OBJECT_TYPE.DOT) this.dotCount++;
    }
  }

  // Check if the maze should be extended downward.
  checkInfiniteExtension(character) {
    const currentRow = Math.floor(character.pos / GRID_SIZE);
    const totalRows = this.grid.length / GRID_SIZE;
    if (currentRow >= totalRows - 3) {
      this.appendRow();
    }
  }

  addObject(pos, classes) {
    this.grid[pos].classList.add(...classes);
  }

  removeObject(pos, classes) {
    this.grid[pos].classList.remove(...classes);
  }

  objectExist(pos, object) {
    return this.grid[pos].classList.contains(object);
  }

  rotateDiv(pos, deg) {
    this.grid[pos].style.transform = `rotate(${deg}deg)`;
  }

  moveCharacter(character) {
    if (character.shouldMove()) {
      const { nextMovePos, direction } = character.getNextMove(
        this.objectExist.bind(this)
      );
      const { classesToRemove, classesToAdd } = character.makeMove();

      if (character.rotation && nextMovePos !== character.pos) {
        this.rotateDiv(nextMovePos, character.dir.rotation);
        this.rotateDiv(character.pos, 0);
      }

      this.removeObject(character.pos, classesToRemove);
      this.addObject(nextMovePos, classesToAdd);
      character.setNewPos(nextMovePos, direction);

      // If the character is Pacman (or the player), check for extension.
      if (classesToAdd.includes(OBJECT_TYPE.PACMAN)) {
        this.checkInfiniteExtension(character);
      }
    }
  }

  static createGameBoard(DOMGrid, level) {
    const board = new this(DOMGrid);
    board.createGrid(level);
    return board;
  }
}

export default GameBoard;
