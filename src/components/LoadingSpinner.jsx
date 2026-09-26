import PropTypes from "prop-types";

const LoadingSpinner = ({ label = "Loading..." }) => (
  <div className="d-flex align-items-center gap-2 py-3" role="status">
    <div className="spinner-border spinner-border-sm text-primary" aria-hidden="true" />
    <span>{label}</span>
  </div>
);

LoadingSpinner.propTypes = {
  label: PropTypes.string,
};

export default LoadingSpinner;
