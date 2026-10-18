"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Algorithms = require("../algorithms.js");

function makeProblem(rows, cols, start, goal, wallCoordinates = []) {
  const walls = Array.from({ length: rows }, () => Array(cols).fill(false));
  for (const [row, col] of wallCoordinates) walls[row][col] = true;
  return { rows, cols, walls, start, goal };
}

function coordinates(index, cols) {
  return { row: Math.floor(index / cols), col: index % cols };
}

function assertValidPath(problem, result) {
  if (!result.found) {
    assert.equal(result.path.length, 0);
    assert.equal(result.pathNodeCount, 0);
    assert.equal(result.moves, 0);
    return;
  }

  const { rows, cols, walls, start, goal } = problem;
  const path = result.path.map((index) => coordinates(index, cols));
  assert.deepEqual(path[0], start, "path must start at the start cell");
  assert.deepEqual(path[path.length - 1], goal, "path must end at the destination");
  assert.equal(result.pathNodeCount, path.length);
  assert.equal(result.moves, Math.max(0, path.length - 1));

  for (const point of path) {
    assert.ok(point.row >= 0 && point.row < rows);
    assert.ok(point.col >= 0 && point.col < cols);
    assert.equal(walls[point.row][point.col], false, "path must not cross a wall");
  }
  for (let index = 1; index < path.length; index += 1) {
    const rowDifference = Math.abs(path[index].row - path[index - 1].row);
    const colDifference = Math.abs(path[index].col - path[index - 1].col);
    assert.equal(rowDifference + colDifference, 1, "path moves one cell up, down, left, or right");
  }
}

test("BFS, Dijkstra, and A* find the shortest route on an open grid", () => {
  const problem = makeProblem(7, 10, { row: 3, col: 1 }, { row: 3, col: 8 });
  for (const name of ["bfs", "dijkstra", "astar"]) {
    const result = Algorithms.runAlgorithm(name, problem);
    assert.equal(result.found, true, `${name} should find a route`);
    assert.equal(result.moves, 7, `${name} should find the 7-move shortest route`);
    assertValidPath(problem, result);
  }
});

test("BFS, Dijkstra, and A* agree on the optimal route around a wall barrier", () => {
  const barrier = [];
  for (let col = 2; col <= 6; col += 1) barrier.push([3, col]);
  const problem = makeProblem(7, 9, { row: 3, col: 1 }, { row: 3, col: 7 }, barrier);
  const results = ["bfs", "dijkstra", "astar"].map((name) => Algorithms.runAlgorithm(name, problem));

  for (const result of results) {
    assert.equal(result.found, true);
    assertValidPath(problem, result);
  }
  assert.equal(results[0].moves, results[1].moves);
  assert.equal(results[0].moves, results[2].moves);
  assert.equal(results[0].moves, 8);
});

test("DFS returns a valid route but is not required to return the shortest route", () => {
  const problem = makeProblem(5, 7, { row: 2, col: 1 }, { row: 2, col: 5 });
  const dfsResult = Algorithms.depthFirstSearch(problem);
  const bfsResult = Algorithms.breadthFirstSearch(problem);

  assert.equal(dfsResult.found, true);
  assertValidPath(problem, dfsResult);
  assertValidPath(problem, bfsResult);
  assert.ok(dfsResult.moves >= bfsResult.moves);
  // The demonstration grid and fixed neighbour order make the non-shortest
  // DFS example reproducible; shortest-path correctness is tested separately.
  assert.ok(dfsResult.moves > bfsResult.moves, `DFS used ${dfsResult.moves} moves; BFS used ${bfsResult.moves}`);
});

test("all algorithms report an unreachable destination without a path", () => {
  const walls = [[1, 2], [2, 1], [2, 3], [3, 2]];
  const problem = makeProblem(5, 5, { row: 0, col: 0 }, { row: 2, col: 2 }, walls);

  for (const name of ["bfs", "dfs", "dijkstra", "astar"]) {
    const result = Algorithms.runAlgorithm(name, problem);
    assert.equal(result.found, false, `${name} should report no route`);
    assertValidPath(problem, result);
    assert.ok(result.processed > 0);
    assert.ok(result.discovered >= result.processed);
  }
});

test("start equal to destination is a one-node, zero-move result", () => {
  const problem = makeProblem(3, 3, { row: 1, col: 1 }, { row: 1, col: 1 });
  for (const name of ["bfs", "dfs", "dijkstra", "astar"]) {
    const result = Algorithms.runAlgorithm(name, problem);
    assert.equal(result.found, true);
    assert.equal(result.pathNodeCount, 1);
    assert.equal(result.moves, 0);
    assert.equal(result.processed, 1);
    assertValidPath(problem, result);
  }
});

test("adjacent endpoints are one move apart; DFS remains valid without a shortest-path promise", () => {
  const problem = makeProblem(4, 4, { row: 1, col: 1 }, { row: 1, col: 2 });
  for (const name of ["bfs", "dijkstra", "astar"]) {
    const result = Algorithms.runAlgorithm(name, problem);
    assert.equal(result.found, true);
    assert.equal(result.moves, 1);
    assertValidPath(problem, result);
  }

  const dfsResult = Algorithms.depthFirstSearch(problem);
  assert.equal(dfsResult.found, true);
  assert.ok(dfsResult.moves >= 1);
  assertValidPath(problem, dfsResult);
});

test("Dijkstra and A* continue to agree on multiple deterministic layouts", () => {
  const cases = [
    makeProblem(8, 11, { row: 0, col: 0 }, { row: 7, col: 10 }, [[1, 1], [1, 2], [2, 2], [4, 5], [5, 5]]),
    makeProblem(6, 8, { row: 5, col: 1 }, { row: 0, col: 6 }, [[3, 2], [3, 3], [3, 4], [2, 4]])
  ];

  for (const problem of cases) {
    const bfs = Algorithms.breadthFirstSearch(problem);
    const dijkstra = Algorithms.dijkstra(problem);
    const astar = Algorithms.aStar(problem);
    assert.equal(dijkstra.found, bfs.found);
    assert.equal(astar.found, bfs.found);
    assert.equal(dijkstra.moves, bfs.moves);
    assert.equal(astar.moves, bfs.moves);
    assertValidPath(problem, bfs);
    assertValidPath(problem, dijkstra);
    assertValidPath(problem, astar);
  }
});

test("MinHeap pops entries in ascending priority order", () => {
  const heap = new Algorithms.MinHeap((a, b) => a.priority - b.priority);
  [9, 2, 7, 1, 4, 3].forEach((priority) => heap.push({ priority }));
  const popped = [];
  while (heap.size > 0) popped.push(heap.pop().priority);
  assert.deepEqual(popped, [1, 2, 3, 4, 7, 9]);
  assert.equal(heap.pop(), undefined);
});

test("invalid endpoints and wall dimensions produce clear errors", () => {
  const invalidEndpoint = makeProblem(3, 3, { row: -1, col: 0 }, { row: 2, col: 2 });
  assert.throws(() => Algorithms.breadthFirstSearch(invalidEndpoint), /outside the grid/);

  const invalidWalls = { rows: 2, cols: 3, walls: [[false, false]], start: { row: 0, col: 0 }, goal: { row: 1, col: 2 } };
  assert.throws(() => Algorithms.aStar(invalidWalls), /two-dimensional array/);
});

test("repeated searches on an unchanged snapshot return consistent paths", () => {
  const problem = makeProblem(5, 8, { row: 0, col: 1 }, { row: 4, col: 6 }, [[1, 2], [2, 2], [3, 5]]);
  const first = Algorithms.breadthFirstSearch(problem);
  const second = Algorithms.breadthFirstSearch(problem);
  assert.deepEqual(second.explorationOrder, first.explorationOrder);
  assert.deepEqual(second.path, first.path);
  assert.equal(second.moves, first.moves);
});
