# Pathfinding Visualizer — Project Report

## 1. Title Page

**Project title:** Pathfinding Visualizer  
**Project domain:** Data Structures and Algorithms  
**Submitted by:** [Student Name]  
**Roll number:** [Roll Number]  
**Department:** [Department Name]  
**College:** [College Name]  
**Academic year:** [Academic Year]  
**Project guide:** [Project Guide Name]  
**Submission date:** [Date]

> Replace the bracketed fields with your own details before submitting.

---

## 2. Abstract

Pathfinding Visualizer is a browser-based educational project that demonstrates how four graph-search algorithms explore a grid and find a route around obstacles. The implemented algorithms are Breadth-First Search (BFS), Depth-First Search (DFS), Dijkstra's algorithm, and A* search. The grid is editable: a user can draw walls, move the start and destination, choose an algorithm, and watch explored cells and the final route appear in sequence.

The static website uses HTML5, CSS3, and vanilla JavaScript. The grid is represented by a two-dimensional array of cell objects, while the algorithms use a queue, an explicit stack, a binary min-heap, visited flags, distance values, and predecessor indices. The basic graph is four-directional and every move has cost 1. BFS, Dijkstra, and A* therefore return a minimum-move path under their stated conditions; DFS returns a valid route if it reaches the destination but does not promise the shortest one.

Automated algorithm tests and browser interaction checks were executed during development. The source, test suite, documentation, viva preparation, and an editable presentation are included with the project.

## 3. Introduction

Pathfinding is the task of finding a sequence of legal moves from one location to another. In a maze, obstacles restrict which moves are available. A grid is a useful way to represent this problem because every open cell can be treated as a graph vertex and every legal step to a neighbouring cell as an edge.

Pathfinding is a good DSA demonstration because multiple algorithms can solve the same problem while using different data structures and search orders. The result is not only a route: the order of exploration, the frontier, the predecessor links, and the algorithm's guarantee are all important concepts.

## 4. About the Project

The project presents a 20-row by 30-column grid in a modern web interface. A green cell is the start, a red cell is the destination, dark cells are walls, blue cells are processed/explored, and teal cells form the final route. Users select one of four independently implemented algorithms and control animation speed. A learning section below the grid introduces the data structures behind the search. The website also reports discovered cells, processed cells, displayed explored cells, path nodes, path moves, route status, and algorithm-only execution time.

The website runs locally in a modern browser and is not a native mobile or desktop app. It has no backend, database, external service, API key, framework, or runtime library dependency.

## 5. Problem Statement

A written list of coordinates can describe a route but does not show how a search algorithm reaches that result. Students need a way to observe how different strategies handle the same graph, how walls affect reachability, and why some algorithms guarantee a shortest path while others do not.

The project problem is to build an interactive visual tool that represents a maze as a graph, implements four classic search algorithms correctly, and progressively displays each algorithm's exploration and reconstructed route.

## 6. Need for the Project

- Search algorithms are easier to compare when their order of exploration is visible.
- A visual example makes queues, stacks, heaps, visited sets, distances, and parent links less abstract.
- Students can construct their own obstacle layouts and test edge cases.
- The same interface can support a classroom demonstration, individual practice, or viva explanation.
- The implementation demonstrates that an interactive website can keep its algorithm logic separate and testable.

## 7. Objectives

1. Model the grid as a graph with four-directional connections.
2. Implement BFS, DFS, Dijkstra, and A* as separate algorithms in JavaScript.
3. Use the appropriate data structure for each search strategy.
4. Reconstruct a route from parent/predecessor information.
5. Animate exploration and the final route without blocking the browser.
6. Provide correct status messages for found and unreachable destinations.
7. Allow wall editing, endpoint movement, random obstacles, clearing, and reset.
8. Report statistics with definitions that match the actual search implementation.
9. Keep the project local, dependency-free, responsive, and beginner-readable.

## 8. Scope

### Included

- Fixed grid size of 20 rows by 30 columns.
- Four-directional movement: up, right, down, and left.
- One start cell, one destination cell, and user-drawn walls.
- Four independent search algorithms and parent-based path reconstruction.
- Progressive exploration/path animation, adjustable speed, Pause/Resume, and cancellation.
- Random obstacles with a reachability check and a corridor carve if necessary.
- Local browser execution and automated algorithm tests.

### Not included in this version

- Weighted terrain, diagonal movement, multi-agent planning, network routing, or a live map service.
- User accounts, cloud storage, a backend, or a database.
- A resizable grid or production performance benchmarking.

## 9. Existing Approach and Limitations

An introductory explanation may show a maze drawing and a final route, or describe queue/stack operations in text. Those approaches can explain the result but may not make each processed cell and the search order clear. A static diagram also cannot easily demonstrate how changing the wall layout changes reachability.

This project addresses that teaching gap with a live grid and animation. Its own limitations are deliberate: the graph is small and unweighted, movement is only four-directional, the grid dimensions are fixed, and the website is a teaching tool rather than a production navigation system.

## 10. Proposed System

The proposed system has a browser interface and a separate algorithm module. The UI owns the editable grid and creates an immutable-in-practice search snapshot for each run. The selected algorithm operates on that snapshot and returns an exploration order, a path, and counts. The UI then animates those returned indices. The algorithm does not modify the displayed cells, and the animation does not change the algorithm's answer.

Random obstacle generation first checks reachability with BFS. If random walls disconnect the endpoints, it clears an L-shaped corridor from start to destination. Hand-drawn walls are allowed to make a route impossible; in that case the visualizer reports that no route exists.

## 11. Functional and Non-Functional Requirements

### Functional requirements

- Create a 20 × 30 grid on page load.
- Add and erase walls by clicking or dragging; never turn an endpoint into a wall.
- Move start/destination by dragging while preventing overlap and wall placement.
- Select and run any of the four algorithms.
- Animate explored nodes, then animate the reconstructed path.
- Show a no-route result when the destination cannot be reached.
- Pause/resume an animation; safely cancel when clearing, randomizing, or resetting.
- Clear search/path markings without removing walls; reset all grid state.
- Generate random obstacles while keeping at least one route open.
- Display the selected algorithm and defined search statistics.

### Non-functional requirements

- Run in a modern browser without a build step or network access.
- Keep HTML, CSS, algorithm logic, UI logic, and documentation separate.
- Avoid external runtime dependencies and paid services.
- Keep the interface responsive, readable, and usable with mouse or touch taps.
- Ensure animation uses asynchronous timers and stale work cannot repaint a newer grid.

## 12. Hardware and Software Requirements

### Hardware

Any computer or mobile device capable of running a modern browser is sufficient. No dedicated graphics hardware or server is required.

### Software

- A modern browser such as Chrome/Chromium, Firefox, Edge, or Safari.
- The website itself needs only the browser.
- Optional for automated tests: Node.js with the built-in `node:test` runner.
- Optional for serving the files locally: Python 3 or any static file server.

## 13. System Architecture

```text
┌─────────────┐     ┌────────────────────────┐     ┌──────────────────────┐
│    User     │ ──▶ │ index.html + style.css │ ──▶ │      script.js       │
│ controls &  │     │ controls / grid view   │     │ grid state, events,  │
│ grid edits  │     └────────────────────────┘     │ snapshot, animation  │
└─────────────┘                                    └──────────┬───────────┘
                                                             │ stable problem
                                                             ▼
                                                   ┌──────────────────────┐
                                                   │    algorithms.js     │
                                                   │ BFS / DFS / Dijkstra │
                                                   │        / A*          │
                                                   └──────────┬───────────┘
                                                              │ order + parent-derived path
                                                              ▼
                                                   ┌──────────────────────┐
                                                   │ progressive display  │
                                                   │ results + statistics│
                                                   └──────────────────────┘
```

`algorithms.js` is independent of the DOM and is also imported by the Node.js tests. `script.js` owns browser state and animation. `index.html` loads `algorithms.js` before `script.js`.

## 14. Methodology

1. Create the grid as a two-dimensional array of cell objects.
2. Store start and destination coordinates separately and represent walls on the grid cells.
3. On a search request, copy wall states and endpoint coordinates into a stable snapshot.
4. Call exactly the selected algorithm with the snapshot.
5. Record each valid processed cell and the predecessor used to reach it.
6. If the goal is reached, follow parent links from goal to start and reverse the list.
7. Measure the algorithm call, excluding visual rendering and animation.
8. Animate the processed order, then the path; keep endpoints visually green/red.
9. Present route status and statistics.
10. On cancellation, increment a run token, clear the active timer, and make the old async continuation exit before it can update the grid.

## 15. Algorithms and Pseudocode

### 15.1 Breadth-First Search

BFS uses a FIFO queue. A cell is marked seen when added to the queue so it cannot be added a second time. The queue is processed from the front, which visits nodes in nondecreasing number of moves.

```text
BFS(start, goal):
    queue = [start]
    seen[start] = true
    parent[start] = none
    while queue is not empty:
        current = remove front of queue
        record current as processed
        if current == goal: stop
        for each open neighbour of current:
            if neighbour is not seen:
                seen[neighbour] = true
                parent[neighbour] = current
                add neighbour to back of queue
    reconstruct from parent if goal was reached
```

### 15.2 Depth-First Search

DFS follows one branch and backtracks when it has no unvisited neighbour. This implementation uses an explicit stack and a cursor recording which neighbour to try next. This is iterative DFS, not recursion.

```text
DFS(start, goal):
    stack = [start]
    seen[start] = true
    while stack is not empty:
        current = top of stack
        if current has not been processed:
            record current as processed
            if current == goal: stop
        if current has another open, unseen neighbour:
            mark neighbour seen
            parent[neighbour] = current
            push neighbour
        otherwise:
            pop current
    reconstruct from parent if goal was reached
```

DFS can produce a longer route than BFS. It is not described as shortest-path search.

### 15.3 Dijkstra's Algorithm

Dijkstra uses a min-heap ordered by tentative distance `g`. Every movement currently costs 1. When a better cost is found, a new heap entry is pushed; old entries are ignored when popped if they no longer match the best distance.

```text
Dijkstra(start, goal):
    distance[start] = 0; all other distances = infinity
    push (start, priority 0) into min-heap
    while heap is not empty:
        remove entry with smallest distance
        ignore it if it is stale or already settled
        settle and record the current node
        if current == goal: stop
        for each open neighbour:
            candidate = distance[current] + movementCost
            if candidate < distance[neighbour]:
                distance[neighbour] = candidate
                parent[neighbour] = current
                push neighbour with candidate priority
    reconstruct from parent if goal was reached
```

### 15.4 A* Search

A* also uses a min-heap but orders a cell by `f(n) = g(n) + h(n)`. `g(n)` is the cost so far and `h(n)` estimates the remaining cost. Here `h` is Manhattan distance, the sum of row and column differences. With four-way moves of cost 1, it is admissible and consistent.

```text
A*(start, goal):
    gScore[start] = 0; other gScores = infinity
    push start with priority h(start, goal)
    while heap is not empty:
        remove entry with smallest f = g + h
        ignore stale/already-closed entries
        close and record the current node
        if current == goal: stop
        for each open neighbour:
            candidateG = gScore[current] + 1
            if candidateG < gScore[neighbour]:
                gScore[neighbour] = candidateG
                parent[neighbour] = current
                push with priority candidateG + Manhattan(neighbour, goal)
    reconstruct from parent if goal was reached
```

### Path reconstruction

For example, if `parent[goal] = C`, `parent[C] = B`, and `parent[B] = start`, walking backward produces `[goal, C, B, start]`. Reversing it gives `[start, B, C, goal]`. If no parent chain reaches the start, the path is empty.

## 16. Data Structures Used

- **Two-dimensional array of cell objects:** stores row/column, wall, visual state, and DOM element.
- **Queue:** BFS frontier; implemented as an array with a head index to avoid removing from the front repeatedly.
- **Stack:** DFS branch and backtracking; an array whose last element is the top.
- **Binary min-heap:** selects the smallest priority for Dijkstra and A*. It is implemented in `algorithms.js`; it is not a library.
- **Typed arrays:** compact `seen`, `closed`, `distance`, `gScore`, and `parent` storage after grid cells are flattened to integer indices.
- **Parent/predecessor array:** records the previous cell on the current best route to each reached cell.
- **Neighbour list:** generated from up, right, down, and left, excluding boundaries and walls.
- **Run token and timer state:** control asynchronous rendering and make cancellation safe.

## 17. Complexity Analysis

Let `V` be the number of open cells and `E` the number of legal neighbour connections. For a fixed-degree grid, `E = O(V)`.

| Algorithm | Time bound used in this implementation | Space bound | Shortest/minimum-cost condition |
|---|---|---|---|
| BFS | `O(V + E)` | `O(V)` | Equal edge costs; every current edge cost is 1. |
| DFS | `O(V + E)` | `O(V)` | No shortest-path guarantee. |
| Dijkstra | `O((V + E) log E)` with lazy duplicate heap entries | `O(V + E)` | Non-negative edge costs; current costs are all 1. |
| A* | Worst case `O((V + E) log E)` with lazy duplicate heap entries | `O(V + E)` | Admissible heuristic; current Manhattan heuristic is consistent for four-way unit-cost movement. |

For this fixed-degree grid, the heap bounds simplify to approximately `O(V log V)` time and `O(V)` space. A* often explores fewer nodes in a goal-directed layout, but it is not guaranteed to do so on every map.

## 18. Implementation Details

- `index.html` declares the controls, results, legend, and grid container. It loads `algorithms.js` before `script.js`.
- `style.css` styles the panels and state colours and uses responsive breakpoints. It uses system fonts and local CSS/SVG rather than remote assets.
- `algorithms.js` validates a search snapshot, generates neighbours, implements a binary min-heap, runs each algorithm, and reconstructs paths. It has no DOM dependency.
- `script.js` builds the grid, handles pointer events, takes a snapshot, times and calls the algorithm, updates result cards, and animates asynchronously.
- The website keeps the algorithm result separate from animation. The algorithm calculates the complete order and path before the UI paints them.
- A running animation can be cancelled by Clear Path, Reset Grid, or Random Obstacles. Timer cleanup and a run token prevent old results from repainting a newer layout.
- The default start coordinate is zero-based `(10, 5)` and the destination is `(10, 24)`. The UI labels are displayed using one-based row and column numbers.

### Statistics definitions

- **Discovered:** number of unique cells admitted to the frontier / assigned a finite tentative distance, including start.
- **Processed:** valid frontier removals accepted by the algorithm, including start and reached goal; stale heap entries do not count.
- **Explored shown:** processed non-endpoint cells that receive the blue visited animation. Start and goal keep their endpoint colours.
- **Path nodes:** number of path cells including both endpoints.
- **Path moves:** `path nodes - 1`.
- **Search time:** elapsed `performance.now()` time for the algorithm function and its path reconstruction, excluding rendering and animation. It is not a benchmark of full user-perceived runtime.

## 19. Test Cases and Actual Results

The Node.js test command `node --test tests/algorithms.test.js` was executed: **10 tests passed and 0 failed**. `node --check algorithms.js` and `node --check script.js` also completed successfully.

| Test | Check | Actual result |
|---|---|---|
| A01 | BFS, Dijkstra, and A* on a clear grid | PASS — each returned the 7-move shortest route. |
| A02 | Barrier requiring a detour | PASS — BFS, Dijkstra, and A* returned valid routes with 8 moves. |
| A03 | DFS on an open grid | PASS — route was valid and longer than BFS on the fixed test layout. |
| A04 | Destination isolated by walls | PASS — all four reported no path. |
| A05 | Start equals destination | PASS — all returned one path node and zero moves. |
| A06 | Adjacent endpoints | PASS — BFS, Dijkstra, A* returned one move; DFS returned a valid route without a shortest-path promise. |
| A07 | Additional deterministic obstacle layouts | PASS — BFS, Dijkstra, A* agreed on reachability and path length. |
| A08 | Min-heap ordering | PASS — popped priorities were in ascending order. |
| A09 | Invalid endpoint and wall-matrix shape | PASS — clear errors were thrown. |
| A10 | Repeated run on the same snapshot | PASS — exploration order and path were repeatable. |
| B01 | Browser grid, wall drag/erase, Clear Path preservation | PASS — 600 cells rendered; wall editing worked; Clear Path retained walls. |
| B02 | Endpoint movement and four algorithms | PASS — endpoint drag worked; BFS, DFS, Dijkstra, and A* all completed a route on the browser layout. |
| B03 | Pause/resume and Reset during animation | PASS — pause/resume worked; reset left no stale explored/path cells. |
| B04 | Random obstacles and route | PASS — generated layout retained a route and A* completed. |
| B05 | Unreachable browser layout | PASS — destination surrounded by walls produced NO ROUTE; 595 reachable/open cells were processed in that layout. |
| B06 | 390-pixel mobile viewport | PASS — document width remained 390 pixels; the grid was contained in a horizontal scroller. |
| B07 | Touch tap on a visible mobile cell | PASS — pointer events added a wall after scrolling the cell into view. |
| B08 | Browser console/page errors | PASS — none were recorded during the smoke checks. |
| B09 | Open `index.html` directly using `file://` | PASS — 600 cells loaded with no page errors. |

The browser smoke checks were run with Chromium during development. The browser automation tool is not required by or included as a website dependency. The image `assets/visualizer-demo.png` is a real screenshot from a completed A* run on the implemented website. The current captured run displayed 122 discovered, 86 processed, 84 explored-shown, 28 path nodes, and 27 moves; the measured 1.30 ms is a single-run observation, not a performance guarantee.

## 20. Applications and Usages

- Teaching and learning introductory graph traversal.
- Demonstrating how a queue, stack, or priority queue changes search order.
- Comparing shortest-path guarantees on a common map.
- Classroom exercises about reachable/unreachable states and parent reconstruction.
- Illustrating basic route planning concepts used in games, robotics, and navigation (the project is educational and is not itself a production planner).

## 21. Limitations

- Uniform movement cost only; there is no weighted-terrain editor.
- Four-directional movement only; diagonal moves and corner-cutting rules are not implemented.
- Fixed 20 × 30 dimensions.
- DFS does not guarantee a shortest path.
- The random obstacle layout deliberately keeps a route open, so it does not generate an unreachable maze.
- Search time excludes rendering and animation and varies by device/browser.
- No persistence, map import, backend, or multi-agent support.

## 22. Future Scope

- Add non-negative weighted cells and use the same costs in Dijkstra and A*.
- Scale the A* heuristic appropriately if movement costs or diagonal movement are added.
- Add a correct eight-neighbour movement mode and configurable diagonal rules.
- Add maze-generation algorithms and explain their data structures.
- Allow resizing, exporting, and importing grid layouts.
- Add keyboard-accessible endpoint movement and wall editing.
- Add repeatable algorithm comparisons and carefully defined benchmarks.
- Add bidirectional BFS or Greedy Best-First Search as additional comparisons.

## 23. Conclusion

The Pathfinding Visualizer turns a grid into an observable graph-search problem. It implements four distinct strategies using the data structures associated with them, reconstructs paths from predecessor links, and separates algorithm calculation from asynchronous display. Automated tests confirmed the algorithm edge cases and shortest-path conditions, while browser checks confirmed the main editing, animation, cancellation, and responsive behaviours. The result is a complete, local-first project that can be demonstrated and explained as a DSA assignment.

## 24. References

1. Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, and Clifford Stein, *Introduction to Algorithms*, 4th edition, MIT Press, 2022.
2. MDN Web Docs, *JavaScript Guide*, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide
3. MDN Web Docs, *Document Object Model (DOM)*, https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model
4. WHATWG, *HTML Living Standard*, https://html.spec.whatwg.org/
5. MDN Web Docs, *CSS*, https://developer.mozilla.org/en-US/docs/Web/CSS
