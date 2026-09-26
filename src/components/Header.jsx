import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const Header = () => {
  const { isAuthenticated, username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <h3 className="navbar-brand p-2 m-2">Todo App</h3>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto p-2 mb-2 mb-lg-0">
            <li className="nav-item mx-2 px-2 py-2">
              {isAuthenticated && (
                <Link className="nav-link" to={`/welcome/${username}`}>
                  Home
                </Link>
              )}
            </li>
            <li className="nav-item mx-2 px-2 py-2">
              {isAuthenticated && (
                <Link className="nav-link" to="/todos">
                  Your Todo Lists
                </Link>
              )}
            </li>
          </ul>
        </div>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto p-2 mb-2 mb-lg-0">
            <li className="nav-item">
              {isAuthenticated && (
                <button type="button" className="nav-link my-2 py-2 px-2 btn btn-link" onClick={handleLogout}>
                  LogOut
                </button>
              )}
            </li>
            <li className="nav-item">
              {!isAuthenticated && (
                <Link className="nav-link my-2 py-2 px-2" to="/login">
                  LogIn
                </Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
