import axios from "axios";
import { ERROR_CODES, TodoApiError } from "./ApiError";
import * as dummy from "./DummyTodoAdapter";
import { getStorageWarning } from "./StorageProvider";

// Facade used by the UI. Exported signatures are unchanged; every function
// resolves to an axios-like response ({ data }) and rejects with a
// TodoApiError ({ code, message }).
//
// VITE_TODO_API_MODE=dummy (default) -> localStorage-backed dummy adapter
// VITE_TODO_API_MODE=backend         -> axios against VITE_BACKEND_BASE_URL

export const API_MODE =
    String(import.meta.env.VITE_TODO_API_MODE || "dummy").toLowerCase() === "backend" ? "backend" : "dummy";

const useDummy = API_MODE === "dummy";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:8080",
});

function toApiError(error) {
    if (error instanceof TodoApiError) {
        return error;
    }
    if (error && error.response && error.response.status === 404) {
        return new TodoApiError(ERROR_CODES.NOT_FOUND, "The requested todo was not found.");
    }
    return new TodoApiError(ERROR_CODES.UNKNOWN, (error && error.message) || "Request failed.");
}

const backend = (request) => request.catch((error) => {
    throw toApiError(error);
});

// Warning text when the dummy adapter had to fall back to in-memory storage.
export const getStorageWarningMessage = () => (useDummy ? getStorageWarning() : null);

export const retrieveTodosForAllUsers =
    (username) => useDummy
        ? dummy.listTodos(username)
        : backend(apiClient.get(`/users/${username}/todos`));

export const deleteTodoApi =
    (username, id) => useDummy
        ? dummy.deleteTodo(username, id)
        : backend(apiClient.delete(`/users/${username}/todos/${id}`));

export const retrieveOneTodoApi =
    (username, id) => useDummy
        ? dummy.getTodo(username, id)
        : backend(apiClient.get(`/users/${username}/todos/${id}`));

export const updateTodoApi =
    (username, id, todo) => useDummy
        ? dummy.updateTodo(username, id, todo)
        : backend(apiClient.put(`/users/${username}/todos/${id}`, todo));

export const createTodoApi =
    (username, todo) => useDummy
        ? dummy.createTodo(username, todo)
        : backend(apiClient.post(`/users/${username}/todos`, todo));
