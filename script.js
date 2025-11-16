// DOM elements
const input = document.getElementById("todo-input");
const addBtn = document.getElementById("add-btn");
const list = document.getElementById("todo-list");
const searchInput = document.getElementById("search-input");
const filterButtons = document.querySelectorAll(".filter-btn");
const taskCountEl = document.getElementById("task-count");
const completedCountEl = document.getElementById("completed-count");
const clearCompletedBtn = document.getElementById("clear-completed");
const clearAllBtn = document.getElementById("clear-all");
const emptyStateEl = document.getElementById("empty-state");

// Load todos from localStorage
const saved = localStorage.getItem("todos-advanced");
let todos = saved ? JSON.parse(saved) : [];

let currentFilter = "all";
let currentSearch = "";

// Save todos
function saveTodos() {
  localStorage.setItem("todos-advanced", JSON.stringify(todos));
}

// Render list
function render() {
  list.innerHTML = "";

  let filtered = todos.filter((t) => {
    // Filter (all/active/completed)
    if (currentFilter === "active" && t.completed) return false;
    if (currentFilter === "completed" && !t.completed) return false;

    // Search filter
    if (currentSearch.trim() !== "") {
      const q = currentSearch.toLowerCase();
      if (!t.text.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  filtered.forEach((todo, index) => {
    const li = document.createElement("li");
    li.className = "todo-item";

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-checkbox";
    checkbox.checked = !!todo.completed;

    // Text
    const span = document.createElement("span");
    span.className = "todo-text";
    span.textContent = todo.text;
    if (todo.completed) {
      span.classList.add("completed");
    }

    // Double click to edit
    span.addEventListener("dblclick", () => {
      startEdit(li, span, todo);
    });

    // Checkbox change
    checkbox.addEventListener("change", () => {
      todo.completed = checkbox.checked;
      if (todo.completed) span.classList.add("completed");
      else span.classList.remove("completed");
      updateCounts();
      saveTodos();
      render(); // to reapply filters
    });

    // Delete button
    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "×";
    delBtn.addEventListener("click", () => {
      li.classList.add("removing");
      setTimeout(() => {
        const idx = todos.indexOf(todo);
        if (idx > -1) todos.splice(idx, 1);
        updateCounts();
        saveTodos();
        render();
      }, 180);
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(delBtn);
    list.appendChild(li);
  });

  emptyStateEl.style.display = todos.length === 0 ? "block" : "none";
  updateCounts();
}

// Edit inline
function startEdit(li, span, todo) {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "edit-input";
  input.value = todo.text;

  // Replace span with input
  li.replaceChild(input, span);
  input.focus();
  input.select();

  function finishEdit(save) {
    if (save) {
      const newText = input.value.trim();
      if (newText) {
        todo.text = newText;
      }
    }
    li.replaceChild(span, input);
    span.textContent = todo.text;
    saveTodos();
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      finishEdit(true);
    } else if (e.key === "Escape") {
      finishEdit(false);
    }
  });

  input.addEventListener("blur", () => {
    finishEdit(true);
  });
}

// Add todo
function addTodo() {
  const text = input.value.trim();
  if (!text) return;

  todos.push({
    text,
    completed: false,
    createdAt: Date.now(),
  });

  input.value = "";
  saveTodos();
  render();
}

// Update counts
function updateCounts() {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  taskCountEl.textContent = `${total} task${total === 1 ? "" : "s"}`;
  completedCountEl.textContent = `${completed} completed`;
}

// Event listeners
addBtn.addEventListener("click", addTodo);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addTodo();
  }
});

// Search filter
searchInput.addEventListener("input", (e) => {
  currentSearch = e.target.value;
  render();
});

// Filter buttons
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  });
});

// Clear completed
clearCompletedBtn.addEventListener("click", () => {
  todos = todos.filter((t) => !t.completed);
  saveTodos();
  render();
});

// Clear all
clearAllBtn.addEventListener("click", () => {
  if (todos.length === 0) return;
  if (!confirm("Clear all tasks?")) return;
  todos = [];
  saveTodos();
  render();
});

// Initial render
render();
