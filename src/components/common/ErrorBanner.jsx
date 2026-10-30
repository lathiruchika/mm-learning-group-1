const ErrorBanner = ({ message, onRetry, retryLabel = "Retry", testId, retryTestId, variant = "danger" }) => {
    if (!message) {
        return null;
    }
    return (
        <div className={`alert alert-${variant} d-flex justify-content-between align-items-center`} role="alert" data-testid={testId}>
            <span>{message}</span>
            {onRetry && (
                <button type="button" className="btn btn-sm btn-outline-dark ms-3" onClick={onRetry} data-testid={retryTestId}>
                    {retryLabel}
                </button>
            )}
        </div>
    );
};

export default ErrorBanner;
