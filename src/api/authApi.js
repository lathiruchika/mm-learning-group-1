import axios from "axios";
import { encodeBasicAuth } from "../auth/AuthService";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Verifies credentials against the backend Basic Auth guarded endpoint.
// Uses a bare axios call (not apiClient) so the header carries the
// credentials being verified rather than whatever is already stored.
export function verifyBasicAuth(username, password) {
  const credentials = encodeBasicAuth(username, password);
  return axios
    .get(`${baseURL}/basicauth`, {
      headers: { Authorization: `Basic ${credentials}` },
    })
    .then(() => credentials);
}
