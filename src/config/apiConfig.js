// Central env-var reader. All VITE_ vars go through here so components
// never touch import.meta.env directly.
//
// VITE_API_MODE      = 'dummy' | 'real'   (default: 'dummy')
// VITE_DUMMY_API_LATENCY_MS               (default: 0  — off)
// VITE_DUMMY_API_FAIL = 'true'            (default: false — off)
// VITE_APP_USERNAME                       (default: 'demo-user')
// VITE_API_BASE_URL                       (default: 'http://localhost:8080')

export const API_MODE = import.meta.env.VITE_API_MODE ?? 'dummy'
export const DUMMY_LATENCY_MS = Number(import.meta.env.VITE_DUMMY_API_LATENCY_MS ?? 0)
// VITE_DUMMY_FAIL_RATE: 0 = never fail, 1 = always fail, 0.3 = 30% chance (EPMCDMETST-70448)
export const DUMMY_FAIL_RATE = Math.min(1, Math.max(0, Number(import.meta.env.VITE_DUMMY_FAIL_RATE ?? 0)))
export const APP_USERNAME = import.meta.env.VITE_APP_USERNAME ?? 'demo-user'
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
