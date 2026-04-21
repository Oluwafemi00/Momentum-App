const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");

let db;
let todos = []; // In-memory state

// 1. Service Worker Registration (Optional, keep if you have sw.js)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => console.log("Service Worker registered successfully."))
      .catch((err) =>
        console.error("Service Worker registration failed:", err),
      );
  });
}

// 2. IndexedDB Setup
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("TodoDatabase", 1);

    request.onerror = () => reject("Failed to open IndexedDB");

    request.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (e) => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains("todos")) {
        database.createObjectStore("todos", { keyPath: "id" });
      }
    };
  });
};

// 3. Database Operations
const loadTodosFromDB = () => {
  return new Promise((resolve) => {
    const transaction = db.transaction(["todos"], "readonly");
    const store = transaction.objectStore("todos");
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
  });
};

const saveTodoToDB = (todo) => {
  const transaction = db.transaction(["todos"], "readwrite");
  const store = transaction.objectStore("todos");
  store.put(todo);
};

const deleteTodoFromDB = (id) => {
  const transaction = db.transaction(["todos"], "readwrite");
  const store = transaction.objectStore("todos");
  store.delete(id);
};

// --- Motivational Note Logic ---
const noteElement = document.getElementById("motivational-note");
const DEFAULT_NOTE = "Stay consistent. Every small step counts.";
const STORAGE_KEY = "todo_motivational_note";

// Load the note when the app starts
const savedNote = localStorage.getItem(STORAGE_KEY);
if (savedNote !== null) {
  noteElement.textContent = savedNote;
} else {
  noteElement.textContent = DEFAULT_NOTE;
}

// Save the note when the user clicks away (loses focus)
noteElement.addEventListener("blur", () => {
  const currentText = noteElement.textContent.trim();
  if (currentText === "") {
    // If they delete everything, revert to default
    noteElement.textContent = DEFAULT_NOTE;
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, currentText);
  }
});

// Save and remove focus when pressing the 'Enter' key
noteElement.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault(); // Prevents a new line from being created
    noteElement.blur(); // Triggers the save function above
  }
});
// -------------------------------

// 4. UI Rendering & Event Handling
function renderTodos() {
  list.innerHTML = "";
  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = `todo-item ${todo.completed ? "completed" : ""}`;
    li.dataset.id = todo.id;

    // Notice: Native checkbox removed. The CSS ::before handles the visuals.
    li.innerHTML = `
      <div class="todo-content">
        <span>${todo.text}</span>
      </div>
      <button class="delete-btn" aria-label="Delete task">&times;</button>
    `;
    list.appendChild(li);
  });
}

function addTodo(e) {
  e.preventDefault();
  const text = input.value.trim();

  if (text) {
    const newTodo = {
      id: Date.now().toString(),
      text: text,
      completed: false,
    };

    todos.push(newTodo);
    saveTodoToDB(newTodo);

    input.value = "";
    renderTodos();
  }
}

function handleListAction(e) {
  const item = e.target.closest(".todo-item");
  if (!item) return;

  const id = item.dataset.id;

  // Handle Delete
  if (e.target.classList.contains("delete-btn")) {
    todos = todos.filter((t) => t.id !== id);
    deleteTodoFromDB(id);
    renderTodos();
    return; // Stop execution so it doesn't trigger a toggle
  }

  // Handle Toggle Completion (clicks anywhere on the content or custom checkbox)
  if (e.target.closest(".todo-content")) {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      saveTodoToDB(todo);
      renderTodos();
    }
  }
}

// 5. Application Bootstrap
async function initApp() {
  try {
    await initDB();
    todos = await loadTodosFromDB();

    form.addEventListener("submit", addTodo);
    list.addEventListener("click", handleListAction);

    renderTodos();

    // --- Splash Screen Dismissal ---
    // We add a tiny artificial delay (800ms) so the animation
    // actually has time to look smooth and premium before vanishing.
    setTimeout(() => {
      const splashScreen = document.getElementById("splash-screen");
      splashScreen.classList.add("hidden");
    }, 800);
    // -------------------------------
  } catch (error) {
    console.error("Initialization error:", error);
  }
}

// Start the app
initApp();
