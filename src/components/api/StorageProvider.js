import { ERROR_CODES, TodoApiError } from "./ApiError";

// Thin wrapper over window.localStorage. If localStorage is unavailable
// (blocked or private mode) we fall back to an in-memory Map and expose a
// warning so the UI can tell the user that data will not survive a refresh.

const memoryStore = new Map();
let persistent = false;
let warned = false;

export const STORAGE_WARNING =
    "Browser storage is unavailable. Your todos are kept in memory only and will be lost when you refresh the page.";

// Only checks that localStorage is reachable. Write failures (e.g. quota full)
// surface from setItem instead of silently hiding the user's stored data, and a
// failed probe is retried rather than cached for the whole session.
function probe() {
    if (persistent) {
        return true;
    }
    try {
        window.localStorage.getItem("__todo_storage_probe__");
        persistent = true;
    } catch {
        if (!warned) {
            warned = true;
            console.warn(STORAGE_WARNING);
        }
    }
    return persistent;
}

export const isStoragePersistent = () => probe();

export const getStorageWarning = () => (probe() ? null : STORAGE_WARNING);

export function getItem(key) {
    if (probe()) {
        try {
            return window.localStorage.getItem(key);
        } catch {
            throw new TodoApiError(ERROR_CODES.STORAGE_UNAVAILABLE, "Unable to read from browser storage.");
        }
    }
    return memoryStore.has(key) ? memoryStore.get(key) : null;
}

export function setItem(key, value) {
    if (probe()) {
        try {
            window.localStorage.setItem(key, value);
            return;
        } catch {
            throw new TodoApiError(
                ERROR_CODES.STORAGE_UNAVAILABLE,
                "Unable to write to browser storage (it may be full or blocked)."
            );
        }
    }
    memoryStore.set(key, value);
}
