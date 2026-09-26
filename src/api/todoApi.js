import apiClient from "./apiClient";

export const getTodos = (username) => apiClient.get(`/users/${username}/todos`);

export const getTodo = (username, id) => apiClient.get(`/users/${username}/todos/${id}`);

export const createTodo = (username, todo) => apiClient.post(`/users/${username}/todos`, todo);

export const updateTodo = (username, id, todo) => apiClient.put(`/users/${username}/todos/${id}`, todo);

export const deleteTodo = (username, id) => apiClient.delete(`/users/${username}/todos/${id}`);
