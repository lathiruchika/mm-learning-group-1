// API adapter: the single Todo API surface the UI imports.
//
// It selects the provider implementation based on VITE_API_MODE:
//   dummy -> dummyTodoProvider (localStorage, no network)
//   real  -> realTodoProvider (axios)
// Unset/unknown values default to "real" to preserve existing behavior.

import { dummyTodoProvider } from './providers/dummyTodoProvider.js'
import { realTodoProvider } from './providers/realTodoProvider.js'

const apiMode = import.meta.env.VITE_API_MODE || 'real'

export const todoApi = apiMode === 'dummy' ? dummyTodoProvider : realTodoProvider
