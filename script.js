// ============================================================
//  MOMENTUM — Premium PWA Todo
//  script.js
// ============================================================

// ─── STATE ───────────────────────────────────────────────────
let db;
let todos = [];
let activeFilter = "all";

// ─── DOM ─────────────────────────────────────────────────────
const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const emptyState = document.getElementById("emptyState");
const greetingEl = document.getElementById("greeting");
const dateLabelEl = document.getElementById("dateLabel");
const noteEl = document.getElementById("motivationalNote");
const ringFill = document.getElementById("ringFill");
const ringLabel = document.getElementById("ringLabel");
const statTotal = document.getElementById("statTotal");
const statDone = document.getElementById("statDone");
const statLeft = document.getElementById("statLeft");
const clearDoneBtn = document.getElementById("clearDoneBtn");

// ─── CONSTANTS ───────────────────────────────────────────────
const CIRC = 2 * Math.PI * 16; // ≈ 100.5
const NOTE_KEY = "momentum_note";
const DEFAULT_NOTE = "Every great day starts with a single task done well.";

// ─── GREETING & DATE ─────────────────────────────────────────
function updateGreeting() {
  const now = new Date();
  const hour = now.getHours();
  let grt = "Good morning";
  if (hour >= 12 && hour < 17) grt = "Good afternoon";
  else if (hour >= 17) grt = "Good evening";
  greetingEl.textContent = grt;

  dateLabelEl.textContent = now.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
updateGreeting();

// ─── MOTIVATIONAL NOTE ───────────────────────────────────────
const savedNote = localStorage.getItem(NOTE_KEY);
noteEl.textContent = savedNote !== null ? savedNote : DEFAULT_NOTE;

noteEl.addEventListener("blur", () => {
  const txt = noteEl.textContent.trim();
  if (!txt) {
    noteEl.textContent = DEFAULT_NOTE;
    localStorage.removeItem(NOTE_KEY);
  } else {
    localStorage.setItem(NOTE_KEY, txt);
  }
});
noteEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    noteEl.blur();
  }
});

// ─── INDEXEDDB ───────────────────────────────────────────────
function initDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("MomentumDB", 2);
    req.onerror = () => reject("IndexedDB failed");
    req.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };
    req.onupgradeneeded = (e) => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains("todos")) {
        d.createObjectStore("todos", { keyPath: "id" });
      }
    };
  });
}

function dbGetAll() {
  return new Promise((resolve) => {
    const tx = db.transaction("todos", "readonly");
    const store = tx.objectStore("todos");
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
  });
}

function dbPut(todo) {
  const tx = db.transaction("todos", "readwrite");
  const store = tx.objectStore("todos");
  store.put(todo);
}

function dbDelete(id) {
  const tx = db.transaction("todos", "readwrite");
  const store = tx.objectStore("todos");
  store.delete(id);
}

// ─── ADD TODO ────────────────────────────────────────────────
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;

  const todo = {
    id: Date.now().toString(),
    text,
    completed: false,
    createdAt: Date.now(),
  };

  todos.push(todo);
  dbPut(todo);
  todoInput.value = "";
  renderTodos();
});

// ─── TOGGLE ──────────────────────────────────────────────────
function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;
  todo.completed = !todo.completed;
  dbPut(todo);
  renderTodos();
}

// ─── DELETE ──────────────────────────────────────────────────
function deleteTodo(id) {
  const li = todoList.querySelector(`[data-id="${id}"]`);
  if (li) {
    li.classList.add("removing");
    li.addEventListener(
      "animationend",
      () => {
        todos = todos.filter((t) => t.id !== id);
        dbDelete(id);
        renderTodos();
      },
      { once: true },
    );
  }
}

// ─── CLEAR DONE ──────────────────────────────────────────────
clearDoneBtn.addEventListener("click", () => {
  const done = todos.filter((t) => t.completed);
  done.forEach((t) => dbDelete(t.id));
  todos = todos.filter((t) => !t.completed);
  renderTodos();
});

// ─── FILTER TABS ─────────────────────────────────────────────
document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tab")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    renderTodos();
  });
});

// ─── RENDER ──────────────────────────────────────────────────
function renderTodos() {
  todoList.innerHTML = "";

  let filtered = todos;
  if (activeFilter === "active") filtered = todos.filter((t) => !t.completed);
  if (activeFilter === "done") filtered = todos.filter((t) => t.completed);

  // Sort: incomplete first, then by date desc
  filtered = [...filtered].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return b.createdAt - a.createdAt;
  });

  if (filtered.length === 0) {
    emptyState.classList.add("show");
  } else {
    emptyState.classList.remove("show");
    filtered.forEach((todo) => {
      const li = buildTaskItem(todo);
      todoList.appendChild(li);
    });
  }

  updateStats();
  updateRing();
}

function buildTaskItem(todo) {
  const li = document.createElement("li");
  li.className = "task-item" + (todo.completed ? " completed" : "");
  li.dataset.id = todo.id;

  const date = new Date(todo.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  li.innerHTML = `
    <div class="task-check ${todo.completed ? "checked" : ""}" role="checkbox" aria-checked="${todo.completed}" tabindex="0"></div>
    <span class="task-text">${escHtml(todo.text)}</span>
    <span class="task-date">${date}</span>
    <button class="task-del" title="Delete task" aria-label="Delete task">
      <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
    </button>
  `;

  // Check toggle
  const check = li.querySelector(".task-check");
  check.addEventListener("click", () => toggleTodo(todo.id));
  check.addEventListener("keypress", (e) => {
    if (e.key === "Enter" || e.key === " ") toggleTodo(todo.id);
  });

  // Text click also toggles
  li.querySelector(".task-text").addEventListener("click", () =>
    toggleTodo(todo.id),
  );

  // Delete
  li.querySelector(".task-del").addEventListener("click", (e) => {
    e.stopPropagation();
    deleteTodo(todo.id);
  });

  return li;
}

// ─── STATS ───────────────────────────────────────────────────
function updateStats() {
  const total = todos.length;
  const done = todos.filter((t) => t.completed).length;
  const left = total - done;

  statTotal.textContent = total;
  statDone.textContent = done;
  statLeft.textContent = left;
}

// ─── RING ────────────────────────────────────────────────────
function updateRing() {
  const total = todos.length;
  const done = todos.filter((t) => t.completed).length;
  const pct = total > 0 ? done / total : 0;
  const offset = CIRC * (1 - pct);

  ringFill.style.strokeDasharray = CIRC;
  ringFill.style.strokeDashoffset = offset;
  ringLabel.textContent = total > 0 ? `${Math.round(pct * 100)}%` : "—";
}

// ─── KEYBOARD SHORTCUTS ──────────────────────────────────────
document.addEventListener("keydown", (e) => {
  // Focus input on "/"
  if (
    e.key === "/" &&
    document.activeElement !== todoInput &&
    document.activeElement !== noteEl
  ) {
    e.preventDefault();
    todoInput.focus();
  }
  // Escape to blur input
  if (e.key === "Escape" && document.activeElement === todoInput) {
    todoInput.blur();
  }
});

// ─── UTILITY ─────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── SERVICE WORKER ──────────────────────────────────────────
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then(() => console.log("SW registered"))
      .catch((err) => console.warn("SW failed:", err));
  });
}

// ─── BOOT ────────────────────────────────────────────────────
async function init() {
  try {
    await initDB();
    todos = await dbGetAll();
    renderTodos();
  } catch (err) {
    console.error("Init failed:", err);
    todos = [];
    renderTodos();
  } finally {
    setTimeout(() => {
      document.getElementById("splash").classList.add("hidden");
    }, 950);
  }
}

init();
