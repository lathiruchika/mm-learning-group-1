import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Error404 from "./Error404";
import Header from "./Header";
import Footer from "./Footer";
import AuthProvider from "../auth/AuthContext";
import ProtectedRoute from "../auth/ProtectedRoute";
import LoginPage from "../pages/LoginPage";
import WelcomePage from "../pages/WelcomePage";
import TodoListPage from "../pages/TodoListPage";
import TodoFormPage from "../pages/TodoFormPage";

const TodoApp = () => {
  return (
    <div className="d-flex flex-column vh-100">
      <AuthProvider>
        <BrowserRouter>
          <Header />
          <div className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />

              <Route
                path="/welcome/:username"
                element={
                  <ProtectedRoute>
                    <WelcomePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/todos"
                element={
                  <ProtectedRoute>
                    <TodoListPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/todos/:id"
                element={
                  <ProtectedRoute>
                    <TodoFormPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Error404 />} />
            </Routes>
          </div>
          <Footer />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
};

export default TodoApp;
