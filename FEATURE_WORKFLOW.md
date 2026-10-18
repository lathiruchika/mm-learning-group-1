# Feature Development Workflow

This guide outlines how to systematically add new features to the todo app while keeping commits clean and isolated.

## Current Baseline (Limited Features)

**Core Features Only:**
- ✅ Add a todo
- ✅ Display todos in a list
- ✅ Toggle complete/incomplete status
- ✅ Delete a todo
- ✅ Persist to localStorage

**Intentionally Excluded:**
- ❌ Filtering (All/Active/Completed)
- ❌ Inline editing
- ❌ Due dates / Priority
- ❌ Categories / Tags
- ❌ Search
- ❌ Backend API integration
- ❌ Authentication
- ❌ Advanced styling / themes

---

## Workflow Template for Adding Features

### Step 1: Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# Example: feature/add-filtering
```

### Step 2: Plan Your Changes

**Files likely to change:**

| Feature | Modified Files | New Files |
|---------|---------------|-----------|
| **Filtering** | `App.jsx`, `AddTodoForm.jsx` | `components/FilterBar.jsx` |
| **Inline Edit** | `App.jsx`, `TodoItem.jsx` | — |
| **Due Dates** | `App.jsx`, `AddTodoForm.jsx`, `TodoItem.jsx` | — |
| **Priority** | `App.jsx`, `TodoItem.jsx` | `components/PrioritySelect.jsx` |
| **Search** | `App.jsx` | `components/SearchBar.jsx` |
| **Backend API** | `App.jsx` (replace localStorage) | `services/todoApi.js` |

### Step 3: Implement Incrementally

1. **Extend the todo shape** (if needed):
   ```js
   // Before
   { id, text, completed }
   
   // After (with due date)
   { id, text, completed, dueDate }
   ```

2. **Update `App.jsx` logic** (handlers, state):
   ```js
   function addTodo(text, dueDate) { /* ... */ }
   function editTodo(id, updates) { /* ... */ }
   ```

3. **Create/modify components**:
   - Add UI for the new feature
   - Wire it into the parent

4. **Update `index.css`** for styling.

### Step 4: Test Locally

```bash
npm run dev
# Test the feature manually in the browser
# Check localStorage: localStorage.getItem('todos')
```

### Step 5: Commit with Clear Message

```bash
git add .
git commit -m "feat: add filtering (All / Active / Completed)

- Add FilterBar component
- Derive filtered todo list in App.jsx
- Persist filter state to localStorage
- Update styles for filter buttons"
```

### Step 6: Push and Create PR (Optional)

```bash
git push origin feature/your-feature-name
# Create PR on GitHub for review
```

### Step 7: Merge to Main

```bash
git checkout main
git merge feature/your-feature-name
git push origin main
```

---

## Feature Ideas (in suggested order)

### Tier 1: UI Enhancements (Easy)
1. **Filter Bar** — Show All / Active / Completed
2. **Clear Completed** — Bulk delete completed todos
3. **Better Styling** — Add color, icons, animations

### Tier 2: Data Extensions (Medium)
4. **Due Dates** — Add date picker, show due soon badges
5. **Priority Levels** — Low / Medium / High
6. **Categories / Tags** — Organize todos

### Tier 3: Advanced Features (Hard)
7. **Inline Editing** — Click to edit todo text
8. **Search** — Filter by keyword
9. **Undo/Redo** — Command history
10. **Backend API** — Sync to a server

---

## Key Principles

✅ **One feature per branch/commit**
- Keeps history clean and reviewable

✅ **Extend, don't refactor**
- Add new features without rewriting existing code

✅ **Preserve localStorage structure**
- New fields should be optional to avoid breaking old data

✅ **Test incrementally**
- Each commit should be testable in the browser

✅ **Keep components focused**
- Each component has one job (responsibility principle)

---

## Example: Adding Filter Feature

### Commit 1: Create FilterBar component
```bash
git commit -m "feat: create FilterBar component

- New FilterBar.jsx with All/Active/Completed buttons
- Accept activeFilter prop and onChange callback
- Add basic styling"
```

### Commit 2: Wire into App.jsx
```bash
git commit -m "feat: integrate FilterBar with App

- Add filterActive state in App.jsx
- Derive filtered list based on filterActive
- Pass to FilterBar and TodoList"
```

### Commit 3: Persist filter to localStorage
```bash
git commit -m "feat: persist filter preference to localStorage

- Save/load filterActive state
- Apply last-used filter on page reload"
```

---

## Tips

- **Use browser DevTools** to inspect `localStorage`:
  ```js
  localStorage.getItem('todos') // view current todos
  localStorage.clear()          // reset (careful!)
  ```

- **Component reusability**:
  - `AddTodoForm` can be extended for editing
  - `TodoItem` can house nested interactions

- **Testing helpers**:
  ```bash
  # Build and preview production version
  npm run build && npm run preview
  
  # Check bundle size
  npm run build -- --report
  ```

---

Good luck building! 🚀
