import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { useAuth } from "../auth/AuthContext";
import { getTodos, deleteTodo, updateTodo } from "../api/todoApi";
import { mapError } from "../api/errorMapper";
import LoadingSpinner from "../components/LoadingSpinner";
import InlineAlert from "../components/InlineAlert";

const FILTERS = { ALL: "all", PENDING: "pending", DONE: "done" };

const TodoListPage = () => {
  const { username } = useAuth();
  const navigate = useNavigate();

  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingIds, setPendingIds] = useState({});

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(FILTERS.ALL);
  const [sortAsc, setSortAsc] = useState(true);

  const loadTodos = () => {
    setLoading(true);
    setError(null);
    getTodos(username)
      .then((response) => setTodos(response.data))
      .catch((err) => setError(err.userMessage || mapError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleTodos = useMemo(() => {
    let result = [...todos];

    if (search.trim()) {
      const needle = search.trim().toLowerCase();
      result = result.filter((todo) => todo.description.toLowerCase().includes(needle));
    }

    if (filter === FILTERS.PENDING) {
      result = result.filter((todo) => !todo.done);
    } else if (filter === FILTERS.DONE) {
      result = result.filter((todo) => todo.done);
    }

    result.sort((a, b) => {
      const diff = moment(a.targetDate).valueOf() - moment(b.targetDate).valueOf();
      return sortAsc ? diff : -diff;
    });

    return result;
  }, [todos, search, filter, sortAsc]);

  const handleDelete = (id) => {
    deleteTodo(username, id)
      .then(() => loadTodos())
      .catch((err) => setError(err.userMessage || mapError(err)));
  };

  const handleEdit = (id) => navigate(`/todos/${id}`);

  const handleAdd = () => navigate("/todos/new");

  const handleToggleDone = (todo) => {
    const nextDone = !todo.done;
    setPendingIds((prev) => ({ ...prev, [todo.id]: true }));
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, done: nextDone } : t)));

    updateTodo(username, todo.id, { ...todo, done: nextDone })
      .catch((err) => {
        setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, done: todo.done } : t)));
        setError(err.userMessage || mapError(err));
      })
      .finally(() => {
        setPendingIds((prev) => {
          const next = { ...prev };
          delete next[todo.id];
          return next;
        });
      });
  };

  return (
    <div className="container my-4 py-4">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <h2 className="text-center my-2 py-2">List of Todos</h2>

          <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
            <input
              type="text"
              className="form-control"
              style={{ maxWidth: 260 }}
              placeholder="Search description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="todo-search"
            />
            <select
              className="form-select"
              style={{ maxWidth: 160 }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              data-testid="todo-filter"
            >
              <option value={FILTERS.ALL}>All</option>
              <option value={FILTERS.PENDING}>Pending</option>
              <option value={FILTERS.DONE}>Done</option>
            </select>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setSortAsc((prev) => !prev)}
              data-testid="todo-sort"
            >
              Target Date {sortAsc ? "Asc" : "Desc"}
            </button>
            <button type="button" className="btn btn-success ms-auto" onClick={handleAdd} data-testid="todo-add">
              Add Todo
            </button>
          </div>

          <InlineAlert message={error} onRetry={loadTodos} />

          {loading && <LoadingSpinner label="Loading todos..." />}

          {!loading && !error && visibleTodos.length === 0 && (
            <div className="text-center py-5">
              <p>No todos yet. Create your first todo.</p>
              <button type="button" className="btn btn-success" onClick={handleAdd} data-testid="todo-add">
                Add Todo
              </button>
            </div>
          )}

          {!loading && visibleTodos.length > 0 && (
            <table className="table">
              <thead>
                <tr>
                  <th>Done</th>
                  <th>Description</th>
                  <th>Target Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleTodos.map((todo) => (
                  <tr key={todo.id} data-testid={`todo-row-${todo.id}`}>
                    <td>
                      <input
                        type="checkbox"
                        checked={todo.done}
                        disabled={Boolean(pendingIds[todo.id])}
                        onChange={() => handleToggleDone(todo)}
                        data-testid={`todo-done-${todo.id}`}
                      />
                    </td>
                    <td>{todo.description}</td>
                    <td>{moment(todo.targetDate).format("MMM D, YYYY")}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-success me-2"
                        onClick={() => handleEdit(todo.id)}
                        data-testid={`todo-edit-${todo.id}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-warning"
                        onClick={() => handleDelete(todo.id)}
                        data-testid={`todo-delete-${todo.id}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoListPage;
