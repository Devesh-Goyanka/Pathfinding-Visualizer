/* Browser interface, grid interactions, and cancellable search animation. */
(() => {
  "use strict";

  const Algorithms = window.PathfindingAlgorithms;
  if (!Algorithms) {
    throw new Error("Pathfinding algorithms did not load. Check that algorithms.js comes before script.js.");
  }

  const ROWS = 20;
  const COLS = 30;
  const DEFAULT_START = { row: 10, col: 5 };
  const DEFAULT_GOAL = { row: 10, col: 24 };

  const elements = {
    algorithmSelect: document.getElementById("algorithmSelect"),
    algorithmDescription: document.getElementById("algorithmDescription"),
    algorithmGuarantee: document.getElementById("algorithmGuarantee"),
    algorithmComplexity: document.getElementById("algorithmComplexity"),
    visualizeButton: document.getElementById("visualizeButton"),
    pauseButton: document.getElementById("pauseButton"),
    clearPathButton: document.getElementById("clearPathButton"),
    randomButton: document.getElementById("randomButton"),
    resetButton: document.getElementById("resetButton"),
    speedRange: document.getElementById("speedRange"),
    speedValue: document.getElementById("speedValue"),
    grid: document.getElementById("grid"),
    gridShell: document.getElementById("gridShell"),
    gridSizeBadge: document.getElementById("gridSizeBadge"),
    routeBadge: document.getElementById("routeBadge"),
    statusMessage: document.getElementById("statusMessage"),
    progressBar: document.getElementById("progressBar"),
    statsAlgorithm: document.getElementById("statsAlgorithm"),
    statDiscovered: document.getElementById("statDiscovered"),
    statProcessed: document.getElementById("statProcessed"),
    statShown: document.getElementById("statShown"),
    statPathNodes: document.getElementById("statPathNodes"),
    statMoves: document.getElementById("statMoves"),
    statTime: document.getElementById("statTime")
  };

  const algorithmDetails = {
    bfs: {
      name: "Breadth-First Search (BFS)",
      description: "Explores the grid one step layer at a time with a first-in, first-out queue. Finds a shortest route when every move has equal cost.",
      guarantee: "Shortest route: yes",
      complexity: "O(V + E)"
    },
    dfs: {
      name: "Depth-First Search (DFS)",
      description: "Follows one branch as far as possible with a stack, then backtracks. It can find a route, but that route is not guaranteed to be shortest.",
      guarantee: "Shortest route: no",
      complexity: "O(V + E)"
    },
    dijkstra: {
      name: "Dijkstra's Algorithm",
      description: "Uses a min-heap to process the lowest known path cost first. With non-negative costs it finds the minimum-cost route; this grid assigns cost 1 per move.",
      guarantee: "Minimum cost: yes",
      complexity: "O((V + E) log E)"
    },
    astar: {
      name: "A* Search",
      description: "Ranks each candidate by f(n) = g(n) + h(n). Manhattan distance guides the search toward the goal; with these uniform four-way moves, its route is optimal.",
      guarantee: "Optimal for this grid",
      complexity: "O((V + E) log E)"
    }
  };

  let grid = [];
  let start = { ...DEFAULT_START };
  let goal = { ...DEFAULT_GOAL };
  let pointerState = { down: false, mode: null, didEdit: false, lastEdit: "" };
  let hasPresentation = false;
  let isRunning = false;
  let isPaused = false;
  let runToken = 0;
  let activeDelay = null;
  let lastResult = null;

  function makeGrid() {
    return Array.from({ length: ROWS }, (_, row) =>
      Array.from({ length: COLS }, (_, col) => ({
        row,
        col,
        isWall: false,
        isVisited: false,
        isPath: false,
        element: null
      }))
    );
  }

  function isStart(row, col) {
    return start.row === row && start.col === col;
  }

  function isGoal(row, col) {
    return goal.row === row && goal.col === col;
  }

  function updateCellView(cell) {
    const node = cell.element;
    if (!node) return;

    node.classList.toggle("is-wall", cell.isWall);
    node.classList.toggle("is-visited", cell.isVisited);
    node.classList.toggle("is-path", cell.isPath);
    node.classList.toggle("is-start", isStart(cell.row, cell.col));
    node.classList.toggle("is-goal", isGoal(cell.row, cell.col));

    let description = `Row ${cell.row + 1}, column ${cell.col + 1}`;
    if (isStart(cell.row, cell.col)) description = `Start, ${description}`;
    else if (isGoal(cell.row, cell.col)) description = `Destination, ${description}`;
    else if (cell.isWall) description = `Wall, ${description}`;
    else if (cell.isPath) description = `Final path, ${description}`;
    else if (cell.isVisited) description = `Explored, ${description}`;
    else description = `Open cell, ${description}`;
    node.setAttribute("aria-label", description);
  }

  function buildGridView() {
    const fragment = document.createDocumentFragment();
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        const cell = grid[row][col];
        const node = document.createElement("div");
        node.className = "cell";
        node.setAttribute("role", "gridcell");
        node.setAttribute("aria-rowindex", String(row + 1));
        node.setAttribute("aria-colindex", String(col + 1));
        node.dataset.row = String(row);
        node.dataset.col = String(col);
        cell.element = node;
        updateCellView(cell);
        fragment.appendChild(node);
      }
    }
    elements.grid.replaceChildren(fragment);
    elements.grid.setAttribute("aria-rowcount", String(ROWS));
    elements.grid.setAttribute("aria-colcount", String(COLS));
    elements.gridSizeBadge.textContent = `${ROWS} × ${COLS}`;
  }

  function renderAllCells() {
    for (const row of grid) {
      for (const cell of row) updateCellView(cell);
    }
  }

  function setBadge(state, label) {
    elements.routeBadge.dataset.state = state;
    elements.routeBadge.textContent = label;
  }

  function setStatus(message) {
    elements.statusMessage.textContent = message;
  }

  function setProgress(percent) {
    const clamped = Math.max(0, Math.min(100, percent));
    elements.progressBar.style.width = `${clamped}%`;
  }

  function selectedAlgorithm() {
    return elements.algorithmSelect.value;
  }

  function updateAlgorithmInfo() {
    const details = algorithmDetails[selectedAlgorithm()];
    if (!details) return;
    elements.algorithmDescription.textContent = details.description;
    elements.algorithmGuarantee.textContent = details.guarantee;
    elements.algorithmComplexity.textContent = details.complexity;
    elements.statsAlgorithm.textContent = `Selected: ${details.name}`;
  }

  function resetStatistics() {
    elements.statDiscovered.textContent = "—";
    elements.statProcessed.textContent = "—";
    elements.statShown.textContent = "—";
    elements.statPathNodes.textContent = "—";
    elements.statMoves.textContent = "—";
    elements.statTime.textContent = "—";
    updateAlgorithmInfo();
  }

  function clearSearchPresentation() {
    for (const row of grid) {
      for (const cell of row) {
        cell.isVisited = false;
        cell.isPath = false;
        updateCellView(cell);
      }
    }
    hasPresentation = false;
    lastResult = null;
    setProgress(0);
    resetStatistics();
    setBadge("idle", "READY");
  }

  function snapshotGrid() {
    return {
      rows: ROWS,
      cols: COLS,
      walls: grid.map((row) => row.map((cell) => cell.isWall)),
      start: { ...start },
      goal: { ...goal }
    };
  }

  function positionFromCellElement(target) {
    const node = target.closest(".cell");
    if (!node || !elements.grid.contains(node)) return null;
    const row = Number(node.dataset.row);
    const col = Number(node.dataset.col);
    if (!Number.isInteger(row) || !Number.isInteger(col)) return null;
    return { row, col };
  }

  function clearPendingDelay() {
    if (!activeDelay) return;
    const delay = activeDelay;
    activeDelay = null;
    if (delay.id !== null) window.clearTimeout(delay.id);
    delay.resolve(false);
  }

  function finishDelay(delay, completed) {
    if (activeDelay !== delay) return;
    activeDelay = null;
    if (delay.id !== null) window.clearTimeout(delay.id);
    delay.resolve(Boolean(completed) && delay.token === runToken);
  }

  function scheduleDelay(delay) {
    if (activeDelay !== delay) return;
    if (delay.token !== runToken) {
      finishDelay(delay, false);
      return;
    }
    if (isPaused) return;

    delay.startedAt = performance.now();
    delay.id = window.setTimeout(() => {
      delay.id = null;
      delay.remaining = 0;
      finishDelay(delay, true);
    }, delay.remaining);
  }

  function waitForAnimationDelay(milliseconds, token) {
    return new Promise((resolve) => {
      const delay = {
        id: null,
        startedAt: null,
        remaining: milliseconds,
        token,
        resolve
      };
      activeDelay = delay;
      scheduleDelay(delay);
    });
  }

  function cancelAnimation() {
    // Invalidating the token makes every old async continuation harmless.
    runToken += 1;
    isRunning = false;
    isPaused = false;
    clearPendingDelay();
    updateRunControls();
  }

  function updateRunControls() {
    elements.visualizeButton.disabled = isRunning;
    elements.algorithmSelect.disabled = isRunning;
    elements.pauseButton.disabled = !isRunning;
    elements.grid.classList.toggle("is-locked", isRunning);

    const label = elements.pauseButton.querySelector("span:last-child");
    const symbol = elements.pauseButton.querySelector(".button-symbol");
    if (isPaused) {
      label.textContent = "Resume animation";
      symbol.textContent = "▶";
    } else {
      label.textContent = "Pause animation";
      symbol.textContent = "Ⅱ";
    }
  }

  function animationDelay() {
    const speed = Number(elements.speedRange.value);
    return Math.max(15, Math.round(135 - speed * 1.2));
  }

  function updateSearchStatistics(result, elapsedMilliseconds) {
    elements.statDiscovered.textContent = String(result.discovered);
    elements.statProcessed.textContent = String(result.processed);
    elements.statShown.textContent = "0";
    elements.statPathNodes.textContent = String(result.pathNodeCount);
    elements.statMoves.textContent = String(result.moves);
    elements.statTime.textContent = elapsedMilliseconds.toFixed(2);
    elements.statsAlgorithm.textContent = `Selected: ${algorithmDetails[result.algorithm].name}`;
  }

  function setShownCount(count) {
    elements.statShown.textContent = String(count);
  }

  async function animateResult(result, token) {
    let shownCount = 0;
    const orderLength = Math.max(result.explorationOrder.length, 1);

    for (let index = 0; index < result.explorationOrder.length; index += 1) {
      if (token !== runToken) return;
      const cellIndex = result.explorationOrder[index];
      const row = Math.floor(cellIndex / COLS);
      const col = cellIndex % COLS;
      const cell = grid[row][col];

      // Endpoints retain their own colours; they are still counted as processed.
      if (!isStart(row, col) && !isGoal(row, col)) {
        cell.isVisited = true;
        updateCellView(cell);
        shownCount += 1;
        setShownCount(shownCount);
      }

      const explorationProgress = ((index + 1) / orderLength) * (result.found ? 80 : 100);
      setProgress(explorationProgress);
      setBadge("running", "SEARCHING");
      setStatus(`Exploring nodes: ${index + 1} of ${result.processed} processed.`);

      if (!isStart(row, col) && !isGoal(row, col)) {
        const completed = await waitForAnimationDelay(animationDelay(), token);
        if (!completed) return;
      }
    }

    if (token !== runToken) return;

    if (!result.found) {
      setProgress(100);
      setBadge("missing", "NO ROUTE");
      setStatus("No route exists. Remove some walls or create a different layout, then try again.");
      return;
    }

    if (result.path.length === 1) {
      setProgress(100);
      setBadge("found", "FOUND");
      setStatus("Start and destination are the same cell. No moves are needed.");
      return;
    }

    let pathCellsShown = 0;
    const pathCellCount = result.path.filter((cellIndex) => {
      const row = Math.floor(cellIndex / COLS);
      const col = cellIndex % COLS;
      return !isStart(row, col) && !isGoal(row, col);
    }).length;

    for (let index = 0; index < result.path.length; index += 1) {
      if (token !== runToken) return;
      const cellIndex = result.path[index];
      const row = Math.floor(cellIndex / COLS);
      const col = cellIndex % COLS;
      const cell = grid[row][col];

      if (!isStart(row, col) && !isGoal(row, col)) {
        cell.isPath = true;
        updateCellView(cell);
        pathCellsShown += 1;
      }
      const pathProgress = 80 + ((index + 1) / result.path.length) * 20;
      setProgress(pathProgress);
      setStatus(`Drawing final path: ${Math.min(pathCellsShown, pathCellCount)} of ${pathCellCount} intermediate cells.`);

      if (!isStart(row, col) && !isGoal(row, col)) {
        const completed = await waitForAnimationDelay(Math.max(12, Math.round(animationDelay() * 0.65)), token);
        if (!completed) return;
      }
    }

    if (token !== runToken) return;
    setProgress(100);
    setBadge("found", "FOUND");
    setStatus(`Path found: ${result.moves} moves across ${result.pathNodeCount} path nodes.`);
  }

  async function runSearch() {
    if (isRunning) {
      setStatus("A search is already running. Pause it or wait for it to finish.");
      return;
    }

    clearSearchPresentation();
    const algorithmName = selectedAlgorithm();
    const token = ++runToken;
    const problem = snapshotGrid();
    let result;
    let elapsedMilliseconds;

    isRunning = true;
    isPaused = false;
    updateRunControls();
    setBadge("running", "SEARCHING");
    setStatus(`Running ${algorithmDetails[algorithmName].name}…`);
    setProgress(0);

    try {
      // This stable snapshot is the input to the algorithm. Animation happens later.
      const searchStartedAt = performance.now();
      result = Algorithms.runAlgorithm(algorithmName, problem);
      elapsedMilliseconds = performance.now() - searchStartedAt;
      if (token !== runToken) return;

      lastResult = result;
      hasPresentation = true;
      updateSearchStatistics(result, elapsedMilliseconds);
      await animateResult(result, token);
    } catch (error) {
      if (token !== runToken) return;
      console.error("Pathfinding search failed:", error);
      setBadge("missing", "ERROR");
      setStatus(`The search could not run: ${error.message}`);
    } finally {
      if (token === runToken) {
        isRunning = false;
        isPaused = false;
        updateRunControls();
      }
    }
  }

  function pauseOrResume() {
    if (!isRunning) return;

    if (!isPaused) {
      isPaused = true;
      if (activeDelay && activeDelay.id !== null) {
        window.clearTimeout(activeDelay.id);
        const elapsed = performance.now() - activeDelay.startedAt;
        activeDelay.remaining = Math.max(0, activeDelay.remaining - elapsed);
        activeDelay.id = null;
      }
      setBadge("paused", "PAUSED");
      setStatus("Animation paused. Press Resume animation to continue.");
    } else {
      isPaused = false;
      setBadge("running", "SEARCHING");
      setStatus("Animation resumed.");
      if (activeDelay) scheduleDelay(activeDelay);
    }

    updateRunControls();
  }

  function markGridEdited(message) {
    if (hasPresentation) clearSearchPresentation();
    setStatus(message);
    setBadge("idle", "READY");
    setProgress(0);
    pointerState.didEdit = true;
    pointerState.lastEdit = message;
  }

  function applyPointerMode(row, col) {
    if (!pointerState.down || isRunning || !grid[row] || !grid[row][col]) return;
    const cell = grid[row][col];

    if (pointerState.mode === "draw-wall" || pointerState.mode === "erase-wall") {
      if (isStart(row, col) || isGoal(row, col)) return;
      const nextWallState = pointerState.mode === "draw-wall";
      if (cell.isWall === nextWallState) return;

      if (hasPresentation) clearSearchPresentation();
      cell.isWall = nextWallState;
      updateCellView(cell);
      const action = nextWallState ? "Wall added" : "Wall removed";
      setStatus(`${action} at row ${row + 1}, column ${col + 1}.`);
      setBadge("idle", "READY");
      pointerState.didEdit = true;
      pointerState.lastEdit = action;
      return;
    }

    if (pointerState.mode === "move-start" || pointerState.mode === "move-goal") {
      if (cell.isWall) {
        setStatus("An endpoint cannot be moved onto a wall. Remove that wall first.");
        return;
      }

      const movingStart = pointerState.mode === "move-start";
      if ((movingStart && isGoal(row, col)) || (!movingStart && isStart(row, col))) {
        setStatus("Start and destination must occupy different cells.");
        return;
      }

      const current = movingStart ? start : goal;
      if (current.row === row && current.col === col) return;
      if (hasPresentation) clearSearchPresentation();
      if (movingStart) start = { row, col };
      else goal = { row, col };
      updateCellView(grid[current.row][current.col]);
      updateCellView(cell);
      const movedName = movingStart ? "Start" : "Destination";
      setStatus(`${movedName} moved to row ${row + 1}, column ${col + 1}.`);
      setBadge("idle", "READY");
      pointerState.didEdit = true;
      pointerState.lastEdit = `${movedName} moved`;
    }
  }

  function finishPointer(event) {
    if (!pointerState.down) return;
    if (event && pointerState.pointerId !== undefined && event.pointerId !== undefined && event.pointerId !== pointerState.pointerId) return;

    const wasMovingEndpoint = pointerState.mode === "move-start" || pointerState.mode === "move-goal";
    const didEdit = pointerState.didEdit;
    const lastEdit = pointerState.lastEdit;
    pointerState = { down: false, mode: null, didEdit: false, lastEdit: "" };

    if (wasMovingEndpoint && didEdit) {
      setStatus(`${lastEdit}. Press Visualize path to run the selected algorithm.`);
    }
  }

  function onGridPointerDown(event) {
    const position = positionFromCellElement(event.target);
    if (!position) return;
    if (isRunning) {
      setStatus("Grid editing is locked during a search. Wait for the animation or reset it first.");
      return;
    }

    event.preventDefault();
    const { row, col } = position;
    const cell = grid[row][col];
    let mode;
    if (isStart(row, col)) mode = "move-start";
    else if (isGoal(row, col)) mode = "move-goal";
    else mode = cell.isWall ? "erase-wall" : "draw-wall";

    pointerState = {
      down: true,
      mode,
      didEdit: false,
      lastEdit: "",
      pointerId: event.pointerId
    };
    applyPointerMode(row, col);
  }

  function onGridPointerOver(event) {
    if (!pointerState.down || isRunning) return;
    const position = positionFromCellElement(event.target);
    if (position) applyPointerMode(position.row, position.col);
  }

  function clearPathButtonAction() {
    cancelAnimation();
    clearSearchPresentation();
    setStatus("Exploration and path markings cleared. Walls and endpoints are unchanged.");
  }

  function resetGridAction() {
    cancelAnimation();
    grid = makeGrid();
    start = { ...DEFAULT_START };
    goal = { ...DEFAULT_GOAL };
    buildGridView();
    resetStatistics();
    setProgress(0);
    setBadge("idle", "READY");
    setStatus("Grid reset to its original empty layout and endpoint positions.");
  }

  function hasRoute() {
    return Algorithms.breadthFirstSearch(snapshotGrid()).found;
  }

  function randomObstaclesAction() {
    cancelAnimation();
    for (const row of grid) {
      for (const cell of row) {
        cell.isWall = false;
        cell.isVisited = false;
        cell.isPath = false;
      }
    }

    const density = 0.22;
    for (const row of grid) {
      for (const cell of row) {
        if (isStart(cell.row, cell.col) || isGoal(cell.row, cell.col)) continue;
        cell.isWall = Math.random() < density;
      }
    }

    let routePreserved = true;
    try {
      if (!hasRoute()) {
        // Carve an easy-to-explain L-shaped corridor if random walls disconnect the grid.
        const stepCol = start.col <= goal.col ? 1 : -1;
        for (let col = start.col; col !== goal.col + stepCol; col += stepCol) {
          grid[start.row][col].isWall = false;
        }
        const stepRow = start.row <= goal.row ? 1 : -1;
        for (let row = start.row; row !== goal.row + stepRow; row += stepRow) {
          grid[row][goal.col].isWall = false;
        }
        routePreserved = hasRoute();
      }
    } catch (error) {
      routePreserved = false;
      console.error("Could not verify the random layout:", error);
    }

    renderAllCells();
    hasPresentation = false;
    lastResult = null;
    resetStatistics();
    setProgress(0);
    setBadge("idle", "READY");
    setStatus(routePreserved
      ? "Random obstacles generated. At least one route is open."
      : "Random obstacles generated, but route verification failed. Clear walls or reset the grid.");
  }

  function updateSpeedLabel() {
    elements.speedValue.textContent = `${elements.speedRange.value}%`;
  }

  function onAlgorithmChange() {
    if (isRunning) return;
    if (hasPresentation) clearSearchPresentation();
    updateAlgorithmInfo();
    setBadge("idle", "READY");
    setStatus("Algorithm changed. Press Visualize path to run a new search.");
  }

  function bindEvents() {
    elements.grid.addEventListener("pointerdown", onGridPointerDown);
    elements.grid.addEventListener("pointerover", onGridPointerOver);
    elements.grid.addEventListener("pointercancel", finishPointer);
    document.addEventListener("pointerup", finishPointer);
    window.addEventListener("blur", () => finishPointer());

    elements.visualizeButton.addEventListener("click", runSearch);
    elements.pauseButton.addEventListener("click", pauseOrResume);
    elements.clearPathButton.addEventListener("click", clearPathButtonAction);
    elements.resetButton.addEventListener("click", resetGridAction);
    elements.randomButton.addEventListener("click", randomObstaclesAction);
    elements.algorithmSelect.addEventListener("change", onAlgorithmChange);
    elements.speedRange.addEventListener("input", updateSpeedLabel);
  }

  function initialize() {
    grid = makeGrid();
    buildGridView();
    bindEvents();
    updateAlgorithmInfo();
    updateSpeedLabel();
    updateRunControls();
    resetStatistics();
    setBadge("idle", "READY");
  }

  initialize();
})();
