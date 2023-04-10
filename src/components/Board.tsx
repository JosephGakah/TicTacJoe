import { DIMENSIONS, DRAW } from "../constants";

type Grid = Array<null | number>;
export default class Board {
  grid: Grid;
  constructor(grid?: Grid) {
    this.grid = grid || new Array(DIMENSIONS ** 2).fill(null);
  }

  makeMove = (square: number, player: number) => {
    if (this.grid[square] === null) {
      this.grid[square] = player;
    }
  };
  
  // Collect indices of the empty squares and return them
  getEmptySquares = (grid = this.grid) => {
    let squares: number[] = [];
    grid.forEach((square, i) => {
      if (square === null) squares.push(i);
    });
    return squares;
  };

  isEmpty = (grid = this.grid) => {
    return this.getEmptySquares(grid).length === DIMENSIONS ** 2;
  };

  getWinner = (grid = this.grid) => {
    const winningCombos = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    let res: number | null = null;
    winningCombos.forEach((el, i) => {
      if (
        grid[el[0]] !== null &&
        grid[el[0]] === grid[el[1]] &&
        grid[el[0]] === grid[el[2]]
      ) {
        res = grid[el[0]];
      } else if (res === null && this.getEmptySquares(grid).length === 0) {
        res = DRAW;
      }
    });
    return res;
  };

  clone = () => {
    return new Board(this.grid.concat());
  };
}
