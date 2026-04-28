// Game & Grid Configuration
const CELL_SIZE = 40;
const GAP = 2;
const PADDING = 10;
const WORKER_OFFSET = PADDING + (CELL_SIZE - 32) / 2; // = 14
const PATROL_OFFSET = PADDING + (CELL_SIZE - 28) / 2; // = 16
const STEP_MS = 300; // Animation / Tick speed

// Directions: 0: North, 1: East, 2: South, 3: West
const DIR = { N: 0, E: 1, S: 2, W: 3 };
const VECTORS = [
  { x: 0, y: -1 }, // N
  { x: 1, y: 0 },  // E
  { x: 0, y: 1 },  // S
  { x: -1, y: 0 }  // W
];

// Tile Types
const TILE = { EMPTY: 0, WALL: 1, BIN: 2, COIN_SOURCE: 3 };

// --- PROGRESSION & STORE ---
let globalWalletCoins = 0; // Persistent between runs

const STORE_ITEMS = [
  { id: 'cmd_turnLeft', type: 'cmd', name: 'TurnLeft()', cost: 1, purchased: false, desc: 'Allows you to turn counter-clockwise without moving.', demo: "MoveForward();\nTurnLeft(); // Worker rotates 90 degrees CCW\nMoveForward();" },
  { id: 'cmd_loop', type: 'cmd', name: 'while(true)', cost: 2, purchased: false, desc: 'Unlocks infinite loops for farming.', demo: "while(true) {\n  MoveForward();\n  TurnRight();\n}\n// The lines between the { } brackets will repeat endlessly!" },
  { id: 'cmd_moveBack', type: 'cmd', name: 'MoveBackwards()', cost: 2, purchased: false, desc: 'Reverse without turning.', demo: "MoveForward();\nMoveBackwards(); // Steps backwards but keeps facing the same way" },
  { id: 'stg_2', type: 'stage', name: 'Stage 02: Turning Point', cost: 3, purchased: false, desc: 'Unlocks the 2nd stage.', unlockStage: 2 },
  { id: 'stg_3', type: 'stage', name: 'Stage 03: Automation', cost: 5, purchased: false, desc: 'Unlocks the 3rd stage.', unlockStage: 3 },
  { id: 'cmd_isWall', type: 'cmd', name: 'IsWallAhead()', cost: 5, purchased: false, desc: 'Check if there is an obstacle in front of you.', demo: "while(true) {\n  if (IsWallAhead()) {\n    TurnRight(); // Avoid the wall!\n  } else {\n    MoveForward();\n  }\n}" },
  { id: 'stg_4', type: 'stage', name: 'Stage 04: The Guards', cost: 10, purchased: false, desc: 'Unlocks the 4th stage.', unlockStage: 4 },
  { id: 'stg_5', type: 'stage', name: 'Stage 05: The Factory', cost: 15, purchased: false, desc: 'Unlocks the 5th stage.', unlockStage: 5 },
  { id: 'stg_6', type: 'stage', name: 'Stage 06: Co-op Protocol', cost: 20, purchased: false, desc: 'Unlocks the 6th stage.', unlockStage: 6 },
];

function isCommandUnlocked(cmdId) {
  if (cmdId === 'MoveForward' || cmdId === 'TurnRight' || cmdId === 'ConsoleLog' || cmdId === 'GetWorkerInventoryItems') return true;
  if (cmdId === 'TurnLeft') return STORE_ITEMS.find(i => i.id === 'cmd_turnLeft').purchased;
  if (cmdId === 'MoveBackwards') return STORE_ITEMS.find(i => i.id === 'cmd_moveBack').purchased;
  if (cmdId === 'DoNothing') return true;
  if (cmdId === 'while') return STORE_ITEMS.find(i => i.id === 'cmd_loop').purchased;
  if (cmdId === 'IsWallAhead') return STORE_ITEMS.find(i => i.id === 'cmd_isWall').purchased;
  return false;
}

// --- LEVELS ---
const LEVELS = {
  1: {
    goalCoins: 1,
    desc: "Goal: Deposit 1 coin. (Farm this stage to buy Store items!)",
    grid: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 2, 0, 0, 3, 1, 1],
      [1, 1, 1, 1, 1, 1, 1]
    ],
    starts: [{ x: 2, y: 1, dir: DIR.E }],
    coins: [{ x: 4, y: 1, active: true }],
    patrols: []
  },
  2: {
    goalCoins: 3,
    desc: "Goal: Deposit all 3 coins. Navigation required.",
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 0, 1, 3, 0, 0, 0, 1],
      [1, 1, 0, 1, 1, 1, 1, 0, 1],
      [1, 1, 0, 0, 0, 3, 0, 0, 1],
      [1, 1, 1, 1, 0, 1, 1, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    starts: [{ x: 2, y: 1, dir: DIR.S }],
    coins: [{ x: 4, y: 1, active: true }, { x: 5, y: 3, active: true }, { x: 7, y: 4, active: true }],
    patrols: []
  },
  3: {
    goalCoins: 10,
    desc: "Goal: Farm 10 coins using a while(true) loop.",
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 0, 0, 0, 0, 0, 3, 1],
      [1, 1, 1, 0, 1, 1, 1, 1, 1],
      [1, 3, 0, 0, 0, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    starts: [{ x: 2, y: 1, dir: DIR.E }],
    coins: [{ x: 7, y: 1, active: true }, { x: 1, y: 3, active: true }],
    respawns: true,
    patrols: []
  },
  4: {
    goalCoins: 2,
    desc: "WARNING: Moving guards detected. They step whenever you execute a command limit.",
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 0, 0, 0, 0, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 3, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    starts: [{ x: 1, y: 3, dir: DIR.E }],
    coins: [{ x: 8, y: 1, active: true }, { x: 8, y: 3, active: true }],
    patrols: [
      { x: 5, y: 1, dir: 1, minX: 3, maxX: 7, axis: 'x' },
      { x: 3, y: 3, dir: 1, minX: 2, maxX: 6, axis: 'x' }
    ]
  },
  5: {
    goalCoins: 5,
    desc: "The Factory. Navigate the guards to collect 5 scattered parts.",
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 0, 1, 3, 0, 0, 0, 3, 1],
      [1, 0, 0, 1, 0, 1, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 3, 1],
      [1, 3, 1, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 3, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    starts: [{ x: 1, y: 2, dir: DIR.S }],
    coins: [{ x: 4, y: 1, active: true }, { x: 8, y: 1, active: true }, { x: 8, y: 3, active: true }, { x: 1, y: 4, active: true }, { x: 7, y: 5, active: true }],
    patrols: [
      { x: 5, y: 3, dir: 1, minX: 3, maxX: 7, axis: 'x' },
      { x: 2, y: 5, dir: 1, minX: 1, maxX: 5, axis: 'x' },
      { x: 8, y: 4, dir: -1, minY: 2, maxY: 5, axis: 'y' }
    ]
  },
  6: {
    goalCoins: 2,
    desc: "Co-op Protocol. Use `worker1.MoveForward()` & `worker2.MoveForward()` to win.",
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 3, 0, 0, 1, 2, 0, 0, 3, 1],
      [1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
      [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    starts: [{ x: 3, y: 3, dir: DIR.W }, { x: 6, y: 3, dir: DIR.E }],
    coins: [{ x: 1, y: 1, active: true }, { x: 8, y: 1, active: true }],
    patrols: []
  }
};

let currentLevel = 1;
let isRunning = false;
let stopRequested = false;

// Game State
let state = {
  workers: [], // Array of {x, y, dir, inventory, el}
  stageCoins: 0,
  goal: 0,
  grid: [],
  coins: [],
  patrols: []
};

// DOM Elements
const elGridView = document.getElementById('grid-view');
const elWalletCoins = document.getElementById('wallet-coins');
const elStageCoins = document.getElementById('stage-coins');
const elWorkerInv = document.getElementById('worker-inv');
const elConsole = document.getElementById('console-output');
const elLevelText = document.getElementById('level-goal-text');
const btnRun = document.getElementById('btn-run');
const btnStop = document.getElementById('btn-stop');
const levelPicker = document.getElementById('level-picker');
const btnLoadLevel = document.getElementById('btn-load-level');
const codeEditor = document.getElementById('code-editor');

// Store DOM Elements
const storeModal = document.getElementById('store-modal');
const btnStore = document.getElementById('btn-store');
const btnCloseStore = document.getElementById('btn-close-store');
const storeItemsList = document.getElementById('store-items-list');

// Demo Modal DOM Elements
const demoModal = document.getElementById('demo-modal');
const demoTitle = document.getElementById('demo-title');
const demoDesc = document.getElementById('demo-desc');
const demoCode = document.getElementById('demo-code');
const btnCloseDemo = document.getElementById('btn-close-demo');

let coinElements = [];
let patrolElements = [];

// Logger
function log(msg, type = "info") {
  const line = document.createElement("div");
  line.className = `console-line ${type}`;
  line.textContent = `> ${msg}`;
  elConsole.appendChild(line);
  elConsole.scrollTop = elConsole.scrollHeight;
}

// Initializing Level
function loadLevel(levelId) {
  stopScript();
  const lvl = LEVELS[levelId];
  if (!lvl) return;

  currentLevel = levelId;
  state.grid = JSON.parse(JSON.stringify(lvl.grid));
  state.coins = JSON.parse(JSON.stringify(lvl.coins));
  state.patrols = JSON.parse(JSON.stringify(lvl.patrols || []));
  state.workers = JSON.parse(JSON.stringify(lvl.starts));
  state.workers.forEach(w => w.inventory = 0);
  state.stageCoins = 0;
  state.goal = lvl.goalCoins;

  elLevelText.textContent = lvl.desc;
  updateUIStats();
  elConsole.innerHTML = "";
  log(`Loaded Stage ${levelId}.`, "info");

  renderGrid();
}

// Renderer
function renderGrid() {
  elGridView.innerHTML = "";
  coinElements = [];
  patrolElements = [];

  const height = state.grid.length;
  const width = state.grid[0].length;

  elGridView.style.gridTemplateColumns = `repeat(${width}, ${CELL_SIZE}px)`;
  elGridView.style.gridTemplateRows = `repeat(${height}, ${CELL_SIZE}px)`;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      const val = state.grid[y][x];
      if (val === TILE.WALL) cell.classList.add("wall");
      if (val === TILE.BIN) cell.classList.add("bin");
      if (val === TILE.COIN_SOURCE) cell.classList.add("coin-source");

      elGridView.appendChild(cell);
    }
  }

  // Draw Coins
  state.coins.forEach((c) => {
    const cEl = document.createElement("div");
    cEl.className = "entity-coin";
    if (!c.active) cEl.style.display = 'none';
    cEl.style.left = `${c.x * (CELL_SIZE + GAP) + PADDING + 10}px`;
    cEl.style.top = `${c.y * (CELL_SIZE + GAP) + PADDING + 10}px`;
    elGridView.appendChild(cEl);
    coinElements.push(cEl);
  });

  // Draw Patrols
  state.patrols.forEach((p) => {
    const pEl = document.createElement("div");
    pEl.className = "entity-patrol";
    pEl.textContent = "X";
    elGridView.appendChild(pEl);
    patrolElements.push(pEl);
  });
  updatePatrolsDOM();

  // Draw Workers
  state.workers.forEach((w, i) => {
    const wEl = document.createElement("div");
    wEl.className = "worker";
    if (i === 1) wEl.classList.add("worker-2");
    elGridView.appendChild(wEl);
    w.el = wEl;
  });

  updateWorkerDOM();
}

function updateWorkerDOM() {
  state.workers.forEach((w, i) => {
    const left = WORKER_OFFSET + w.x * (CELL_SIZE + GAP);
    const top = WORKER_OFFSET + w.y * (CELL_SIZE + GAP);
    const rot = w.dir * 90;
    w.el.style.transform = `translate(${left - WORKER_OFFSET}px, ${top - WORKER_OFFSET}px) rotate(${rot}deg)`;
  });
}

function updatePatrolsDOM() {
  state.patrols.forEach((p, i) => {
    const left = PATROL_OFFSET + p.x * (CELL_SIZE + GAP);
    const top = PATROL_OFFSET + p.y * (CELL_SIZE + GAP);
    patrolElements[i].style.transform = `translate(${left - PATROL_OFFSET}px, ${top - PATROL_OFFSET}px)`;
  });
}

function updateUIStats() {
  elWalletCoins.textContent = globalWalletCoins;
  elStageCoins.textContent = state.stageCoins;
  let totalInv = 0;
  state.workers.forEach(w => totalInv += w.inventory);
  elWorkerInv.textContent = totalInv;

  // Also update UI availability in level picker based on store
  STORE_ITEMS.filter(i => i.type === 'stage').forEach(item => {
    const opt = levelPicker.querySelector(`option[value="${item.unlockStage}"]`);
    if (opt) {
      if (item.purchased) {
        opt.disabled = false;
        opt.textContent = `Stage 0${item.unlockStage}: ${item.name.split(': ')[1]}`;
      } else {
        opt.disabled = true;
        opt.textContent = `Stage 0${item.unlockStage}: ????? (Locked)`;
      }
    }
  });
}

// Tick updating logic for Entities
async function runEntityTick() {
  let collision = false;
  state.patrols.forEach(p => {
    if (p.axis === 'x') {
      p.x += p.dir;
      if (p.x >= p.maxX || p.x <= p.minX) p.dir *= -1; // bounce
    } else {
      p.y += p.dir;
      if (p.y >= p.maxY || p.y <= p.minY) p.dir *= -1;
    }

    // Check collision post-move
    state.workers.forEach(w => {
      if (p.x === w.x && p.y === w.y) collision = true;
    });
  });
  updatePatrolsDOM();

  // also check if worker stepped into a patrol
  state.patrols.forEach(p => {
    state.workers.forEach(w => {
      if (p.x === w.x && p.y === w.y) collision = true;
    });
  });

  if (collision) {
    log("CRITICAL: Collision with guard detected!", "warn");
    stopRequested = true;
  }
}

// Hooks implementation for code runner
const pause = (ms) => new Promise(res => setTimeout(res, ms));

async function yieldTick() {
  await pause(10);
  if (stopRequested) throw new Error("Script Stopped.");
}

async function runAction() {
  await runEntityTick();
  if (stopRequested) throw new Error("Script Stopped.");
  await pause(STEP_MS);
}

async function apiMoveForward(wid = 0) {
  if (stopRequested) throw new Error("Script Stopped.");
  const w = state.workers[wid];
  const vec = VECTORS[w.dir];
  const nx = w.x + vec.x;
  const ny = w.y + vec.y;

  if (ny >= 0 && ny < state.grid.length && nx >= 0 && nx < state.grid[0].length && state.grid[ny][nx] !== TILE.WALL) {
    w.x = nx; w.y = ny;
    updateWorkerDOM();
    log(`Worker${wid + 1} moved forward to (${nx}, ${ny})`);
    await checkTileInteractions();
  } else {
    log(`Worker${wid + 1} bonk! Hit obstacle.`, "warn");
  }
  await runAction();
}

async function apiTurnRight(wid = 0) {
  if (stopRequested) throw new Error("Script Stopped.");
  const w = state.workers[wid];
  w.dir = (w.dir + 1) % 4;
  updateWorkerDOM();
  log(`Worker${wid + 1} turned right.`);
  await runAction();
}

async function apiTurnLeft(wid = 0) {
  if (stopRequested) throw new Error("Script Stopped.");
  const w = state.workers[wid];
  w.dir = (w.dir + 3) % 4;
  updateWorkerDOM();
  log(`Worker${wid + 1} turned left.`);
  await runAction();
}

async function apiMoveBackwards(wid = 0) {
  if (stopRequested) throw new Error("Script Stopped.");
  const w = state.workers[wid];
  const vec = VECTORS[w.dir];
  const nx = w.x - vec.x;
  const ny = w.y - vec.y;

  if (ny >= 0 && ny < state.grid.length && nx >= 0 && nx < state.grid[0].length && state.grid[ny][nx] !== TILE.WALL) {
    w.x = nx; w.y = ny;
    updateWorkerDOM();
    log(`Worker${wid + 1} moved backwards to (${nx}, ${ny})`);
    await checkTileInteractions();
  } else {
    log(`Worker${wid + 1} bonk! Hit obstacle backing up.`, "warn");
  }
  await runAction();
}

function apiIsWallAhead(wid = 0) {
  const w = state.workers[wid];
  const vec = VECTORS[w.dir];
  const nx = w.x + vec.x;
  const ny = w.y + vec.y;
  if (ny >= 0 && ny < state.grid.length && nx >= 0 && nx < state.grid[0].length) {
    return state.grid[ny][nx] === TILE.WALL;
  }
  return true;
}

async function apiDoNothing() {
  if (stopRequested) throw new Error("Script Stopped.");
  log("Did nothing.");
  await runAction();
}

async function checkTileInteractions() {
  // Check coins
  state.workers.forEach(w => {
    for (let i = 0; i < state.coins.length; i++) {
      const c = state.coins[i];
      if (c.active && c.x === w.x && c.y === w.y) {
        c.active = false;
        w.inventory++;
        coinElements[i].style.display = 'none';
        log(`Picked up a coin! Inv: ${w.inventory}`, "info");
        updateUIStats();
      }
    }

    // Check Bin
    if (state.grid[w.y][w.x] === TILE.BIN) {
      if (w.inventory > 0) {
        const added = w.inventory;
        log(`Deposited ${added} coins!`, "info");
        state.stageCoins += added;
        globalWalletCoins += added; // Immediately persists to wallet
        w.inventory = 0;
        updateUIStats();
        checkWinCondition();
      }
    }
  });

  // Respawn Mechanics (Level 3 or 5)
  if (LEVELS[currentLevel].respawns) {
    let sourceOccupied = false;
    state.workers.forEach(w => {
      if (state.grid[w.y][w.x] === TILE.COIN_SOURCE) sourceOccupied = true;
    });

    if (!sourceOccupied) {
      state.coins.forEach((c, i) => {
        if (!c.active) {
          c.active = true;
          coinElements[i].style.display = 'block';
        }
      });
    }
  }
}

function checkWinCondition() {
  if (state.stageCoins >= state.goal) {
    log("=== STAGE COMPLETE ===", "info");
    elLevelText.textContent = "SUCCESS! GOAL REACHED!";
    elLevelText.style.color = "var(--accent-green)";
    setTimeout(() => { stopScript(); }, 100);
  }
}

// Script Transpiler
function runScript() {
  if (isRunning) return;
  loadLevel(currentLevel); // Make sure stages must be finished in one go

  isRunning = true;
  stopRequested = false;
  btnRun.disabled = true;
  btnStop.disabled = false;
  log("Starting script execution...", "info");

  let rawCode = codeEditor.value;

  // Transpile loops. First check if looping is unlocked.
  if (rawCode.includes('while') || rawCode.includes('for')) {
    if (!isCommandUnlocked('while')) {
      log("Syntax Error: Loop commands are locked! Buy them in the Store.", "error");
      __finishEngine();
      return;
    }
  }

  rawCode = rawCode.replace(/((?:while|for)\s*\([^)]+\)\s*\{)/g, `$1 await yieldTick(); `);

  // Await the async API calls and check unlocks
  const apiMethods = ['MoveForward', 'MoveBackwards', 'TurnRight', 'TurnLeft', 'DoNothing', 'IsWallAhead'];
  let processedCode = rawCode;
  let accessDenied = false;

  apiMethods.forEach(method => {
    // 1. Process Global legacy commands -> defaults to worker1.Method()
    // Using negative lookbehind to ensure there's no dot before the method name.
    let reGlobal = new RegExp(`(?<!\\.)\\b${method}\\s*\\(`, 'g');
    if (reGlobal.test(processedCode) && !isCommandUnlocked(method)) {
      log(`Syntax Error: ${method}() is locked! Buy it in the Store.`, "error");
      accessDenied = true;
    }
    processedCode = processedCode.replace(reGlobal, `await worker1.${method}(`);

    // 2. Process specific Worker instance commands string worker1.MoveForward() -> await worker1.MoveForward()
    let reObj = new RegExp(`\\b(worker[1-9])\\.${method}\\s*\\(`, 'g');
    if (reObj.test(processedCode) && !isCommandUnlocked(method)) {
      log(`Syntax Error: ${method}() is locked! Buy it in the Store.`, "error");
      accessDenied = true;
    }
    processedCode = processedCode.replace(reObj, `await $1.${method}(`);
  });

  if (accessDenied) {
    __finishEngine();
    return;
  }

  // Handle Synchronous commands manually if needed, such as ConsoleLog
  processedCode = processedCode.replace(/(?<!\.)\bConsoleLog\s*\(/g, `__engine.ConsoleLog(`);
  // Also support worker1.ConsoleLog just in case
  processedCode = processedCode.replace(/\bworker[1-9]\.ConsoleLog\s*\(/g, `__engine.ConsoleLog(`);

  processedCode = processedCode.replace(/(?<!\.)\bGetWorkerInventoryItems\s*\(\)/g, `worker1.GetWorkerInventoryItems()`);

  const runnerContent = `
    return (async () => {
      try {
        ${processedCode}
        __engine.log("Script execution finished naturally.");
        if (__engine.checkFailed()) {
          __engine.log("Goal not reached! Resetting stage...", "warn");
        }
      } catch (e) {
        if (e.message !== "Script Stopped.") {
          __engine.log("Error: " + e.message, "error");
        } else {
          __engine.log("Script stopped forcefully.", "warn");
        }
      } finally {
        __engine.onFinish();
      }
    })();
  `;

  // Provide factory for isolated worker APIs so we can pass Worker1 and Worker2 easily
  const createWorkerAPI = (index) => ({
    MoveForward: () => apiMoveForward(index),
    MoveBackwards: () => apiMoveBackwards(index),
    TurnRight: () => apiTurnRight(index),
    TurnLeft: () => apiTurnLeft(index),
    DoNothing: () => apiDoNothing(),
    IsWallAhead: () => apiIsWallAhead(index),
    GetWorkerInventoryItems: () => state.workers[index] ? state.workers[index].inventory : 0
  });

  const worker1 = createWorkerAPI(0);
  const worker2 = state.workers.length > 1 ? createWorkerAPI(1) : createWorkerAPI(0); // Safely fallback if missing mapping
  const worker3 = state.workers.length > 2 ? createWorkerAPI(2) : createWorkerAPI(0);

  const __engine = {
    ConsoleLog: (msg) => log(msg, "info"),
    log: log,
    checkFailed: () => state.stageCoins < state.goal && !stopRequested,
    onFinish: __finishEngine
  };

  try {
    const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
    const runnable = new AsyncFunction('__engine', 'yieldTick', 'worker1', 'worker2', 'worker3', runnerContent);
    runnable(__engine, yieldTick, worker1, worker2, worker3);
  } catch (e) {
    log("Syntax Error in script: " + e.message, "error");
    __finishEngine();
  }
}

function __finishEngine() {
  isRunning = false;
  btnRun.disabled = false;
  btnStop.disabled = true;
  if (state.stageCoins < state.goal) {
    setTimeout(() => {
      if (!isRunning) loadLevel(currentLevel);
    }, 1500);
  }
}

function stopScript() {
  if (!isRunning) return;
  stopRequested = true;
}

// Store System logic
function renderStore() {
  storeItemsList.innerHTML = "";
  STORE_ITEMS.forEach(item => {
    const el = document.createElement('div');
    el.className = `store-item ${item.purchased ? 'purchased' : ''}`;

    const info = document.createElement('div');
    info.className = 'info';
    info.innerHTML = `<h4>${item.name}</h4><p>${item.desc}</p>`;

    const action = document.createElement('div');
    const b = document.createElement('button');
    b.className = 'btn primary';
    if (item.purchased) {
      b.textContent = 'Owned';
      b.disabled = true;
    } else {
      b.textContent = `${item.cost} Coins`;
      if (globalWalletCoins < item.cost) b.disabled = true;
      b.onclick = () => buyItem(item.id);
    }
    action.appendChild(b);

    el.appendChild(info);
    el.appendChild(action);
    storeItemsList.appendChild(el);
  });
}

function buyItem(id) {
  const item = STORE_ITEMS.find(i => i.id === id);
  if (item && globalWalletCoins >= item.cost && !item.purchased) {
    globalWalletCoins -= item.cost;
    item.purchased = true;
    updateUIStats();
    renderStore();
    log(`Purchased: ${item.name}`, "info");

    if (item.type === 'cmd') {
      showDemoModal(item);
    }
  }
}

function showDemoModal(item) {
  demoTitle.textContent = item.name;
  demoDesc.textContent = item.desc;
  demoCode.textContent = item.demo;
  demoModal.classList.remove('hidden');
}

// Event Listeners
btnRun.addEventListener("click", runScript);
btnStop.addEventListener("click", stopScript);
btnLoadLevel.addEventListener("click", () => {
  loadLevel(parseInt(levelPicker.value));
});

btnStore.addEventListener("click", () => {
  renderStore();
  storeModal.classList.remove('hidden');
});
btnCloseStore.addEventListener("click", () => {
  storeModal.classList.add('hidden');
});
btnCloseDemo.addEventListener("click", () => {
  demoModal.classList.add('hidden');
});

// Init
btnStop.disabled = true;
updateUIStats();
loadLevel(1);
