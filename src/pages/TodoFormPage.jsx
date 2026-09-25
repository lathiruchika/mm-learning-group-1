import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { useAuth } from "../auth/AuthContext";
import { getTodo, createTodo, updateTodo } from "../api/todoApi";
import { mapError } from "../api/errorMapper";
import InlineAlert from "../components/InlineAlert";
import LoadingSpinner from "../components/LoadingSpinner";

const isNew = (id) => id === "new";

const TodoFormPage = () => {
  const { username } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(!isNew(id));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isNew(id)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getTodo(username, id)
      .then((response) => {
        setDescription(response.data.description);
        setTargetDate(moment(response.data.targetDate).format("YYYY-MM-DD"));
        setDone(response.data.done);
      })
      .catch((err) => setFormError(err.userMessage || mapError(err)))
      .finally(() => setLoading(false));
  }, [id, username]);

  const validate = () => {
    const nextErrors = {};
    if (description.trim().length < 8) {
      nextErrors.description = "Description must be at least 8 characters";
    }
    if (!targetDate || !moment(targetDate).isValid()) {
      nextErrors.targetDate = "Please enter a valid date";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!validate()) {
      return;
    }

    const todo = { description: description.trim(), targetDate, done };
    setSubmitting(true);

    const request = isNew(id) ? createTodo(username, todo) : updateTodo(username, id, { ...todo, id });

    request
      .then(() => navigate("/todos"))
      .catch((err) => setFormError(err.userMessage || mapError(err)))
      .finally(() => setSubmitting(false));
  };

  if (loading) {
    return <LoadingSpinner label="Loading todo..." />;
  }

  return (
    <div className="container my-4 py-4">
      <h1 className="text text-center">Enter your Todo Details:</h1>
      <div className="d-flex justify-content-center m-5">
        <div style={{ width: "100%", maxWidth: 480 }}>
          <InlineAlert message={formError} testId="todo-form-error" />
          <form onSubmit={handleSubmit}>
            <fieldset className="form-group">
              <label>Description</label>
              <input
                type="text"
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                data-testid="todo-desc"
              />
              {errors.description && <div className="text-danger small">{errors.description}</div>}
            </fieldset>
            <fieldset className="form-group">
              <label>Target Date</label>
              <input
                type="date"
                className="form-control"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                data-testid="todo-date"
              />
              {errors.targetDate && <div className="text-danger small">{errors.targetDate}</div>}
            </fieldset>
            <fieldset className="form-group form-check my-3">
              <input
                type="checkbox"
                className="form-check-input"
                checked={done}
                onChange={(e) => setDone(e.target.checked)}
                data-testid="todo-done"
                id="todo-done-checkbox"
              />
              <label className="form-check-label" htmlFor="todo-done-checkbox">
                Done
              </label>
            </fieldset>
            <button
              className="btn btn-success m-1 py-2 px-4 d-inline-flex align-items-center gap-2"
              type="submit"
              disabled={submitting}
              data-testid="todo-save"
            >
              {submitting && <span className="spinner-border spinner-border-sm" aria-hidden="true" />}
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TodoFormPage;
