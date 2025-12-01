import { useEffect, useMemo, useRef, useState } from "react";
import type { MetaFunction } from "@remix-run/node";
import { createItem, loadItems, saveItems, type TodoItem } from "~/utils/storage";

export const meta: MetaFunction = () => {
  return [
    { title: "To‑Do List — Ocean Professional" },
    { name: "description", content: "Add, view, complete, and delete tasks. Local-only persistence." },
  ];
};

type Filter = "all" | "active" | "completed";

export default function Index() {
  const [items, setItems] = useState<TodoItem[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const inputRef = useRef<HTMLInputElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  // Load on mount
  useEffect(() => {
    const loaded = loadItems();
    setItems(loaded);
  }, []);

  // Persist on change
  useEffect(() => {
    saveItems(items);
  }, [items]);

  const remaining = useMemo(() => items.filter((i) => !i.completed).length, [items]);

  const filteredItems = useMemo(() => {
    switch (filter) {
      case "active":
        return items.filter((i) => !i.completed);
      case "completed":
        return items.filter((i) => i.completed);
      default:
        return items;
    }
  }, [items, filter]);

  function handleAdd() {
    const title = input.trim();
    if (!title) {
      setError("Please enter a task.");
      inputRef.current?.focus();
      return;
    }
    if (title.length > 256) {
      setError("Task is too long (max 256 characters).");
      inputRef.current?.focus();
      return;
    }
    const newItem = createItem(title);
    setItems((prev) => [newItem, ...prev]);
    setInput("");
    setError(null);
    // move focus back to input for fast entry
    inputRef.current?.focus();
  }

  function handleToggle(id: string) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i))
    );
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    // Try to keep keyboard focus in a sensible place
    addButtonRef.current?.focus();
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  return (
    <div className="app-container">
      <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <header className="mb-6 sm:mb-8">
          <h1
            className="header-title text-3xl sm:text-4xl"
            style={{ color: "var(--color-primary)" }}
          >
            To‑Do List
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Stay organized. Add tasks, mark complete, and keep track of what&apos;s left.
          </p>
        </header>

        <section className="card p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label htmlFor="todo-input" className="visually-hidden">
              Add a new task
            </label>
            <input
              id="todo-input"
              ref={inputRef}
              className="input"
              type="text"
              placeholder="What needs to be done?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onInputKeyDown}
              aria-invalid={!!error}
              aria-describedby={error ? "todo-input-error" : undefined}
            />
            <button
              ref={addButtonRef}
              type="button"
              className="btn btn-primary w-full sm:w-auto"
              onClick={handleAdd}
              aria-label="Add task"
            >
              Add
            </button>
          </div>
          {error ? (
            <p id="todo-input-error" className="mt-2 text-sm" style={{ color: "var(--color-error)" }}>
              {error}
            </p>
          ) : null}

          <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="filter-tabs" role="tablist" aria-label="Filter tasks">
              <button
                type="button"
                role="tab"
                aria-selected={filter === "all"}
                tabIndex={filter === "all" ? 0 : -1}
                className="tab"
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={filter === "active"}
                tabIndex={filter === "active" ? 0 : -1}
                className="tab"
                onClick={() => setFilter("active")}
              >
                Active
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={filter === "completed"}
                tabIndex={filter === "completed" ? 0 : -1}
                className="tab"
                onClick={() => setFilter("completed")}
              >
                Completed
              </button>
            </div>

            <div className="counter text-sm">
              {remaining} item{remaining === 1 ? "" : "s"} left
            </div>
          </div>
        </section>

        <section className="mt-4 sm:mt-6 card p-3 sm:p-4">
          {filteredItems.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No tasks {filter !== "all" ? `in ${filter}` : ""}. Add your first task above.
            </div>
          ) : (
            <ul className="list" aria-live="polite">
              {filteredItems.map((item) => (
                <li
                  key={item.id}
                  className={`item ${item.completed ? "item-completed" : ""}`}
                >
                  <input
                    id={`toggle-${item.id}`}
                    type="checkbox"
                    className="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggle(item.id)}
                    aria-label={item.completed ? "Mark as active" : "Mark as completed"}
                  />
                  <label
                    htmlFor={`toggle-${item.id}`}
                    className="item-title cursor-pointer"
                  >
                    {item.title}
                  </label>
                  <div className="item-actions">
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleDelete(item.id)}
                      aria-label={`Delete "${item.title}"`}
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
