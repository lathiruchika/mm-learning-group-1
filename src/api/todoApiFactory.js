// Selects the active API provider based on VITE_API_MODE.
// Import `todoApi` everywhere instead of a specific provider so the
// swap is transparent to all callers.

import { API_MODE } from '../config/apiConfig.js'
import { dummyTodoApi } from './dummyTodoApi.js'
import { realTodoApi } from './realTodoApi.js'

export function getApi() {
  return API_MODE === 'real' ? realTodoApi : dummyTodoApi
}

export const todoApi = getApi()
