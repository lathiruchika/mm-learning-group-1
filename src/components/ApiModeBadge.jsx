// Visible indicator of the active API mode (EPMCDMETST-70447).
// Prevents demo confusion — always visible in the app header.

import { API_MODE, DUMMY_FAIL, DUMMY_LATENCY_MS } from '../config/apiConfig.js'

function ApiModeBadge() {
  const isDummy = API_MODE !== 'real'
  const label = isDummy ? '🗄 DUMMY API' : '🌐 REAL API'
  const hints = []
  if (isDummy && DUMMY_LATENCY_MS > 0) hints.push(`${DUMMY_LATENCY_MS}ms latency`)
  if (isDummy && DUMMY_FAIL) hints.push('FAIL mode ON')

  return (
    <span
      className={`api-mode-badge api-mode-badge--${isDummy ? 'dummy' : 'real'}`}
      data-testid="api-mode-badge"
      title={`VITE_API_MODE=${API_MODE}${hints.length ? ' | ' + hints.join(', ') : ''}`}
    >
      {label}
      {hints.length > 0 && <span className="api-mode-badge__hint"> ({hints.join(', ')})</span>}
    </span>
  )
}

export default ApiModeBadge
