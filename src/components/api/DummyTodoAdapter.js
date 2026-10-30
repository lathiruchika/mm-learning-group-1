import { ERROR_CODES, TodoApiError } from "./ApiError";
import { getItem, setItem } from "./StorageProvider";

// Dummy, backend-free implementation of the Todo REST-like contract.
// Persists to localStorage under `todo:{username}` as a JSON array of
// { id:number, description:string, done:boolean, targetDate:"YYYY-MM-DD" }.

const DEFAULT_DELAY_MS = 500;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SIMULATE_KEY = "dummy-api:simulate-error";

const storageKey = (username) => `todo:${username}`;
const seqKey = (username) => `todo-seq:${username}`;
const backupKey = (username) => `todo-backup:${username}`;

// ---------- configuration -------------------------------------------------

function readDelay() {
    const raw = import.meta.env.VITE_DUMMY_API_DELAY_MS;
    if (raw === undefined || raw === "") {
        return DEFAULT_DELAY_MS;
    }
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : DEFAULT_DELAY_MS;
}

function clampRate(value) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(Math.max(n, 0), 1) : 0;
}

let errorRate = clampRate(import.meta.env.VITE_DUMMY_API_ERROR_RATE);

// Failure simulation hooks (usable from tests or the browser console).
export function setSimulatedErrorRate(rate) {
    errorRate = clampRate(rate);
}

// When on, every call fails with SIMULATED_ERROR. Persisted in localStorage so
// it survives a refresh; best effort if storage is unavailable.
export function setSimulateErrors(enabled) {
    try {
        setItem(SIMULATE_KEY, enabled ? "1" : "0");
    } catch {
        /* ignore: toggle is best effort */
    }
}

function shouldFail() {
    let forced = false;
    try {
        forced = getItem(SIMULATE_KEY) === "1";
    } catch {
        forced = false;
    }
    return forced || (errorRate > 0 && Math.random() < errorRate);
}

async function simulateNetwork() {
    const delay = readDelay();
    if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
    }
    if (shouldFail()) {
        throw new TodoApiError(ERROR_CODES.SIMULATED_ERROR, "Simulated server error. Please try again.");
    }
}

// ---------- normalization -------------------------------------------------

const pad = (n) => String(n).padStart(2, "0");
const formatDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function normalizeDate(value) {
    if (typeof value === "string" && DATE_RE.test(value)) {
        return value;
    }
    if (value === null || value === undefined || value === "") {
        return "";
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? "" : formatDate(parsed);
}

function normalizeDone(value) {
    if (typeof value === "string") {
        return value.trim().toLowerCase() === "true";
    }
    return Boolean(value);
}

// Coerce a raw array into valid Todos. Non-objects are dropped; missing or
// duplicate ids are re-assigned.
function normalizeList(raw) {
    const used = new Set();
    const result = [];
    const pending = [];
    raw.forEach((item) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
            return;
        }
        const todo = {
            id: Number(item.id),
            description: item.description === undefined || item.description === null ? "" : String(item.description),
            done: normalizeDone(item.done),
            targetDate: normalizeDate(item.targetDate),
        };
        if (Number.isInteger(todo.id) && todo.id > 0 && !used.has(todo.id)) {
            used.add(todo.id);
            result.push(todo);
        } else {
            pending.push(todo);
        }
    });
    let next = used.size ? Math.max(...used) + 1 : 1;
    pending.forEach((todo) => {
        todo.id = next++;
        result.push(todo);
    });
    return result;
}

function seedTodos() {
    const today = new Date();
    const inDays = (n) => formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + n));
    return [
        { id: 1, description: "Learn React fundamentals", done: false, targetDate: inDays(7) },
        { id: 2, description: "Build the todo frontend", done: false, targetDate: inDays(14) },
        { id: 3, description: "Write project documentation", done: true, targetDate: inDays(-2) },
    ];
}

// ---------- storage access ------------------------------------------------

function persist(username, todos) {
    setItem(storageKey(username), JSON.stringify(todos));
}

// Missing data is seeded with defaults. An explicitly empty array ("[]") is
// respected so the empty state remains reachable. Unreadable data is backed up
// before being replaced; if that is not possible the defaults are returned for
// this call only, so a read never destroys what the user has stored.
function load(username) {
    const raw = getItem(storageKey(username));
    if (raw !== null) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return normalizeList(parsed);
            }
        } catch {
            /* corrupt JSON: handled below */
        }
        const seeded = seedTodos();
        try {
            setItem(backupKey(username), raw);
            persist(username, seeded);
        } catch {
            /* could not back up or write: original data stays untouched */
        }
        return seeded;
    }
    const seeded = seedTodos();
    try {
        persist(username, seeded);
    } catch {
        /* a read must not fail just because seeding could not be saved */
    }
    return seeded;
}

// Ids only ever increase, so an id freed by a delete is never handed out again.
function highestId(username, todos) {
    const stored = Number(getItem(seqKey(username)));
    return Math.max(Number.isInteger(stored) ? stored : 0, ...todos.map((t) => t.id), 0);
}

function nextId(username, todos) {
    const id = highestId(username, todos) + 1;
    setItem(seqKey(username), String(id));
    return id;
}

function notFound(id) {
    return new TodoApiError(ERROR_CODES.NOT_FOUND, `Todo with id ${id} was not found.`);
}

function validateInput(todo) {
    const fieldErrors = {};
    if (!todo || typeof todo.description !== "string" || todo.description.trim() === "") {
        fieldErrors.description = "Description is required.";
    }
    if (!todo || typeof todo.targetDate !== "string" || !DATE_RE.test(todo.targetDate)) {
        fieldErrors.targetDate = "Target date must be in YYYY-MM-DD format.";
    }
    if (Object.keys(fieldErrors).length) {
        throw new TodoApiError(ERROR_CODES.VALIDATION_ERROR, "Todo is invalid.", fieldErrors);
    }
}

// ---------- public API (axios-like responses: { data }) -------------------

export async function listTodos(username) {
    await simulateNetwork();
    return { data: load(username), status: 200 };
}

export async function getTodo(username, id) {
    await simulateNetwork();
    const found = load(username).find((t) => t.id === Number(id));
    if (!found) {
        throw notFound(id);
    }
    return { data: found, status: 200 };
}

export async function createTodo(username, todo) {
    await simulateNetwork();
    validateInput(todo);
    const todos = load(username);
    const created = {
        id: nextId(username, todos),
        description: todo.description.trim(),
        done: normalizeDone(todo.done),
        targetDate: todo.targetDate,
    };
    persist(username, [...todos, created]);
    return { data: created, status: 201 };
}

export async function updateTodo(username, id, todo) {
    await simulateNetwork();
    validateInput(todo);
    const todos = load(username);
    const index = todos.findIndex((t) => t.id === Number(id));
    if (index === -1) {
        throw notFound(id);
    }
    const updated = {
        id: todos[index].id,
        description: todo.description.trim(),
        done: normalizeDone(todo.done),
        targetDate: todo.targetDate,
    };
    const next = [...todos];
    next[index] = updated;
    persist(username, next);
    return { data: updated, status: 200 };
}

export async function deleteTodo(username, id) {
    await simulateNetwork();
    const todos = load(username);
    if (!todos.some((t) => t.id === Number(id))) {
        throw notFound(id);
    }
    setItem(seqKey(username), String(highestId(username, todos)));
    persist(username, todos.filter((t) => t.id !== Number(id)));
    return { data: null, status: 204 };
}
