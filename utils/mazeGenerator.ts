import { Cell, CellType, Position } from '../types';

export const generateMaze = (cols: number, rows: number): { grid: Cell[][], start: Position, end: Position } => {
  const grid: Cell[][] = [];

  // Initialize grid
  for (let y = 0; y < rows; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < cols; x++) {
      row.push({
        x,
        y,
        visited: false,
        walls: { top: true, right: true, bottom: true, left: true },
        type: CellType.Empty
      });
    }
    grid.push(row);
  }

  const stack: Cell[] = [];
  const start: Position = { x: 0, y: 0 };
  const current = grid[0][0];
  current.visited = true;
  stack.push(current);

  // Recursive Backtracker
  while (stack.length > 0) {
    const currCell = stack[stack.length - 1]; // Peek
    const neighbors = getUnvisitedNeighbors(currCell, grid, cols, rows);

    if (neighbors.length > 0) {
      const nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
      removeWalls(currCell, nextCell);
      nextCell.visited = true;
      stack.push(nextCell);
    } else {
      stack.pop();
    }
  }

  // Reset visited flags for gameplay
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      grid[y][x].visited = false;
    }
  }

  // Set Start and End
  grid[0][0].type = CellType.Start;
  const endX = cols - 1;
  const endY = rows - 1;
  grid[endY][endX].type = CellType.End;

  // Add random Locked Doors (Challenge points)
  const totalCells = cols * rows;
  const challengeCount = Math.floor(totalCells * 0.15);
  let placed = 0;
  
  while (placed < challengeCount) {
    const rx = Math.floor(Math.random() * cols);
    const ry = Math.floor(Math.random() * rows);
    
    if (grid[ry][rx].type === CellType.Empty && !(rx === 0 && ry === 0)) {
       grid[ry][rx].type = CellType.Locked;
       placed++;
    }
  }

  return { grid, start, end: { x: endX, y: endY } };
};

const getUnvisitedNeighbors = (cell: Cell, grid: Cell[][], cols: number, rows: number): Cell[] => {
  const neighbors: Cell[] = [];
  const { x, y } = cell;

  if (y > 0 && !grid[y - 1][x].visited) neighbors.push(grid[y - 1][x]); // Top
  if (x < cols - 1 && !grid[y][x + 1].visited) neighbors.push(grid[y][x + 1]); // Right
  if (y < rows - 1 && !grid[y + 1][x].visited) neighbors.push(grid[y + 1][x]); // Bottom
  if (x > 0 && !grid[y][x - 1].visited) neighbors.push(grid[y][x - 1]); // Left

  return neighbors;
};

const removeWalls = (a: Cell, b: Cell) => {
  const xDiff = a.x - b.x;
  const yDiff = a.y - b.y;

  if (xDiff === 1) { // a is right of b
    a.walls.left = false;
    b.walls.right = false;
  } else if (xDiff === -1) { // a is left of b
    a.walls.right = false;
    b.walls.left = false;
  }

  if (yDiff === 1) { // a is below b
    a.walls.top = false;
    b.walls.bottom = false;
  } else if (yDiff === -1) { // a is above b
    a.walls.bottom = false;
    b.walls.top = false;
  }
};