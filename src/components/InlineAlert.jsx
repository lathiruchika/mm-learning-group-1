import PropTypes from "prop-types";

const InlineAlert = ({ message, variant = "danger", onRetry, testId }) => {
  if (!message) {
    return null;
  }

  return (
    <div className={`alert alert-${variant} d-flex justify-content-between align-items-center`} data-testid={testId}>
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onRetry} data-testid="todo-retry">
          Retry
        </button>
      )}
    </div>
  );
};

InlineAlert.propTypes = {
  message: PropTypes.string,
  variant: PropTypes.string,
  onRetry: PropTypes.func,
  testId: PropTypes.string,
};

export default InlineAlert;
