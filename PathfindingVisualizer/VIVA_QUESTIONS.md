# Viva Questions and Simple Answers

Use these as practice answers, not as a script to memorize word for word. Be ready to point to the matching code in `algorithms.js` and `script.js`.

## Core concepts

### 1. What is pathfinding?
Pathfinding is finding a sequence of legal moves from a starting location to a destination. In this project, the route must use open cells and cannot pass through walls.

### 2. Why is this a Data Structures and Algorithms project?
The website compares four graph-search algorithms and demonstrates their data structures: a queue, a stack, and a min-heap. It also uses visited tracking, cost arrays, predecessor links, and path reconstruction.

### 3. What is a graph?
A graph is a collection of vertices connected by edges. Here, open grid cells are vertices, and legal moves between neighbouring open cells are edges.

### 4. What are vertices and edges in this project?
Each open cell is a vertex. An edge joins two cells that are next to each other vertically or horizontally and are not separated by a wall.

### 5. What is a two-dimensional array?
It is an array containing rows, where each row is another array. The UI stores cells as `grid[row][column]`, which makes the map easy to display and edit.

### 6. How many directions can the algorithms move?
Four: up, right, down, and left. Diagonal movement is disabled, so a route cannot cut across corners.

### 7. What is a neighbour?
A neighbour is a cell that can be reached from the current cell in one legal move. `getNeighbors()` checks the four directions, grid boundaries, and walls.

### 8. What is path reconstruction?
Each reached cell stores the previous cell that led to its current route. Starting at the destination, the program follows these parent links backward to the start and reverses the list.

### 9. What does a parent/predecessor link store?
It stores the index of the previous cell on the route currently recorded for that cell. The start has no parent, represented by `-1`.

### 10. What happens if there is no possible route?
The algorithm exhausts its reachable frontier without processing the destination. It returns `found: false` and an empty path. The UI finishes the exploration animation and reports **NO ROUTE**.

## Algorithms and data structures

### 11. What is BFS?
Breadth-First Search explores cells in layers: first cells one move away, then two moves away, and so on. This project uses a queue.

### 12. What is a queue?
A queue follows FIFO: first in, first out. BFS adds newly discovered cells at the back and processes cells from the front.

### 13. Why does BFS find a shortest path here?
Every legal move costs 1, so the first time BFS reaches the destination it has taken the fewest possible moves. BFS is not generally a minimum-cost algorithm when edge weights differ.

### 14. What is DFS?
Depth-First Search follows one branch as far as it can, then backtracks to try another branch. The project uses an explicit stack and a neighbour cursor.

### 15. What is a stack?
A stack follows LIFO: last in, first out. DFS pushes the next cell in its current branch and returns to earlier cells when the branch ends.

### 16. Why does DFS not guarantee a shortest path?
DFS is organized around depth, not distance from the start. It can reach the destination by a long branch before examining a shorter route. Its returned path is valid, but may not be shortest.

### 17. What is Dijkstra's algorithm?
Dijkstra repeatedly processes the unprocessed cell with the lowest known cost from the start. It is suitable for graphs with non-negative edge costs.

### 18. What is a priority queue?
A priority queue removes the item with the best priority, rather than the oldest item. Dijkstra prioritizes the smallest known distance; A* prioritizes the smallest `f` score.

### 19. What is a min-heap?
A min-heap is a tree-like array structure where the smallest priority is kept at the top. The project implements `MinHeap` directly in `algorithms.js`.

### 20. Does this project use an external heap or pathfinding library?
No. The queue, stack-based DFS, min-heap, neighbour generation, and all four algorithms are implemented in the project source.

### 21. What is A* search?
A* selects the next candidate using `f(n) = g(n) + h(n)`. `g(n)` is the known cost from the start and `h(n)` estimates the remaining cost to the goal.

### 22. What is a heuristic?
A heuristic is an estimate of the remaining cost from a candidate node to the goal. A* uses it to guide the search toward the destination.

### 23. What is Manhattan distance?
It is the absolute row difference plus the absolute column difference: `|row - goalRow| + |column - goalColumn|`. It matches four-directional movement when each move costs 1.

### 24. Why is the Manhattan heuristic suitable here?
It never overestimates the number of four-way unit-cost moves remaining, and it is consistent for this grid. Therefore A* still finds an optimal route under the project's rules.

### 25. Which algorithms guarantee a shortest route in this project?
BFS guarantees the fewest moves because every edge has equal cost. Dijkstra guarantees minimum cost for non-negative costs. A* is optimal here because the Manhattan heuristic is admissible and consistent. DFS makes no shortest-path promise.

### 26. What is the difference between BFS and Dijkstra?
BFS uses a FIFO queue and is enough when all edges have the same cost. Dijkstra uses a min-priority queue and considers cumulative path cost, so it handles different non-negative edge costs.

### 27. Why is A* often more goal-directed than Dijkstra?
A* adds a heuristic estimate of distance to the goal, so it often prioritizes cells that appear closer to the destination. It may explore fewer cells on some layouts, but not every layout.

### 28. Is weighted terrain implemented now?
No. Every legal move currently costs 1. Dijkstra and A* have a clearly marked movement-cost function where terrain costs can be added later, but the UI does not contain weighted cells.

## Complexity and results

### 29. What is the time complexity of BFS and DFS?
Both are `O(V + E)`, because each reachable vertex and edge is examined a bounded number of times. The grid has a fixed number of neighbours per cell.

### 30. What is the time complexity of Dijkstra in this implementation?
With a binary min-heap and lazy duplicate entries, the documented bound is `O((V + E) log E)`. For a fixed-degree grid where `E = O(V)`, this is often simplified to `O(V log V)`.

### 31. What is the time complexity of A*?
Its worst-case bound here is also `O((V + E) log E)` with lazy duplicate heap entries. The actual number of processed cells depends on the layout and heuristic.

### 32. What is the space complexity?
BFS and DFS use `O(V)` extra space. Dijkstra/A* use `O(V + E)` with lazy duplicate heap entries; on this fixed-degree grid that simplifies to `O(V)`.

### 33. What is the difference between discovered and processed nodes in the result panel?
Discovered means a unique cell was first added to the frontier or given a finite tentative cost. Processed means a valid frontier removal was accepted by the algorithm. The start is included in both; a reached destination is processed.

### 34. Why can “Explored shown” be smaller than “Processed”?
The green start and red destination keep their own colours rather than being painted blue. “Explored shown” counts only processed non-endpoint cells that receive the blue exploration colour.

### 35. What does “Path nodes” count?
It counts the cells in the route, including start and destination. “Path moves” is one less because the start cell is not a move.

### 36. What does the displayed search time measure?
It measures the algorithm call and path reconstruction using `performance.now()`. It excludes the later DOM updates and animation, and it varies by device and browser.

## Scenario questions and dry runs

### 37. Scenario: the start and destination are adjacent. What should happen?
BFS, Dijkstra, and A* return a one-move route. DFS returns a valid route but is not required to choose that direct route first. If the endpoints are identical, every algorithm returns one path node and zero moves.

### 38. Scenario: walls surround the destination. What should happen?
The destination is still a valid open cell, but none of its four neighbours can reach it. The frontier eventually empties, the path is empty, and the UI reports **NO ROUTE**.

### 39. Can the user make the destination itself a wall?
No. Pointer interaction ignores the start and destination cells, and endpoint dragging rejects wall cells. The algorithm module also validates that endpoints are not walls.

### 40. Dry run: BFS on a 2 × 3 open grid from `(0,0)` to `(1,2)`. What is one shortest route?
One route is `(0,0) → (0,1) → (0,2) → (1,2)`, which has three moves. The exact parent route depends on neighbour order, but BFS still returns a three-move shortest route.

### 41. Dry run: for A*, a cell has `g = 3` and Manhattan `h = 4`. What is its `f` score?
`f = g + h = 3 + 4 = 7`. A* uses this value as the heap priority.

### 42. Scenario: a heap contains an old entry for a node after its distance improved. How does the code handle it?
The improved cost is pushed as a new entry. When an outdated entry is later removed, Dijkstra compares it with the current distance and ignores it. A* uses the same idea with the stored `g` score and closed state.

### 43. What happens when the user presses Reset during animation?
The website increments a run token, clears the pending timeout, resets the model and endpoints, and redraws. The old asynchronous animation sees that its token is no longer current and exits without repainting the new grid.

### 44. What does Random Obstacles do if its walls disconnect the endpoints?
It checks reachability with BFS. If no route exists, it opens an L-shaped corridor between start and destination, then renders the new layout.

## Project and personal contribution

### 45. What are the main limitations of this project?
The grid is fixed at 20 × 30, movement is four-directional, every step costs 1, weighted terrain is not exposed, and DFS is not guaranteed to be shortest. It is a teaching tool, not a production route planner.

### 46. What future improvements could be added?
Weighted terrain, correctly costed diagonal moves, grid resizing, maze generators, keyboard accessibility, layout save/load, and carefully controlled performance comparisons are possible extensions.

### 47. What was implemented personally in the project?
**Use an honest, editable answer that matches your work:** “I implemented and studied the grid state and UI in `script.js`, the independent search algorithms and min-heap in `algorithms.js`, and the tests/documentation. I can explain how the frontier, parent links, and animation work.” If you personally changed or completed different parts, replace this sentence with exactly what you did and be prepared to explain those parts.

### 48. Why is animation separate from the algorithm result?
The algorithm calculates its exploration order and path first. The UI then paints those results asynchronously. This prevents display timing from changing the algorithm's answer and makes cancellation easier to reason about.
