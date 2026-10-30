// Visible indicator of the active API mode (EPMCDMETST-70447).
// Prevents demo confusion — always visible in the app header.

import { API_MODE, DUMMY_FAIL_RATE, DUMMY_LATENCY_MS } from '../config/apiConfig.js'

function ApiModeBadge() {
  const isDummy = API_MODE !== 'real'
  const label = isDummy ? 'DUMMY API' : 'REAL API'
  const hints = []
  if (isDummy && DUMMY_LATENCY_MS > 0) hints.push(`${DUMMY_LATENCY_MS}ms latency`)
  if (isDummy && DUMMY_FAIL_RATE > 0) hints.push(`${Math.round(DUMMY_FAIL_RATE * 100)}% fail`)

  return (
    <span
      className={`api-mode-badge api-mode-badge--${isDummy ? 'dummy' : 'real'}`}
      data-testid="api-mode-badge"
      aria-label={`API mode: ${isDummy ? 'dummy' : 'real'}${hints.length ? ', ' + hints.join(', ') : ''}`}
      title={`VITE_API_MODE=${API_MODE}${hints.length ? ' | ' + hints.join(', ') : ''}`}
    >
      <span aria-hidden="true">{isDummy ? '🗄' : '🌐'}</span>
      {' '}{label}
      {hints.length > 0 && <span className="api-mode-badge__hint"> ({hints.join(', ')})</span>}
    </span>
  )
}

export default ApiModeBadge
