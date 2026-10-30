// Reusable error banner with optional retry button.
function ErrorBanner({ message, onRetry, testId = 'error-banner' }) {
  if (!message) return null
  return (
    <div className="error-banner" data-testid={testId} role="alert">
      <span className="error-banner__icon">⚠</span>
      <span className="error-banner__msg">{message}</span>
      {onRetry && (
        <button className="error-banner__retry" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  )
}

export default ErrorBanner
