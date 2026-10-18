/**
 * Single selection point for the active TodoService implementation.
 *
 * The UI imports `todoService` from here and never references a concrete
 * implementation directly, so switching mock <-> real is centralized.
 *
 * Mode is controlled by the env var VITE_TODO_API_MODE:
 *   - "mock" (default): localStorage-backed, no backend required.
 *   - "real": backend-backed (see realTodoService.js; requires a backend).
 *
 * @typedef {import('./types.js').TodoService} TodoService
 */

import { mockTodoService } from './mockTodoService.js'
import { realTodoService } from './realTodoService.js'

/** Default username used in demo-safe mode (no login in this app yet). */
export const DEMO_USER = 'demo'

/** Resolve the configured mode, defaulting to "mock". */
export function getTodoApiMode() {
  const mode = import.meta.env?.VITE_TODO_API_MODE
  return mode === 'real' ? 'real' : 'mock'
}

/** @returns {TodoService} */
export function getTodoService() {
  return getTodoApiMode() === 'real' ? realTodoService : mockTodoService
}

/** The active service instance for the current mode. */
export const todoService = getTodoService()
