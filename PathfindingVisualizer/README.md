# Pathfinding Visualizer

A static, dependency-free educational website that makes four graph-search algorithms visible on a grid: Breadth-First Search (BFS), Depth-First Search (DFS), Dijkstra's algorithm, and A* search. It is built with HTML, CSS, and JavaScript and runs in a browser; it is **not** a native Android, iOS, or desktop application.

> **For students:** Download the website files, open `index.html`, and explore the algorithms. No framework, package installation, server, or database is required for normal use.

## Project overview

The grid is a graph. Each open cell is a vertex; a legal up, down, left, or right move is an edge. Walls remove cells from the graph. The user chooses an algorithm, and the website shows the nodes it processes before drawing the route it reconstructs from predecessor links.

### Problem statement

A pathfinding algorithm can return a route as a list of coordinates, but that result alone hides how the algorithm searched. This project provides an interactive way to see the search frontier, explored cells, obstacles, and final route while comparing four different strategies on the same grid.

### Motivation and need

Queues, stacks, heaps, visited sets, distance values, and predecessor links are easier to understand when their effects can be observed. A visualizer supports classroom demonstrations and self-study, and helps students discuss both the route and the work done to find it.

### Objectives

- Implement BFS, DFS, Dijkstra, and A* as separate algorithms in plain JavaScript.
- Represent a grid and its four-directional connections clearly.
- Allow walls and endpoints to be edited interactively.
- Animate exploration and path reconstruction without blocking the browser.
- Display measurements with clear definitions rather than treating different counts as interchangeable.
- Keep the source readable enough for a beginner to trace and modify.

## Features

- Dynamically builds a 20-row by 30-column grid.
- Green start and red destination cells; walls cannot cover either endpoint.
- Click or drag to draw/erase walls. Drag the start or destination to move it.
- Four independently implemented search algorithms.
- Animated explored nodes followed by an animated final path.
- Adjustable speed and Pause/Resume.
- **Clear path** removes search/path colours but preserves walls and endpoints.
- **Reset grid** restores the empty grid and original endpoint positions.
- **Random obstacles** creates walls and verifies that a route remains open; if needed, it carves a simple L-shaped corridor.
- Handles a blocked/unreachable destination and the case where start equals destination.
- Includes an on-page learning section explaining the grid-as-graph model, queue/stack, min-heap, visited flags, parent links, and route guarantees.
- Desktop, tablet, and mobile-friendly layout. On narrow screens the grid can be scrolled horizontally; taps can edit individual cells.
- No external libraries, APIs, keys, backend, or database are required by the website.

## Technologies

- HTML5: page structure and accessible labels.
- CSS3: layout, colour, responsiveness, and cell animations.
- Vanilla JavaScript: UI state, interactions, algorithms, timing, and statistics.
- Node.js built-in test runner: optional automated tests for the algorithm module only. Node is **not** required to open the website.

## Folder structure

```text
PathfindingVisualizer/
├── index.html                         # Website structure, controls, and DSA learning section
├── style.css                          # Theme, responsive layout, and cell states
├── algorithms.js                      # Pure BFS, DFS, Dijkstra, A*, and MinHeap code
├── script.js                          # Grid state, interactions, animation, and statistics
├── README.md                          # This guide
├── PROJECT_REPORT.md                  # College project report
├── CODE_WALKTHROUGH.md                # Beginner-focused code explanation
├── VIVA_QUESTIONS.md                  # Viva questions and sample answers
├── PathfindingVisualizer_Presentation.pptx
├── assets/
│   └── visualizer-demo.png            # Real browser capture of an A* run
└── tests/
    └── algorithms.test.js             # Node.js automated algorithm tests
```

## Step-by-step installation and website setup

This is a static website made from local HTML, CSS, and JavaScript files. There is no installer, `npm install`, framework setup, account, database, or internet connection required to use it.

### Method A — open the website directly (recommended)

1. **Download the project ZIP** from the project bundle or repository provided by your instructor.
2. **Extract the ZIP.** On Windows, right-click it and choose **Extract All**. On macOS, double-click the ZIP. On Linux, use your archive manager or `unzip`.
3. Open the extracted **`PathfindingVisualizer`** folder. Confirm that `index.html`, `style.css`, `algorithms.js`, and `script.js` are in the same folder.
4. **Open `index.html`** by double-clicking it. If your computer asks which program to use, choose a modern browser such as Chrome, Edge, Firefox, or Safari.
5. The Pathfinding Visualizer website should appear. You can now edit the grid and run the algorithms offline.

### Method B — serve the website at a local address (optional)

A small static server is optional. Use it if you prefer opening a `http://localhost` address or if your browser restricts local files.

1. Install Python 3 only if it is not already available. The website itself does **not** depend on Python.
2. Open a terminal/command prompt **inside the extracted `PathfindingVisualizer` folder**.
3. Start a temporary local server with the command for your system:

   **Windows (PowerShell or Command Prompt):**
   ```bash
   py -m http.server 8000
   ```
   If `py` is unavailable, try `python -m http.server 8000`.

   **macOS / Linux:**
   ```bash
   python3 -m http.server 8000
   ```

4. Leave the terminal running and open this address in your browser: **http://localhost:8000**.
5. To stop the local server, return to the terminal and press **Ctrl+C**.

### Optional — run the automated algorithm tests

Node.js 18 or newer is needed only for tests, not for opening the website.

1. Install Node.js if you want to run the tests.
2. Open a terminal in the project folder.
3. Run:
   ```bash
   node --test tests/algorithms.test.js
   node --check algorithms.js
   node --check script.js
   ```
4. A successful test run ends with `# pass 10` and `# fail 0`.

No package install command is used: the project has no runtime dependencies.

## Use the website

1. Choose an algorithm from the dropdown.
2. Click or drag over an empty cell to add walls. Start on a wall to erase walls.
3. Drag the green **S** or red **G** cell to move an endpoint. Endpoints cannot be placed on walls or on each other.
4. Adjust **Animation speed** if needed.
5. Click **Visualize path**. Explored cells appear first; the final route appears afterward.
6. Use **Pause animation** / **Resume animation** when you want to inspect a stage.
7. **Clear path** preserves walls and endpoints. **Reset grid** clears walls and restores the original endpoints. **Random obstacles** generates a new connected layout.

A search locks grid editing and algorithm selection so its result cannot be changed underneath the animation. Clear, reset, and random-obstacle controls can cancel a running or paused animation safely.

## Algorithms in simple terms

The grid has `V` open cells (vertices) and `E` legal neighbour-to-neighbour connections (edges). For this four-way grid, `E` is at most about `4V` before counting each undirected connection only once. Every current move costs 1.

| Algorithm | Main data structure | Search idea | Shortest-path guarantee in this project | Time / space |
|---|---|---|---|---|
| BFS | FIFO queue | Visit all cells 1 move away, then 2 moves away, and so on. | Yes, when all moves have equal cost (as here). | `O(V + E)` / `O(V)` |
| DFS | Explicit stack and per-cell neighbour cursor | Follow one branch until it cannot continue, then backtrack. | No. It finds a route if one is reached, but it may be longer than necessary. | `O(V + E)` / `O(V)` |
| Dijkstra | Binary min-heap / priority queue | Always process the open cell with the lowest known `g` cost. | Yes for non-negative edge costs. Here every legal move costs 1, so it agrees with BFS on path length. | `O((V + E) log E)` / `O(V + E)` with lazy duplicate heap entries |
| A* | Binary min-heap / priority queue | Order cells by `f(n) = g(n) + h(n)`. `g` is the known cost so far; `h` is Manhattan distance to the goal. | Yes here: four directions, unit costs, and an admissible/consistent Manhattan heuristic. | Worst case `O((V + E) log E)` / `O(V + E)` with lazy duplicate entries |

For a grid with a fixed number of neighbours per cell, `E = O(V)`, so the heap algorithms are commonly summarized as `O(V log V)` time and `O(V)` space for this scale. The implementation uses lazy duplicate heap entries (a decrease in cost pushes a new entry and a stale one is ignored), so the more explicit bound above is also given.

### How the four algorithms differ

- **BFS** uses a queue. First discovery happens in increasing number of moves, which is why the first route to the goal has minimum moves on an unweighted grid.
- **DFS** uses a stack-like search path. It can reach deep into one area before checking nearby alternatives. Its parent links still produce a valid route, but not necessarily the shortest one.
- **Dijkstra** uses a min-heap keyed by distance from the start. It is useful when edge costs differ, provided they are non-negative. In the current website, the cost function returns 1 for every move; weighted terrain is not exposed in the UI.
- **A*** uses Dijkstra's `g` cost plus a heuristic. Manhattan distance is `|row - goalRow| + |column - goalColumn|`. With the current rules, it never overestimates the remaining number of moves and it is consistent, so A* remains optimal while often examining fewer cells. It is not guaranteed to examine fewer cells on every layout.

## Data structures and statistics

### Detailed paragraph: data structures used in the website

The website stores its visible board as a **two-dimensional array** named `grid`, so `grid[row][column]` points directly to a cell object containing its coordinates, wall flag, visited/path display flags, and matching HTML element. To search that board as a graph, each open cell is treated as a vertex and `getNeighbors()` supplies up to four legal edges (up, right, down, and left); walls and out-of-bounds locations are excluded. The algorithms use a flattened integer cell index internally so compact JavaScript typed arrays can store data by vertex: `Uint8Array` flags record whether a cell has been discovered or closed, `Float64Array` values store Dijkstra distances or A* `gScore`, and `Int32Array` entries store each cell's parent index for route reconstruction. BFS uses an array as a **queue** with a head pointer, which gives first-in, first-out processing without repeatedly shifting the array. DFS uses an array as an explicit **stack**, plus a small direction cursor for each cell, to explore one branch deeply and then backtrack. Dijkstra and A* share the project's own binary **min-heap priority queue**: Dijkstra orders entries by cost from the start, while A* orders them by `g + h`, where `h` is Manhattan distance to the goal. When a cell's parent is updated, that link records the best known predecessor; following the links from destination back to start and reversing them produces the path. These structures have different jobs: the 2D array describes the map, the queue/stack/heap controls search order, the typed arrays prevent repeated work and store costs, and the parent array turns the search result into a route. The website uses four-way moves with cost 1, so BFS, Dijkstra, and Manhattan A* have the stated optimal-route guarantees; DFS does not promise a shortest path.

- The displayed model is a **two-dimensional array** of cell objects. Each cell stores its row, column, wall state, visual states, and DOM element.
- Search algorithms use flattened integer cell indices internally. Typed arrays store seen/closed flags, distances, and parent indices; neighbour generation converts an index back to row and column.
- BFS uses an array as a queue with a moving head index.
- DFS uses an explicit stack and a per-cell direction cursor so it follows one branch and then backtracks.
- Dijkstra and A* use the `MinHeap` class implemented in `algorithms.js`.
- Parent indices are followed backward from the goal, then reversed to obtain the start-to-goal path.

The statistics have deliberate, fixed meanings:

- **Discovered:** unique cells first added to a search frontier / assigned a finite tentative cost. Includes the start cell.
- **Processed:** valid frontier removals that the algorithm accepts and processes. Includes the start and, if reached, the destination. Stale duplicate heap entries are not counted.
- **Explored shown:** processed cells that receive the blue explored animation. Start and destination keep their green/red endpoint colours, so they are excluded from this visual count.
- **Path nodes:** cells in the reconstructed route, including both endpoints. If start equals destination, this is 1.
- **Path moves:** path nodes minus one; this is the number of steps after the start. If start equals destination, this is 0.
- **Search time:** `performance.now()` around the selected algorithm call, including path reconstruction, but excluding DOM updates and animation. It is shown in milliseconds and will vary by browser/device.

## Testing

The project uses Node's built-in test runner, so the algorithm test suite has no third-party dependency. From the project folder:

```bash
node --test tests/algorithms.test.js
node --check algorithms.js
node --check script.js
```

The current executed result was **10 tests passed, 0 failed**. The tests check shortest paths, obstacle avoidance, unreachable goals, DFS's non-shortest guarantee, adjacent and identical endpoints, heap order, invalid input, and repeatability.

A browser smoke test was also run in Chromium during project creation. It checked the 600-cell grid; wall drawing by drag; Clear Path preserving walls; endpoint dragging; all four algorithms; pause/resume; reset cancelling a pending animation; random layout route preservation; an unreachable destination; a 390-pixel mobile viewport; a touch tap on a scrolled-into-view cell; opening `index.html` directly with a `file://` URL; and the browser console/page error list. These checks passed with no browser console/page errors. The demo image under `assets/` is a real capture of the running website, not a mockup. Browser automation tooling is not included as a website dependency.

Before a presentation, also try the manual checklist in **Testing checklist** below to verify the build in your own browser.

### Testing checklist

- [ ] Open the page and confirm there are 20 rows, 30 columns, one green S, and one red G.
- [ ] Click a cell to add a wall; drag across several cells; start on a wall to erase it.
- [ ] Confirm neither endpoint becomes a wall and move both endpoints by dragging.
- [ ] Run BFS, DFS, Dijkstra, and A* on an open grid and then around a wall barrier.
- [ ] Compare BFS, Dijkstra, and A* path moves on a unit-cost layout; they should be optimal. Do not expect DFS to be shortest.
- [ ] Build a wall barrier that separates the destination. The website should finish with **NO ROUTE** and no path.
- [ ] Pause, resume, then reset while a slow animation is in progress; no old colours should reappear afterward.
- [ ] Clear Path should keep walls; Reset Grid should clear them and return endpoints to their defaults.
- [ ] Generate random obstacles and run a search; the random layout should retain a route.
- [ ] Resize to a narrow window and confirm the page remains usable; the grid may scroll horizontally.
- [ ] Open the browser developer console and confirm there are no JavaScript errors.

## Limitations

- The grid uses four-directional moves only; diagonal movement is intentionally disabled.
- Every movement has cost 1. There is no weighted-terrain editor yet.
- DFS is not an optimal-route algorithm.
- The visualizer is a teaching tool, not a production navigation or robotics planner.
- The grid size is fixed at 20 × 30 in this version.
- Animation is intentionally slower than calculation so the search can be observed.

## Future enhancements

- Add weighted terrain and expose costs in the UI.
- Add correct eight-direction movement rules and diagonal costs.
- Add maze-generation choices, such as recursive division, with clear explanations.
- Let users resize the grid and save/load layouts.
- Add keyboard movement/editing, high-contrast themes, and more accessibility options.
- Compare measured node counts across algorithms on repeatable layouts.
- Add more algorithms such as Greedy Best-First Search or bidirectional BFS.

## Beginner starting points in the code

- Start with `makeGrid()` and `snapshotGrid()` in `script.js` to see how the UI model is represented and copied.
- Read `getNeighbors()` in `algorithms.js` to see the four legal moves.
- Follow `breadthFirstSearch()` before the heap algorithms; it is the shortest implementation to trace.
- Read `reconstructPath()` to see how parent indices become a path.
- Read `animateResult()` and `waitForAnimationDelay()` in `script.js` to understand progressive drawing and cancellation.
- The separate **CODE_WALKTHROUGH.md** explains these parts step by step.
