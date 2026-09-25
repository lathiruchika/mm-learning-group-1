import axios from "axios";
import { getAuthorizationHeader, clearSession, notifySessionExpired } from "../auth/AuthService";
import { mapError, isUnauthorized } from "./errorMapper";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use((config) => {
  const authHeader = getAuthorizationHeader();
  if (authHeader) {
    config.headers.Authorization = authHeader;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isUnauthorized(error)) {
      clearSession();
      notifySessionExpired();
    }
    error.userMessage = mapError(error);
    return Promise.reject(error);
  }
);

export default apiClient;
