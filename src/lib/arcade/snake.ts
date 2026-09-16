export type Vec2 = { x: number; y: number };

export type SnakeState = {
  snake: Vec2[];
  dir: Vec2;
  nextDir: Vec2;
  food: Vec2;
  score: number;
  alive: boolean;
  cols: number;
  rows: number;
};

export const SNAKE_TICK_MS = 110;
export const SNAKE_CELL = 8;

export function spawnFood(cols: number, rows: number, snake: Vec2[], seed = 1): Vec2 {
  const x = Math.abs(seed * 17) % cols;
  const y = Math.abs(seed * 31) % rows;
  for (let i = 0; i < cols * rows; i += 1) {
    const candidate = { x: (x + i) % cols, y: (y + Math.floor(i / cols)) % rows };
    if (!snake.some((seg) => seg.x === candidate.x && seg.y === candidate.y)) return candidate;
  }
  return { x: 0, y: 0 };
}

export function createSnake(cols: number, rows: number): SnakeState {
  const start = { x: Math.floor(cols / 2), y: Math.floor(rows / 2) };
  return {
    snake: [start],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: spawnFood(cols, rows, [start], 3),
    score: 0,
    alive: true,
    cols,
    rows,
  };
}

export function queueDir(state: SnakeState, dir: Vec2): SnakeState {
  if (!state.alive) return state;
  if (dir.x === -state.dir.x && dir.y === -state.dir.y) return state;
  return { ...state, nextDir: dir };
}

export function stepSnake(state: SnakeState): SnakeState {
  if (!state.alive) return state;
  const dir = state.nextDir;
  const head = {
    x: (state.snake[0].x + dir.x + state.cols) % state.cols,
    y: (state.snake[0].y + dir.y + state.rows) % state.rows,
  };
  if (state.snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
    return { ...state, dir, alive: false };
  }
  const grew = head.x === state.food.x && head.y === state.food.y;
  const snake = [head, ...state.snake];
  if (!grew) snake.pop();
  return {
    ...state,
    dir,
    snake,
    score: grew ? state.score + 10 : state.score,
    food: grew ? spawnFood(state.cols, state.rows, snake, state.score + 11) : state.food,
    alive: true,
  };
}

export const DIR_FROM_KEY: Record<string, Vec2> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
  W: { x: 0, y: -1 },
  S: { x: 0, y: 1 },
  A: { x: -1, y: 0 },
  D: { x: 1, y: 0 },
};
