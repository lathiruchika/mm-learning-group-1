const EmptyState = ({ title, message, actionLabel, onAction, testId, actionTestId }) => (
    <div className="text-center my-5 p-4 border rounded" data-testid={testId}>
        <h5>{title}</h5>
        {message && <p className="text-muted">{message}</p>}
        {actionLabel && onAction && (
            <button type="button" className="btn btn-success" onClick={onAction} data-testid={actionTestId}>
                {actionLabel}
            </button>
        )}
    </div>
);

export default EmptyState;
