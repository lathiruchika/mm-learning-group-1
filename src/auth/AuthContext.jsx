import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { verifyBasicAuth } from "../api/authApi";
import { mapError } from "../api/errorMapper";
import {
  saveSession,
  clearSession,
  getStoredUsername,
  SESSION_EXPIRED_EVENT,
} from "./AuthService";

export const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [username, setUsername] = useState(() => getStoredUsername());
  const [sessionMessage, setSessionMessage] = useState(null);

  useEffect(() => {
    const onSessionExpired = () => {
      setUsername(null);
      setSessionMessage("Session expired. Please login again.");
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
  }, []);

  async function login(candidateUsername, password) {
    try {
      const credentials = await verifyBasicAuth(candidateUsername, password);
      saveSession(candidateUsername, credentials);
      setUsername(candidateUsername);
      setSessionMessage(null);
      return { success: true };
    } catch (error) {
      return { success: false, message: mapError(error) };
    }
  }

  function logout() {
    clearSession();
    setUsername(null);
  }

  function clearSessionMessage() {
    setSessionMessage(null);
  }

  const value = {
    username,
    isAuthenticated: Boolean(username),
    login,
    logout,
    sessionMessage,
    clearSessionMessage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
