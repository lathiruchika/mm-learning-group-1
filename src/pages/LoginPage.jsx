import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import InlineAlert from "../components/InlineAlert";

const LoginPage = () => {
  const { login, sessionMessage, clearSessionMessage } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const nextErrors = {};
    if (username.trim().length < 2) {
      nextErrors.username = "Username must be at least 2 characters";
    }
    if (password.length < 4) {
      nextErrors.password = "Password must be at least 4 characters";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    clearSessionMessage();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    const result = await login(username.trim(), password);
    setSubmitting(false);

    if (result.success) {
      navigate(`/welcome/${username.trim()}`);
    } else {
      setSubmitError(result.message);
    }
  };

  return (
    <div className="container py-5 my-lg-1">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h1>Login</h1>

          <InlineAlert message={sessionMessage} variant="info" />
          <InlineAlert message={submitError} testId="login-error" />

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>User Name:</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="login-username"
              />
              {errors.username && <div className="text-danger small">{errors.username}</div>}
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="login-password"
              />
              {errors.password && <div className="text-danger small">{errors.password}</div>}
            </div>
            <div className="form-group">
              <button
                type="submit"
                className="btn btn-primary my-4 d-inline-flex align-items-center gap-2"
                disabled={submitting}
                data-testid="login-submit"
              >
                {submitting && <span className="spinner-border spinner-border-sm" aria-hidden="true" />}
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
