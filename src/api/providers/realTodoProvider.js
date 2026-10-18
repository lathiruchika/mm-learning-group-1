// Real Todo provider: axios-backed, talks to the Spring Boot backend.
//
// Base URL comes from VITE_API_BASE_URL (defaults to http://localhost:8080 for
// backward compatibility). Endpoints follow the existing backend contract:
//   GET    /users/{username}/todos
//   GET    /users/{username}/todos/{id}
//   POST   /users/{username}/todos
//   PUT    /users/{username}/todos/{id}
//   DELETE /users/{username}/todos/{id}

import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const http = axios.create({ baseURL })

export const realTodoProvider = {
  async listTodos(username) {
    const { data } = await http.get(`/users/${username}/todos`)
    return data
  },

  async getTodo(username, id) {
    const { data } = await http.get(`/users/${username}/todos/${id}`)
    return data
  },

  async createTodo(username, todo) {
    const { data } = await http.post(`/users/${username}/todos`, todo)
    return data
  },

  async updateTodo(username, id, todo) {
    const { data } = await http.put(`/users/${username}/todos/${id}`, todo)
    return data
  },

  async deleteTodo(username, id) {
    const { data } = await http.delete(`/users/${username}/todos/${id}`)
    return data
  },
}
