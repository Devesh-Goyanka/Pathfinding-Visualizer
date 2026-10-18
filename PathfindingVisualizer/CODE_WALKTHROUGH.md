# Beginner Code Walkthrough

This guide introduces the ideas before showing code. You do not need to know a framework: this project uses regular HTML, CSS, and JavaScript.

## 1. What each file does

- **`index.html`** describes the page: heading, algorithm dropdown, buttons, grid container, legend, result cards, and the two script tags.
- **`style.css`** controls the dark theme, layout, mobile breakpoints, colours for cell states, and small CSS animations.
- **`algorithms.js`** contains the search algorithms and `MinHeap`. It never reads or changes the page, so it can be tested in Node.js.
- **`script.js`** builds the grid, handles clicks/drags/buttons, takes a search snapshot, calls an algorithm, and animates the returned result.
- **`tests/algorithms.test.js`** runs automated checks with Node's built-in test runner.
- **`README.md`** is the run and usage guide; **`PROJECT_REPORT.md`** is the college report; **`VIVA_QUESTIONS.md`** is viva practice; the `.pptx` is the editable presentation.
- **`assets/visualizer-demo.png`** is a real browser screenshot from an A* run of this implementation.

The order of these lines in `index.html` matters:

```html
<script defer src="algorithms.js"></script>
<script defer src="script.js"></script>
```

The first file creates `window.PathfindingAlgorithms`; the second file uses it. `defer` waits until the HTML has been read before executing each script, while preserving their order.

## 2. A few JavaScript ideas first

### Arrays and objects

An array is an ordered list. An object groups named values. A cell is an object such as:

```js
{
  row: 4,
  col: 7,
  isWall: false,
  isVisited: false,
  isPath: false,
  element: null
}
```

`grid[4][7]` means row 4, column 7. JavaScript arrays start at zero, so the first row is 0 even though the interface describes it as row 1.

### Functions

A function is a named piece of work. `getNeighbors()` answers “which cells can I legally move to from here?” `breadthFirstSearch()` answers “what order does BFS process and what route does it find?”

### The DOM

The DOM is the browser's in-memory representation of HTML. `document.getElementById("grid")` finds the grid container. `document.createElement("div")` creates one cell element. CSS classes such as `is-wall` and `is-path` tell the browser how to colour it.

### Events

An event is something the user or browser does: a pointer-down, a button click, a dropdown change, or a resize. `addEventListener("click", ...)` connects an event to a function.

## 3. How the grid is represented

`script.js` uses a 2D array. The outer array holds rows; each row contains 30 cell objects:

```js
function makeGrid() {
  return Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => ({
      row, col,
      isWall: false,
      isVisited: false,
      isPath: false,
      element: null
    }))
  );
}
```

The coordinate `(row, col)` is stored separately for start and destination. That makes it easy to move an endpoint without accidentally storing two starts or two destinations in the grid. A wall, visited state, or path state belongs to the cell object.

`buildGridView()` creates 600 HTML `div` cells. It puts each cell's row and column in `data-row` and `data-col`, and stores that DOM element back in `cell.element`. `updateCellView()` applies CSS classes based on the data. The data model is the source of truth; the element is only its display.

When a search starts, `snapshotGrid()` makes a separate copy of the wall matrix and endpoints. The algorithms read this snapshot, not the live DOM. This keeps the graph input stable for that search.

## 4. How clicking and dragging walls works

The website uses **pointer events**, which cover mouse, pen, and touch input better than separate mouse-only handlers.

1. `pointerdown` on a regular open cell selects `draw-wall` mode and paints that cell.
2. `pointerdown` on a wall selects `erase-wall` mode and clears it.
3. While the pointer moves over other cells, `pointerover` applies the same mode.
4. A pointer-down on S or G selects an endpoint-move mode instead.
5. Endpoint movement checks that the new cell is open and not the other endpoint.
6. On pointer-up, drawing stops.

The grid checks `isRunning` before editing. During an animation, grid edits and algorithm changes are locked. Clear/reset/random controls intentionally remain available because they cancel the run safely.

A simple click on an empty cell toggles it into a wall because pointer-down applies the chosen mode immediately. Starting a drag on a wall erases rather than adds one.

## 5. How neighbours are identified

A graph neighbour is a cell one legal move away. The project only checks four directions:

```text
      up
left current right
down
```

In `algorithms.js`, `getNeighbors(index, rows, cols, walls)` converts the flat index back into a row and column. It checks that each candidate remains inside the grid and is not a wall, then returns the candidate's flat index. Flat indices are calculated as:

```text
index = row * numberOfColumns + column
```

For a 20 × 30 grid, `(row 2, column 4)` becomes `2 * 30 + 4 = 64`. The algorithm uses flat numbers in typed arrays, while the UI keeps the friendly 2D cell objects.

## 6. The data structures, in plain English

### Queue

A queue works like a line: first in, first out (FIFO). BFS adds newly found cells at the back and processes the oldest one at the front. The code uses an array and a `head` counter instead of repeatedly deleting array element 0.

### Stack

A stack works like a pile: last in, first out (LIFO). DFS follows the most recently selected branch and backs up when that branch ends. The project uses an array whose last element is the top of the stack.

### Min-heap

A min-heap makes it efficient to remove the item with the smallest priority. Dijkstra stores a distance priority; A* stores `g + h`. `MinHeap.push()` moves a new item upward until the heap order is restored; `pop()` removes the minimum and moves the last item downward.

### Visited, distance, and parent arrays

- `seen` prevents BFS/DFS from repeatedly adding the same cell.
- `distance` stores Dijkstra's best cost known from the start.
- `gScore` stores A*'s best known cost so far.
- `parent[cell]` remembers which cell led to its current route.
- `closed`/`settled` marks cells that have been processed as final for the current algorithm.

## 7. How BFS works step by step

Example: start at the left end of a row. BFS first adds the start to the queue. It removes the start, adds its open neighbours, then removes those neighbours in the same order they were added. This gives a wave-like search.

Pseudocode:

```text
queue = [start]
mark start seen
while queue has a cell:
    current = remove queue front
    record current as processed
    if current is goal: stop
    for each open neighbour:
        if neighbour has not been seen:
            mark it seen
            parent[neighbour] = current
            add it to queue back
```

The code marks a cell seen when it is **added** to the queue, not when it is removed. This prevents two neighbouring cells from adding the same candidate twice.

Because the queue is FIFO, BFS processes cells at distance 0, then distance 1, then 2, and so on. With every move costing 1, the first route to the goal uses the fewest moves.

## 8. How DFS works step by step

DFS uses an explicit stack and a cursor for each cell's next direction to check. It puts a new neighbour on the stack and continues from there. If a cell has no more unseen neighbours, DFS pops it and returns to the previous cell.

```text
stack = [start]
while stack is not empty:
    current = top of stack
    if current is new: record it as processed
    if it has an unvisited open neighbour:
        record parent and push that neighbour
    else:
        pop current to backtrack
```

The cursor is what lets this iterative version resume checking the next neighbour after backtracking. DFS is not guaranteed to choose the shortest route; a valid route is not the same thing as an optimal route.

## 9. How Dijkstra works step by step

Dijkstra keeps a tentative distance for each cell. The start distance is 0. Every other cell begins at infinity. The min-heap makes the cell with the lowest currently known cost come out first.

For each neighbour, the algorithm calculates:

```text
candidateCost = currentCost + movementCost
```

The current `movementCost` function always returns 1. If this candidate is lower than the neighbour's saved distance, the algorithm updates the distance and parent and pushes a heap entry.

The project uses **lazy duplicate entries** rather than a decrease-key heap operation. If the cost later improves, a new entry is pushed. When an older entry is popped, it no longer matches the saved distance and is skipped. This is why the statistic counts accepted/valid heap removals, not every raw heap pop.

## 10. How A* works step by step

A* uses the same kind of min-heap as Dijkstra but combines actual and estimated costs:

```text
f(n) = g(n) + h(n)
g(n) = cost already travelled
h(n) = estimated remaining cost
```

For four-directional movement with unit cost, the code uses Manhattan distance:

```text
h = abs(currentRow - goalRow) + abs(currentColumn - goalColumn)
```

For example, if the current cell is `(2, 3)` and the goal is `(5, 7)`, `h = |2 - 5| + |3 - 7| = 3 + 4 = 7`.

The heuristic guides the order but does not replace checking legal moves. Walls are still excluded by `getNeighbors()`. Under the current movement/cost assumptions, Manhattan distance never overestimates and is consistent, so A* returns an optimal route.

## 11. How parent links reconstruct a route

Suppose the parent array records:

```text
parent[goal] = C
parent[C] = B
parent[B] = start
```

The algorithm starts at the goal and follows parents: `goal → C → B → start`. That list points backward. `reconstructPath()` reverses it to get `start → B → C → goal`.

If the destination was never reached, there is no chain back to the start. The function returns an empty path. If start equals goal, it returns a one-cell path and zero moves.

## 12. How animation works

The algorithm finishes its calculation before the animation begins. It returns:

- `explorationOrder`: flat indices in the order processed.
- `path`: flat indices from start to destination, or an empty list.
- counters such as `discovered` and `processed`.

`animateResult()` loops through those arrays. For each exploration index it updates the corresponding cell state and waits for an asynchronous timeout. After exploration, it does the same for the path. `await` pauses this async function, not the browser's entire page; button clicks and page painting can still happen.

The speed slider changes the next timeout. Pause clears the current timer and remembers its remaining time. Resume schedules that remaining time again. Clear/reset/random increments a `runToken`, clears and resolves the active timer, and makes the old animation return before it can change a fresh grid.

This separation matters: slowing the visual display does not change the search order or the final path.

## 13. How the buttons interact with JavaScript

| Control | Main action in `script.js` |
|---|---|
| Visualize path | `runSearch()` snapshots the grid, times the selected algorithm, updates statistics, and starts `animateResult()`. |
| Pause / Resume | `pauseOrResume()` stops or restarts the active animation timeout. |
| Clear path | `clearPathButtonAction()` cancels a run and clears only visited/path display states. Walls and endpoints remain. |
| Reset grid | `resetGridAction()` cancels a run, creates a fresh empty grid, and restores default endpoints. |
| Random obstacles | `randomObstaclesAction()` cancels a run, generates walls, checks reachability with BFS, and carves a route if needed. |
| Algorithm dropdown | `onAlgorithmChange()` updates the explanation and clears stale search results. |
| Animation speed | `updateSpeedLabel()` displays the current percentage; `animationDelay()` maps it to a timeout. |

## 14. Statistics, accurately

- **Discovered** is unique cells admitted to the frontier or assigned a finite tentative cost. It includes the start.
- **Processed** counts accepted/valid frontier removals. It includes the start and the destination if reached. Stale heap entries are ignored.
- **Explored shown** counts processed cells that receive the blue colour. The green/red endpoints retain their own colours and do not count toward this number.
- **Path nodes** counts every cell in the path, including endpoints.
- **Path moves** is path nodes minus one.
- **Search time** includes the algorithm and path reconstruction, but not DOM updates or animation.

These values answer different questions. For example, a node may be discovered and waiting in a frontier without yet being processed.

## 15. How to debug common problems

1. **The page is blank:** check that `algorithms.js` and `script.js` are beside `index.html`, and that the two script tags are in the correct order.
2. **Buttons do nothing:** open Developer Tools → Console. A missing file or JavaScript error is usually shown there. Confirm the IDs in HTML match the IDs queried by `script.js`.
3. **CSS looks missing:** check the link `href="style.css"` and file spelling/capitalization.
4. **A route is not found:** check for a continuous wall barrier. Use Reset Grid or Random Obstacles to check the algorithm on a known connected layout.
5. **DFS takes a long route:** this is expected; DFS does not promise shortest paths. Compare its route with BFS.
6. **The grid is cut off on a phone:** swipe horizontally inside the grid area. It has an internal horizontal scroller so the 30 columns remain large enough to interact with.
7. **Old animation colours appear after a reset:** that would be a bug. Verify that cancellation calls `cancelAnimation()`, which increments `runToken` and clears the active timeout.
8. **Automated tests do not run:** use Node.js 18 or newer and run `node --test tests/algorithms.test.js` from the project folder. Node is only needed for tests, not to open the website.

## 16. A short presentation explanation

> “I model the board as a graph: each open cell is a vertex and four-way moves are edges. BFS uses a queue, DFS uses an explicit stack, and Dijkstra and A* use my own binary min-heap. Each algorithm records parents, and I reconstruct the route by following those parents backward from the destination. The UI first computes the result on a stable snapshot and then animates it asynchronously. The board uses uniform move costs, so BFS, Dijkstra, and Manhattan A* are optimal; DFS is not guaranteed to be shortest.”
