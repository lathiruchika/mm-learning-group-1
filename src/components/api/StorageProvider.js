import { ERROR_CODES, TodoApiError } from "./ApiError";

// Thin wrapper over window.localStorage. If localStorage is unavailable
// (blocked or private mode) we fall back to an in-memory Map and expose a
// warning so the UI can tell the user that data will not survive a refresh.

const memoryStore = new Map();
let persistent = null;

export const STORAGE_WARNING =
    "Browser storage is unavailable. Your todos are kept in memory only and will be lost when you refresh the page.";

function probe() {
    if (persistent !== null) {
        return persistent;
    }
    try {
        const key = "__todo_storage_probe__";
        window.localStorage.setItem(key, "1");
        window.localStorage.removeItem(key);
        persistent = true;
    } catch {
        persistent = false;
        console.warn(STORAGE_WARNING);
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
