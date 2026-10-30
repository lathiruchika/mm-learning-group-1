// Real API provider — wraps fetch calls to the Spring Boot backend.
// Set VITE_API_MODE=real and VITE_API_BASE_URL=<backend> to activate.

import { API_BASE_URL } from '../config/apiConfig.js'

async function handleResponse(res) {
  if (res.status === 204) return          // DELETE returns no body
  if (!res.ok) {
    // Try to parse a JSON error body; fall back to raw text.
    const contentType = res.headers.get('content-type') ?? ''
    let message
    if (contentType.includes('application/json')) {
      const body = await res.json().catch(() => null)
      message = body?.message ?? body?.error ?? JSON.stringify(body)
    } else {
      message = await res.text().catch(() => '')
    }
    throw new Error(`API error ${res.status}${message ? ': ' + message : ''}`)
  }
  return res.json()
}

export const realTodoApi = {
  async getTodos(username) {
    const res = await fetch(
      `${API_BASE_URL}/users/${encodeURIComponent(username)}/todos`
    )
    return handleResponse(res)
  },

  async getTodo(username, id) {
    const res = await fetch(
      `${API_BASE_URL}/users/${encodeURIComponent(username)}/todos/${encodeURIComponent(id)}`
    )
    return handleResponse(res)
  },

  async createTodo(username, data) {
    const res = await fetch(
      `${API_BASE_URL}/users/${encodeURIComponent(username)}/todos`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    )
    return handleResponse(res)
  },

  async updateTodo(username, id, data) {
    const res = await fetch(
      `${API_BASE_URL}/users/${encodeURIComponent(username)}/todos/${encodeURIComponent(id)}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    )
    return handleResponse(res)
  },

  async deleteTodo(username, id) {
    const res = await fetch(
      `${API_BASE_URL}/users/${encodeURIComponent(username)}/todos/${encodeURIComponent(id)}`,
      { method: 'DELETE' }
    )
    return handleResponse(res)
  },
}
