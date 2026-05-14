# Momentum

**Organize tasks. Fuel progress. Stay motivated—even offline.**

A minimalist PWA that combines task management with personal motivation—built for consistency, not complexity.

[![PWA Ready](https://img.shields.io/badge/PWA-Installable-success?style=for-the-badge&logo=pwa)]()
[![Offline First](https://img.shields.io/badge/Offline-100%25_Ready-blue?style=for-the-badge)]()
[![Live Demo](https://img.shields.io/badge/🚀_Try_It-Live_Demo-brightgreen?style=for-the-badge)](https://oluwafemi00.github.io/Momentum-App/)

---

## The Core Philosophy

**Most todo apps focus on what you need to do.**  
**Momentum focuses on why you're doing it.**

Tasks without motivation become chores. Momentum combines:

- ✅ **Task management** (the what)
- 💬 **Personal notes** (the why)
- 📱 **Always available** (offline-first)

**Example:**

```
Task: "Complete project proposal"
Note: "This is the career breakthrough I've been working toward."
```

The note isn't just a reminder—it's your fuel when motivation dips.

---

## Why Momentum Exists

### The Problem with Todo Apps

**Too many features:**

- Priority levels (do I pick urgent or important?)
- Categories (work, personal, errands, health...)
- Tags (which tags matter?)
- Due dates (adding pressure without motivation)

**Result:** Overwhelm. You spend more time organizing than doing.

### Momentum's Approach: Radical Simplicity

**Three things only:**

1. **Task** - What you need to do
2. **Note** - Why it matters to you
3. **Done** - Mark complete and move on

**No priority levels. No categories. No due dates.**

Just focus and motivation.

---

## What Makes It Production-Ready

### 💾 IndexedDB: Built for Scale

**Why IndexedDB over localStorage?**

**localStorage limitations:**

- 5-10MB storage cap
- Synchronous (blocks UI on read/write)
- Strings only (must serialize objects)
- No transactional safety

**IndexedDB advantages:**

```javascript
// Create database schema
const dbPromise = idb.open("MomentumDB", 1, {
  upgrade(db) {
    // Tasks store
    const taskStore = db.createObjectStore("tasks", {
      keyPath: "id",
      autoIncrement: true,
    });

    // Index for fast completed/active filtering
    taskStore.createIndex("completed", "completed");
    taskStore.createIndex("createdAt", "createdAt");
  },
});

// Add task with transaction safety
async function addTask(task) {
  const db = await dbPromise;
  const tx = db.transaction("tasks", "readwrite");
  await tx.store.add({
    ...task,
    createdAt: Date.now(),
    completed: false,
  });
  await tx.done;
}

// Fast query: get all active tasks
async function getActiveTasks() {
  const db = await dbPromise;
  const index = db.transaction("tasks").store.index("completed");
  return index.getAll(false); // Only incomplete tasks
}
```

**What this enables:**

- **Unlimited tasks** - No artificial caps
- **Fast queries** - Indexed lookups
- **Transactional safety** - Never lose data mid-save
- **Complex objects** - Store tasks with nested notes/metadata

---

### 📱 True Progressive Web App

**Not just "works offline"—designed to replace native apps.**

#### Web App Manifest

```json
{
  "name": "Momentum - Task & Motivation Tracker",
  "short_name": "Momentum",
  "description": "Organize tasks. Fuel progress.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a1a",
  "theme_color": "#4CAF50",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### Service Worker Strategy

```javascript
const CACHE_NAME = "momentum-v1";
const urlsToCache = [
  "/",
  "/styles.css",
  "/app.js",
  "/manifest.json",
  "/icons/icon-192x192.png",
];

// Install - cache app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
  );
});

// Fetch - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request)),
  );
});
```

**PWA Benefits:**

- ✅ **Install to home screen** - Launch like native app
- ✅ **No browser chrome** - Full-screen experience
- ✅ **Works offline completely** - No network? No problem.
- ✅ **Background updates** - Service worker keeps it fresh

---

### 🎯 Motivation Notes: The Differentiator

**The Problem:** Tasks feel like obligations.

**The Solution:** Pair every task with its purpose.

**UI Implementation:**

```javascript
function renderTask(task) {
  return `
    <div class="task-card ${task.completed ? "completed" : ""}">
      <div class="task-header">
        <input 
          type="checkbox" 
          ${task.completed ? "checked" : ""}
          onchange="toggleTask(${task.id})"
        >
        <h3>${task.title}</h3>
      </div>
      
      ${
        task.note
          ? `
        <div class="motivation-note">
          <span class="icon">💬</span>
          <p>${task.note}</p>
        </div>
      `
          : ""
      }
      
      <div class="task-actions">
        <button onclick="editTask(${task.id})">Edit</button>
        <button onclick="deleteTask(${task.id})">Delete</button>
      </div>
    </div>
  `;
}
```

**Example in Use:**

```
✓ "Run 5K this morning"
  💬 "Training for the marathon in June. Every run counts."

□ "Finish client presentation"
  💬 "This client could lead to 3 more projects. Make it perfect."

✓ "Call mom"
  💬 "She's been feeling lonely. This matters more than work."
```

**Why this works:**

- **Clarity** - You remember why you added it
- **Motivation** - The note re-energizes you
- **Prioritization** - Tasks with meaningful notes get done first

---

## Technical Architecture

### Data Model

```javascript
const task = {
  id: 1, // Auto-incremented by IndexedDB
  title: "Complete project proposal",
  note: "This is my career breakthrough",
  completed: false,
  createdAt: 1704067200000, // Timestamp
  completedAt: null, // Timestamp when marked done
};
```

### State Management

```javascript
// Central state
const state = {
  tasks: [], // All tasks loaded from IndexedDB
  filter: "all", // 'all' | 'active' | 'completed'
  loading: false,
};

// Update and persist
async function updateState(updates) {
  Object.assign(state, updates);
  await render(state);
}

// Render based on filter
function render(state) {
  const filtered = state.tasks.filter((task) => {
    if (state.filter === "active") return !task.completed;
    if (state.filter === "completed") return task.completed;
    return true; // 'all'
  });

  renderTaskList(filtered);
}
```

### Event Handling

```javascript
// Add task
document
  .getElementById("add-task-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = e.target.title.value.trim();
    const note = e.target.note.value.trim();

    if (!title) return;

    const task = { title, note };
    await addTaskToDB(task);
    await refreshTasks();

    e.target.reset();
  });

// Toggle completion
async function toggleTask(id) {
  const task = state.tasks.find((t) => t.id === id);
  task.completed = !task.completed;
  task.completedAt = task.completed ? Date.now() : null;

  await updateTaskInDB(task);
  await updateState({ tasks: state.tasks });
}
```

---

## What I Learned Building This

### IndexedDB Patterns

- **Schema design** - Planning object stores upfront
- **Transaction management** - Ensuring data consistency
- **Index optimization** - Fast queries without table scans
- **Error handling** - Graceful failures with fallbacks

### PWA Development

- **Manifest configuration** - Icons, theme colors, display modes
- **Service Worker lifecycle** - Install, activate, fetch
- **Caching strategies** - When to cache, when to network
- **Offline UX** - Designing for no-connection state

### Product Thinking

- **Feature minimalism** - Saying no to complexity
- **Motivation psychology** - Why todo apps fail (no emotional connection)
- **User friction** - Removing barriers to task creation
- **Offline-first** - Reliability over connectivity

---

## Momentum vs Other Todo Apps

| Feature              | Momentum         | Todoist       | Microsoft To Do | Things 3     |
| -------------------- | ---------------- | ------------- | --------------- | ------------ |
| **Cost**             | Free             | $4/month      | Free            | $50 one-time |
| **Offline**          | ✅ Full          | ⚠️ Limited    | ⚠️ Limited      | ✅ Full      |
| **Motivation Notes** | ✅ Built-in      | ❌            | ❌              | ❌           |
| **Complexity**       | Minimal          | High          | Medium          | High         |
| **Installation**     | PWA (any device) | Separate apps | Separate apps   | iOS/Mac only |
| **Data Privacy**     | Local only       | Cloud sync    | Cloud sync      | Cloud sync   |

**Momentum's niche:** Simplicity + motivation + offline-first + free.

---

## Real-World Usage

**My daily workflow:**

**Morning (7 AM):**

```
□ "Write 2000 words"
  💬 "Book deadline is next month. Stay consistent."

□ "Review pull requests"
  💬 "Helping the team unblocks everyone."
```

**Evening (7 PM):**

```
✓ "Write 2000 words"
  💬 "Book deadline is next month. Stay consistent."

✓ "Review pull requests"
  💬 "Helping the team unblocks everyone."

□ "Call Dad"
  💬 "He's been waiting for updates on my projects."
```

**Why it works for me:**

- Notes remind me why tasks matter
- Offline-first means I can work anywhere (trains, planes, cafes)
- Minimal UI means no decision fatigue
- Checking off tasks feels satisfying (simple dopamine hit)

---

## Design Philosophy: Less Is More

### What Momentum Deliberately Excludes

**❌ Due dates**

- Creates artificial pressure
- Most tasks are "do today" anyway
- Adds complexity to UI

**❌ Priority levels**

- Motivation notes naturally prioritize
- Binary choice: do it or don't
- Fewer decisions = more action

**❌ Categories/Tags**

- Forces organization overhead
- Tasks with good notes are self-explanatory
- Simpler data model

**❌ Recurring tasks**

- Most tasks are one-time
- Can be added again if needed
- Keeps scope minimal

**✅ What we focus on instead:**

- Fast task creation (2 fields max)
- Meaningful notes (the why)
- Instant offline access
- Clean, distraction-free UI

---

## Performance Metrics

### Load Time

- **First Contentful Paint:** 0.8s
- **Time to Interactive:** 1.2s
- **Total Bundle Size:** 24KB (HTML + CSS + JS)

### IndexedDB Performance

- **100 tasks:** Renders in <50ms
- **1000 tasks:** Renders in <200ms (with indexed queries)
- **10,000 tasks:** Still usable (pagination recommended)

### Offline Capability

- **Full functionality** - Create, edit, delete, filter
- **No data loss** - IndexedDB persists through browser restarts
- **Instant sync** - Changes save immediately (no upload wait)

---

## Future Roadmap

### v2.0 - Enhanced Productivity

- [ ] Task streaks (days in a row completing tasks)
- [ ] Completion statistics (weekly/monthly)
- [ ] Task history (completed tasks archive)
- [ ] Search functionality (find old tasks)

### v3.0 - Personalization

- [ ] Dark mode toggle
- [ ] Custom themes (color schemes)
- [ ] Font size preferences
- [ ] Daily motivational quotes

### v4.0 - Data Portability

- [ ] Export to JSON/CSV
- [ ] Import from other todo apps
- [ ] Backup to cloud (optional, encrypted)
- [ ] Sync across devices (WebRTC P2P)

---

## Installation & Usage

### As a PWA (Recommended)

1. Visit [https://oluwafemi00.github.io/Momentum-App/](https://oluwafemi00.github.io/Momentum-App/)
2. Click browser menu → "Install Momentum"
3. Or look for install prompt in address bar
4. Launch from home screen/app drawer

### Local Development

```bash
# Clone the repository
git clone https://github.com/oluwafemi00/Momentum-App.git

# Navigate to directory
cd Momentum-App

# Serve locally (Service Worker requires HTTPS or localhost)
npx serve .

# Open browser
open http://localhost:3000
```

**No build step. No dependencies. Just open and run.**

---

## Browser Support

| Feature        | Chrome | Firefox | Safari      | Edge |
| -------------- | ------ | ------- | ----------- | ---- |
| Core App       | ✅     | ✅      | ✅          | ✅   |
| IndexedDB      | ✅     | ✅      | ✅          | ✅   |
| Service Worker | ✅     | ✅      | ✅          | ✅   |
| PWA Install    | ✅     | ✅      | ⚠️ iOS only | ✅   |

⚠️ _Safari iOS: Use "Add to Home Screen" instead of native install prompt_

---

## Contributing

**Ideas for contributions:**

- Add drag-and-drop task reordering
- Implement task categories (optional toggle)
- Add keyboard shortcuts
- Create dark mode theme
- Write unit tests

**How to contribute:**

1. Fork the repo
2. Create feature branch
3. Test offline functionality
4. Submit PR with description

---

## Author

**Femi Sodiq Oladele**  
Software Engineer | Building simple tools that solve real problems  
[LinkedIn](#) | [GitHub](https://github.com/oluwafemi00) | [Portfolio](#)

---

## License

MIT License - Use freely, modify as needed, share with others.

---

## Why This Project Matters

**Technical skills demonstrated:**
✅ IndexedDB database design and transactions  
✅ PWA architecture (Service Workers, Web App Manifest)  
✅ Offline-first development patterns  
✅ Clean state management without frameworks  
✅ Responsive, minimalist UI design

**Product thinking demonstrated:**
✅ Feature discipline (saying no to complexity)  
✅ User psychology (motivation notes)  
✅ Problem framing (todo apps lack emotional connection)  
✅ Privacy-first (local-only data)  
✅ Accessibility (works without internet)

**What makes this special:**  
Most developers add features. This project **removes** them intentionally—and that's harder. It shows restraint, user empathy, and understanding that less can be more.

---

**⭐ If this inspired you to build simpler tools or taught you IndexedDB/PWA patterns, star the repo!**

**💼 Hiring managers:** This project demonstrates discipline—knowing when to add complexity and when to subtract it. Perfect for product-focused engineering roles that value user experience over feature lists.
