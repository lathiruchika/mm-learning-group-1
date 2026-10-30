import { useCallback, useEffect, useRef, useState } from "react";
import { retrieveTodosForAllUsers, deleteTodoApi, getStorageWarningMessage } from "./api/TodoApi";
import { getErrorMessage } from "./api/ApiError";
import { useAuth } from "./security/AuthProvider";
import { useNavigate } from "react-router-dom";
import ErrorBanner from "./common/ErrorBanner";
import LoadingIndicator from "./common/LoadingIndicator";
import EmptyState from "./common/EmptyState";


const ListTodos = () => {

    const [todos, setTodos] = useState([]);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const authContext = useAuth();
    const username = authContext.username;
    const navigate = useNavigate();
    const storageWarning = getStorageWarningMessage();

    // Only the most recent request may update state, so a slow or stale response
    // (Retry, delete-then-refresh, StrictMode double effect, unmount) is ignored.
    const latestRequest = useRef(0);

    const refreshTodos = useCallback(() => {
        const requestId = ++latestRequest.current;
        const isCurrent = () => requestId === latestRequest.current;
        setLoading(true);
        return retrieveTodosForAllUsers(username)
            .then((response) => {
                if (!isCurrent()) return;
                setTodos(response.data)
                setError(null)
            })
            .catch((err) => {
                if (!isCurrent()) return;
                setError(getErrorMessage(err, "Unable to load your todos."))
            })
            .finally(() => {
                if (isCurrent()) setLoading(false)
            })
    }, [username])

    useEffect(() => {
        refreshTodos()
        return () => {
            latestRequest.current++
        }
    }, [refreshTodos])

    const deleteTodo = (id) => {
        setMessage(null)
        deleteTodoApi(username, id)
            .then(
                () => {
                    setMessage(`Todo with id: ${id} is deleted.`)
                    refreshTodos()
                }
            )
            .catch((err) => setError(getErrorMessage(err, "Unable to delete the todo.")))
    }

    const updateTodo = (id) => {
        navigate(`/list-todos/${id}`)
    }

    const addTodo = () => {
        navigate('/list-todos/-1')
    }

    const isEmpty = !loading && !error && todos.length === 0;

    return (
        <div className="container my-4 py-4">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <h2 className="text-center my-2 py-2">List of Todos</h2>
                    {
                        storageWarning && <ErrorBanner message={storageWarning} variant="warning" testId="todo-storage-warning" />
                    }
                    {
                        message && <div className="alert alert-warning">{message}</div>
                    }
                    <ErrorBanner
                        message={error}
                        onRetry={refreshTodos}
                        testId="todo-list-error-banner"
                        retryTestId="todo-list-retry"
                    />
                    {loading && <LoadingIndicator label="Loading todos..." testId="todo-list-loading" />}
                    {isEmpty && (
                        <EmptyState
                            title="No todos yet"
                            message="You have nothing on your list. Add your first todo to get started."
                            actionLabel="Add New Todo"
                            onAction={addTodo}
                            testId="todo-list-empty"
                            actionTestId="todo-add-cta"
                        />
                    )}
                    {!loading && todos.length > 0 && (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Is Done?</th>
                                    <th>Target Date</th>
                                    <th>Delete</th>
                                    <th>Update</th>
                                </tr>
                            </thead>
                            <tbody>
                                {todos.map(todo => (
                                    <tr key={todo.id} data-testid={`todo-row-${todo.id}`}>
                                        <td>{todo.description}</td>
                                        <td>{todo.done.toString()}</td>
                                        <td>{todo.targetDate.toString()}</td>
                                        <td><button className="btn btn-warning" data-testid={`todo-delete-${todo.id}`} onClick={() => deleteTodo(todo.id)}>Delete</button></td>
                                        <td><button className="btn btn-success" data-testid={`todo-edit-${todo.id}`} onClick={() => updateTodo(todo.id)}>Update</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            {!isEmpty && (
                <div className="container d-flex justify-content-center">
                    <button type="button" className="btn btn-success m-4 py-2" data-testid="todo-add-cta" onClick={addTodo}>Add New Todo</button>
                </div>
            )}
        </div>
    );
};

export default ListTodos;
