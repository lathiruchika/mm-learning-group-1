import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./security/AuthProvider";
import { createTodoApi, retrieveOneTodoApi, updateTodoApi } from "./api/TodoApi";
import { ERROR_CODES, getErrorMessage } from "./api/ApiError";
import { useCallback, useEffect, useRef, useState } from "react";
import { Field, Form, Formik } from "formik";
import { validateTodo } from "./todoValidation";
import ErrorBanner from "./common/ErrorBanner";
import LoadingIndicator from "./common/LoadingIndicator";

const UpdateTodoPage = () => {

  const authContext = useAuth();
  const username = authContext.username;
  const { id } = useParams();
  const isCreate = Number(id) === -1;
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState({ description: "", targetDate: "", done: false });
  const [loading, setLoading] = useState(!isCreate);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Only the most recent load may update state, so a stale response (Retry,
  // StrictMode double effect, navigating to another todo, unmount) is ignored.
  const latestRequest = useRef(0);

  const retrieveOneTodoForUpdate = useCallback(() => {
    const requestId = ++latestRequest.current;
    const isCurrent = () => requestId === latestRequest.current;
    if (isCreate) {
      setInitialValues({ description: "", targetDate: "", done: false });
      setNotFound(false);
      setLoadError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    setLoadError(null);
    retrieveOneTodoApi(username, id)
      .then(response => {
        if (!isCurrent()) return;
        setInitialValues({
          description: response.data.description,
          targetDate: response.data.targetDate,
          done: Boolean(response.data.done),
        })
      })
      .catch(error => {
        if (!isCurrent()) return;
        if (error && error.code === ERROR_CODES.NOT_FOUND) {
          setNotFound(true)
        } else {
          setLoadError(getErrorMessage(error, "Unable to load the todo."))
        }
      })
      .finally(() => {
        if (isCurrent()) setLoading(false)
      })
  }, [username, id, isCreate])

  useEffect(() => {
    const counter = latestRequest
    retrieveOneTodoForUpdate()
    return () => {
      counter.current++
    }
  }, [retrieveOneTodoForUpdate])

  async function onSubmit(values) {
    setSubmitError(null)

    const todo = {
      id: id,
      username: username,
      description: values.description.trim(),
      targetDate: values.targetDate,
      done: values.done
    }

    try {
      if (isCreate) {
        await createTodoApi(username, todo)
      } else {
        await updateTodoApi(username, id, todo)
      }
      navigate("/list-todos")
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Unable to save the todo."))
    }
  }

  if (loading) {
    return (
      <div className="container my-4 py-4">
        <LoadingIndicator label="Loading todo..." testId="todo-form-loading" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="container my-4 py-4 text-center" data-testid="todo-not-found">
        <h2>Todo not found</h2>
        <p className="text-muted">The todo you are looking for does not exist or was deleted.</p>
        <button type="button" className="btn btn-success" onClick={() => navigate("/list-todos")}>
          Back to todos
        </button>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="container my-4 py-4">
        <ErrorBanner
          message={loadError}
          onRetry={retrieveOneTodoForUpdate}
          testId="todo-form-error-banner"
          retryTestId="todo-form-retry"
        />
        <div className="text-center">
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/list-todos")}>
            Back to todos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container  my-4 py-4">
      <h1 className="text text-center">
        Enter your Todo Details:
      </h1>
      <div className="d-flex justify-content-center m-5">
        <Formik
          key={id}
          initialValues={initialValues}
          onSubmit={onSubmit}
          validate={validateTodo}
          validateOnMount={true}
          validateOnChange={true}
          validateOnBlur={true}
        >
          {
            ({ errors, touched, values, isSubmitting }) => {
              const isInvalid = Object.keys(validateTodo(values)).length > 0;
              return (
                <Form data-testid="todo-form" noValidate>
                  <ErrorBanner message={submitError} testId="todo-form-error-banner" />
                  <fieldset className="form-group mb-3">
                    <label htmlFor="description">Description</label>
                    <Field
                      id="description"
                      type="text"
                      className={`form-control ${touched.description && errors.description ? "is-invalid" : ""}`}
                      name="description"
                      data-testid="todo-field-description"
                      aria-invalid={Boolean(touched.description && errors.description)}
                    />
                    {touched.description && errors.description && (
                      <div className="text-danger small mt-1" role="alert" data-testid="todo-error-description">{errors.description}</div>
                    )}
                  </fieldset>
                  <fieldset className="form-group mb-3">
                    <label htmlFor="targetDate">Target Date</label>
                    <Field
                      id="targetDate"
                      type="date"
                      className={`form-control ${touched.targetDate && errors.targetDate ? "is-invalid" : ""}`}
                      name="targetDate"
                      data-testid="todo-field-targetDate"
                      aria-invalid={Boolean(touched.targetDate && errors.targetDate)}
                    />
                    {touched.targetDate && errors.targetDate && (
                      <div className="text-danger small mt-1" role="alert" data-testid="todo-error-targetDate">{errors.targetDate}</div>
                    )}
                  </fieldset>
                  <fieldset className="form-check mb-3">
                    <Field
                      id="done"
                      type="checkbox"
                      className="form-check-input"
                      name="done"
                      data-testid="todo-field-done"
                    />
                    <label className="form-check-label" htmlFor="done">Done</label>
                  </fieldset>
                  <button
                    className="btn btn-success m-3 py-2 px-4"
                    type="submit"
                    disabled={isInvalid || isSubmitting}
                    data-testid="todo-save"
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-secondary m-3 py-2 px-4"
                    type="button"
                    onClick={() => navigate("/list-todos")}
                    data-testid="todo-cancel"
                  >
                    Cancel
                  </button>
                </Form>
              )
            }
          }
        </Formik>
      </div>
    </div>
  )
}

export default UpdateTodoPage;
