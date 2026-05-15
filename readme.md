# Momentum — PWA Todo App ✅

> A premium Progressive Web App todo manager with IndexedDB persistence, circular progress ring, dynamic greetings, filter tabs, and an installable offline-ready service worker.

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-installable-blueviolet)
![IndexedDB](https://img.shields.io/badge/IndexedDB-persistence-blue)
![Service Worker](https://img.shields.io/badge/Service%20Worker-offline-green)

---

## Overview

Momentum is a full Progressive Web App — installable on any device, usable offline, and persisted across sessions with IndexedDB. It goes beyond a basic todo list with a circular progress tracker, dynamic time-aware greetings, filter views, streak-ready architecture, and a warm leather-planner aesthetic.

---

## Features

| Feature                           | Details                                                        |
| --------------------------------- | -------------------------------------------------------------- |
| **Add / Complete / Delete Tasks** | Full CRUD with animated entry and exit transitions             |
| **IndexedDB Persistence**         | Tasks survive page reloads, browser restarts, and offline use  |
| **Circular Progress Ring**        | SVG ring fills to show % tasks completed, updates in real time |
| **Dynamic Greeting**              | "Good morning / afternoon / evening" based on system time      |
| **Today's Date**                  | Formatted full date displayed in the header                    |
| **Filter Tabs**                   | All / Active / Done views                                      |
| **Stats Row**                     | Live count of Total, Done, and Remaining tasks                 |
| **Clear Done**                    | Batch delete all completed tasks at once                       |
| **Editable Motivational Note**    | `contenteditable` note saved to `localStorage`                 |
| **Task Date**                     | Creation date shown on each task row                           |
| **Smooth Animations**             | Tasks slide in on add, animate out on delete                   |
| **Service Worker**                | Cache-first strategy — app loads offline after first visit     |
| **Web App Manifest**              | Installable on mobile homescreen and desktop                   |
| **Keyboard Shortcuts**            | `/` to focus input, `Esc` to blur                              |
| **Accessible Checkboxes**         | Custom checkboxes are keyboard-navigable with `Enter`/`Space`  |

---

## Technical Highlights

- **IndexedDB** with a clean Promise-based wrapper (`initDB`, `dbGetAll`, `dbPut`, `dbDelete`) — no external library
- **Service Worker** implements cache-first strategy: serves cached assets instantly, then revalidates
- **SVG ring** — circumference calculated as `2πr`, offset driven by `(1 - pct) * CIRC`
- **`contenteditable`** note with `blur`-to-save and Enter-to-blur patterns — no form element needed
- **Task sort** — incomplete tasks always rendered before completed ones, newest first within each group
- **Libre Baskerville + Jost** — editorial serif for headings, lightweight geometric sans for content
- **Grain texture** baked into CSS via an inline SVG data URI — no image file required

---

## Project Structure

```
momentum/
├── index.html       ← App shell, header, task list, modals
├── style.css        ← Warm dark design system, animations, accessible custom inputs
├── script.js        ← IndexedDB CRUD, ring logic, filter/sort, keyboard shortcuts
├── sw.js            ← Cache-first service worker
└── manifest.json    ← PWA metadata, icons, theme colour
```

---

## Design Decisions

- **Terracotta/rust palette** (`#C4622A`) — unlike generic blue or purple todo apps; feels like a premium physical planner
- **Circular ring** in the topbar gives instant progress feedback without any scrolling
- **Animation on delete** — tasks don't vanish; they slide right before removal, giving the user visual confirmation

---

## Run Locally

```bash
# PWA features require HTTPS or localhost
npx serve momentum/
# Visit http://localhost:3000
# Install via browser prompt on mobile or desktop
```

---

## What This Demonstrates

- Building and deploying a complete Progressive Web App from scratch
- IndexedDB API usage without a wrapper library
- Service Worker implementation with cache-first offline strategy
- Accessible custom UI components (checkboxes, contenteditable) without relying on browser defaults
- App manifest configuration for cross-platform installability
