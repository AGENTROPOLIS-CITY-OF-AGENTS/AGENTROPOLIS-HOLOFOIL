import assert from "node:assert/strict";
import test from "node:test";
import { createSnake, queueDir, stepSnake } from "./snake.ts";
import { CONSOLES } from "./consoles.ts";

test("Game Boy is the playable snake booth", () => {
  const gb = CONSOLES.find((c) => c.id === "gameboy");
  assert.equal(gb?.game, "snake");
  assert.equal(CONSOLES.length, 6);
});

test("snake grows on food and dies on itself", () => {
  let state = createSnake(8, 8);
  state = { ...state, snake: [{ x: 3, y: 4 }], food: { x: 4, y: 4 }, dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 } };
  state = stepSnake(state);
  assert.equal(state.score, 10);
  assert.equal(state.snake.length, 2);
  state = {
    ...state,
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
    ],
    dir: { x: -1, y: 0 },
    nextDir: { x: -1, y: 0 },
    food: { x: 7, y: 7 },
  };
  state = stepSnake(state);
  assert.equal(state.alive, false);
});

test("A/D queue left and right without reversing", () => {
  let state = createSnake(8, 8);
  state = { ...state, dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 } };
  state = queueDir(state, { x: -1, y: 0 });
  assert.equal(state.nextDir.x, 1);
  state = queueDir(state, { x: 0, y: -1 });
  assert.equal(state.nextDir.y, -1);
});
