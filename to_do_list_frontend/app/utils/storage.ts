export type TodoItem = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
};

const STORAGE_KEY = "todo-items-v1";

/**
 * PUBLIC_INTERFACE
 * Load items from localStorage.
 */
export function loadItems(): TodoItem[] {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TodoItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((i) => ({
      id: String(i.id),
      title: String(i.title ?? "").slice(0, 512),
      completed: Boolean(i.completed),
      createdAt: typeof i.createdAt === "number" ? i.createdAt : Date.now(),
    }));
  } catch {
    return [];
  }
}

/**
 * PUBLIC_INTERFACE
 * Persist items to localStorage.
 */
export function saveItems(items: TodoItem[]) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore write errors (e.g., storage full)
  }
}

/**
 * PUBLIC_INTERFACE
 * Create a new todo item.
 */
export function createItem(title: string): TodoItem {
  const id = cryptoRandomId();
  return {
    id,
    title: title.trim(),
    completed: false,
    createdAt: Date.now(),
  };
}

function cryptoRandomId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      // @ts-expect-error TS doesn't know randomUUID is always there in modern browsers
      return crypto.randomUUID();
    }
  } catch {
    // ignore
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
