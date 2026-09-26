import axios from "axios";

// Centralized axios instance so every API module shares one baseURL.
// Falls back to localhost:8080 (the previous hardcoded value) when
// VITE_API_BASE_URL isn't set, so existing local dev workflows keep working.
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn(
    `VITE_API_BASE_URL is not set; falling back to ${baseURL}. Copy .env.example to .env to configure it explicitly.`
  );
}

const apiClient = axios.create({ baseURL });

export default apiClient;
