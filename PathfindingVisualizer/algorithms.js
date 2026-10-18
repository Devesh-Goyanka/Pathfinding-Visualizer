/*
 * Pathfinding algorithms for Pathfinding Visualizer.
 * This file contains only graph/search logic; it does not read or modify the DOM.
 * The same functions are used by the browser UI and by the Node.js tests.
 */
(function attachPathfindingAlgorithms(root, factory) {
  "use strict";

  const api = factory();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.PathfindingAlgorithms = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createAlgorithms() {
  "use strict";

  /** A binary min-heap. The smallest item, according to compare(), is popped first. */
  class MinHeap {
    constructor(compare) {
      this.items = [];
      this.compare = compare || ((a, b) => a.priority - b.priority);
    }

    get size() {
      return this.items.length;
    }

    push(item) {
      const items = this.items;
      items.push(item);
      let childIndex = items.length - 1;

      while (childIndex > 0) {
        const parentIndex = Math.floor((childIndex - 1) / 2);
        if (this.compare(items[childIndex], items[parentIndex]) >= 0) break;
        [items[childIndex], items[parentIndex]] = [items[parentIndex], items[childIndex]];
        childIndex = parentIndex;
      }
    }

    pop() {
      const items = this.items;
      if (items.length === 0) return undefined;
      if (items.length === 1) return items.pop();

      const minimum = items[0];
      items[0] = items.pop();
      let parentIndex = 0;

      while (true) {
        const leftIndex = parentIndex * 2 + 1;
        const rightIndex = leftIndex + 1;
        let smallestIndex = parentIndex;

        if (leftIndex < items.length && this.compare(items[leftIndex], items[smallestIndex]) < 0) {
          smallestIndex = leftIndex;
        }
        if (rightIndex < items.length && this.compare(items[rightIndex], items[smallestIndex]) < 0) {
          smallestIndex = rightIndex;
        }
        if (smallestIndex === parentIndex) break;

        [items[parentIndex], items[smallestIndex]] = [items[smallestIndex], items[parentIndex]];
        parentIndex = smallestIndex;
      }

      return minimum;
    }
  }

  function validateProblem(problem) {
    if (!problem || typeof problem !== "object") {
      throw new TypeError("A search problem object is required.");
    }

    const { rows, cols, walls, start, goal } = problem;
    if (!Number.isInteger(rows) || rows < 1 || !Number.isInteger(cols) || cols < 1) {
      throw new RangeError("Grid rows and columns must be positive integers.");
    }
    if (!Array.isArray(walls) || walls.length !== rows) {
      throw new TypeError("walls must be a two-dimensional array with one entry per row.");
    }
    for (let row = 0; row < rows; row += 1) {
      if (!Array.isArray(walls[row]) || walls[row].length !== cols) {
        throw new TypeError("Every walls row must contain one entry per column.");
      }
    }

    [start, goal].forEach((point, index) => {
      const label = index === 0 ? "start" : "destination";
      if (!point || !Number.isInteger(point.row) || !Number.isInteger(point.col)) {
        throw new TypeError(`The ${label} must have integer row and column values.`);
      }
      if (point.row < 0 || point.row >= rows || point.col < 0 || point.col >= cols) {
        throw new RangeError(`The ${label} is outside the grid.`);
      }
      if (walls[point.row][point.col]) {
        throw new Error(`The ${label} cannot be inside a wall.`);
      }
    });
  }

  /** Return open four-directional neighbours in the fixed order up, right, down, left. */
  function getNeighbors(index, rows, cols, walls) {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const neighbors = [];

    if (row > 0 && !walls[row - 1][col]) neighbors.push(index - cols);
    if (col + 1 < cols && !walls[row][col + 1]) neighbors.push(index + 1);
    if (row + 1 < rows && !walls[row + 1][col]) neighbors.push(index + cols);
    if (col > 0 && !walls[row][col - 1]) neighbors.push(index - 1);

    return neighbors;
  }

  function toIndex(point, cols) {
    return point.row * cols + point.col;
  }

  function manhattanDistance(firstIndex, secondIndex, cols) {
    const firstRow = Math.floor(firstIndex / cols);
    const firstCol = firstIndex % cols;
    const secondRow = Math.floor(secondIndex / cols);
    const secondCol = secondIndex % cols;
    return Math.abs(firstRow - secondRow) + Math.abs(firstCol - secondCol);
  }

  function reconstructPath(parent, startIndex, goalIndex) {
    if (startIndex === goalIndex) return [startIndex];

    const reversedPath = [];
    let current = goalIndex;
    let steps = 0;

    while (current !== -1 && steps <= parent.length) {
      reversedPath.push(current);
      if (current === startIndex) {
        reversedPath.reverse();
        return reversedPath;
      }
      current = parent[current];
      steps += 1;
    }

    // A missing chain means that the destination was not reached.
    return [];
  }

  function makeResult(algorithm, explorationOrder, discovered, parent, startIndex, goalIndex) {
    const path = reconstructPath(parent, startIndex, goalIndex);
    const found = path.length > 0;

    return {
      algorithm,
      found,
      explorationOrder,
      path,
      discovered,
      // A node is processed when it is removed from the frontier and accepted
      // for expansion. The start and (if reached) destination are included.
      processed: explorationOrder.length,
      pathNodeCount: found ? path.length : 0,
      moves: found ? Math.max(0, path.length - 1) : 0
    };
  }

  /** Breadth-first search: a FIFO queue explores the grid one distance layer at a time. */
  function breadthFirstSearch(problem) {
    validateProblem(problem);
    const { rows, cols, walls, start, goal } = problem;
    const total = rows * cols;
    const startIndex = toIndex(start, cols);
    const goalIndex = toIndex(goal, cols);
    const seen = new Uint8Array(total);
    const parent = new Int32Array(total);
    parent.fill(-1);

    const queue = [startIndex];
    let head = 0;
    let discovered = 1;
    const explorationOrder = [];
    seen[startIndex] = 1;

    while (head < queue.length) {
      const current = queue[head];
      head += 1;
      explorationOrder.push(current);

      if (current === goalIndex) break;

      for (const neighbor of getNeighbors(current, rows, cols, walls)) {
        if (seen[neighbor]) continue;
        seen[neighbor] = 1;
        parent[neighbor] = current;
        queue.push(neighbor);
        discovered += 1;
      }
    }

    return makeResult("bfs", explorationOrder, discovered, parent, startIndex, goalIndex);
  }

  /**
   * Depth-first search: an explicit stack follows one neighbour branch at a time,
   * then backtracks when that branch has no unvisited neighbour.
   */
  function depthFirstSearch(problem) {
    validateProblem(problem);
    const { rows, cols, walls, start, goal } = problem;
    const total = rows * cols;
    const startIndex = toIndex(start, cols);
    const goalIndex = toIndex(goal, cols);
    const seen = new Uint8Array(total);
    const processed = new Uint8Array(total);
    const nextDirection = new Uint8Array(total);
    const parent = new Int32Array(total);
    parent.fill(-1);

    const stack = [startIndex];
    const explorationOrder = [];
    let discovered = 1;
    seen[startIndex] = 1;

    while (stack.length > 0) {
      const current = stack[stack.length - 1];

      if (!processed[current]) {
        processed[current] = 1;
        explorationOrder.push(current);
        if (current === goalIndex) break;
      }

      const neighbors = getNeighbors(current, rows, cols, walls);
      let descended = false;

      while (nextDirection[current] < neighbors.length) {
        const neighbor = neighbors[nextDirection[current]];
        nextDirection[current] += 1;
        if (seen[neighbor]) continue;

        seen[neighbor] = 1;
        parent[neighbor] = current;
        discovered += 1;
        stack.push(neighbor);
        descended = true;
        break;
      }

      if (!descended) stack.pop();
    }

    return makeResult("dfs", explorationOrder, discovered, parent, startIndex, goalIndex);
  }

  /**
   * Dijkstra's algorithm. Each grid move currently costs 1. Keeping the cost
   * calculation in one place makes weighted terrain a straightforward extension.
   */
  function dijkstra(problem) {
    validateProblem(problem);
    const { rows, cols, walls, start, goal } = problem;
    const total = rows * cols;
    const startIndex = toIndex(start, cols);
    const goalIndex = toIndex(goal, cols);
    const distance = new Float64Array(total);
    distance.fill(Infinity);
    const parent = new Int32Array(total);
    parent.fill(-1);
    const discovered = new Uint8Array(total);
    const settled = new Uint8Array(total);
    const explorationOrder = [];
    let discoveredCount = 1;
    let sequence = 0;

    // For weighted terrain, replace this with the non-negative cost of entering
    // the destination cell. At present every legal movement costs exactly 1.
    const movementCost = () => 1;
    const heap = new MinHeap((a, b) => a.priority - b.priority || a.sequence - b.sequence);
    distance[startIndex] = 0;
    discovered[startIndex] = 1;
    heap.push({ index: startIndex, priority: 0, distance: 0, sequence: sequence++ });

    while (heap.size > 0) {
      const entry = heap.pop();
      const current = entry.index;

      // Decrease-key is implemented by adding a newer heap entry. Ignore old ones.
      if (settled[current] || entry.distance !== distance[current]) continue;
      settled[current] = 1;
      explorationOrder.push(current);

      if (current === goalIndex) break;

      for (const neighbor of getNeighbors(current, rows, cols, walls)) {
        if (settled[neighbor]) continue;
        const candidateDistance = distance[current] + movementCost(current, neighbor);

        if (candidateDistance < distance[neighbor]) {
          if (!discovered[neighbor]) {
            discovered[neighbor] = 1;
            discoveredCount += 1;
          }
          distance[neighbor] = candidateDistance;
          parent[neighbor] = current;
          heap.push({
            index: neighbor,
            priority: candidateDistance,
            distance: candidateDistance,
            sequence: sequence++
          });
        }
      }
    }

    return makeResult("dijkstra", explorationOrder, discoveredCount, parent, startIndex, goalIndex);
  }

  /** A* search using f(n) = g(n) + h(n), where h is Manhattan distance. */
  function aStar(problem) {
    validateProblem(problem);
    const { rows, cols, walls, start, goal } = problem;
    const total = rows * cols;
    const startIndex = toIndex(start, cols);
    const goalIndex = toIndex(goal, cols);
    const gScore = new Float64Array(total);
    gScore.fill(Infinity);
    const parent = new Int32Array(total);
    parent.fill(-1);
    const discovered = new Uint8Array(total);
    const closed = new Uint8Array(total);
    const explorationOrder = [];
    let discoveredCount = 1;
    let sequence = 0;

    // Same extension point as Dijkstra: every unweighted step has cost 1 now.
    const movementCost = () => 1;
    const heap = new MinHeap((a, b) => a.priority - b.priority || a.sequence - b.sequence);
    gScore[startIndex] = 0;
    discovered[startIndex] = 1;
    heap.push({
      index: startIndex,
      g: 0,
      priority: manhattanDistance(startIndex, goalIndex, cols),
      sequence: sequence++
    });

    while (heap.size > 0) {
      const entry = heap.pop();
      const current = entry.index;

      // Ignore an outdated entry. Manhattan distance is consistent for this grid,
      // so a closed node never needs to be reopened.
      if (closed[current] || entry.g !== gScore[current]) continue;
      closed[current] = 1;
      explorationOrder.push(current);

      if (current === goalIndex) break;

      for (const neighbor of getNeighbors(current, rows, cols, walls)) {
        if (closed[neighbor]) continue;
        const candidateG = gScore[current] + movementCost(current, neighbor);

        if (candidateG < gScore[neighbor]) {
          if (!discovered[neighbor]) {
            discovered[neighbor] = 1;
            discoveredCount += 1;
          }
          gScore[neighbor] = candidateG;
          parent[neighbor] = current;
          const heuristic = manhattanDistance(neighbor, goalIndex, cols);
          heap.push({
            index: neighbor,
            g: candidateG,
            priority: candidateG + heuristic,
            sequence: sequence++
          });
        }
      }
    }

    return makeResult("astar", explorationOrder, discoveredCount, parent, startIndex, goalIndex);
  }

  const algorithms = {
    bfs: breadthFirstSearch,
    dfs: depthFirstSearch,
    dijkstra,
    astar: aStar
  };

  function runAlgorithm(name, problem) {
    const algorithm = algorithms[name];
    if (!algorithm) {
      throw new Error(`Unknown algorithm: ${name}`);
    }
    return algorithm(problem);
  }

  return {
    MinHeap,
    getNeighbors,
    manhattanDistance,
    breadthFirstSearch,
    depthFirstSearch,
    dijkstra,
    aStar,
    runAlgorithm
  };
});
