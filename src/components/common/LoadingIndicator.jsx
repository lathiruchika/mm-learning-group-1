const LoadingIndicator = ({ label = "Loading...", testId }) => (
    <div className="d-flex justify-content-center align-items-center my-4" role="status" aria-live="polite" data-testid={testId}>
        <div className="spinner-border text-success me-2" aria-hidden="true"></div>
        <span>{label}</span>
    </div>
);

export default LoadingIndicator;
