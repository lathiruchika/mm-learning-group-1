// Session persistence + Basic Auth credential helpers.
// Kept free of React so it can be imported by the non-component apiClient too.

const USERNAME_KEY = "auth.username";
const CREDENTIALS_KEY = "auth.credentials";

export function encodeBasicAuth(username, password) {
  return btoa(`${username}:${password}`);
}

export function saveSession(username, credentials) {
  sessionStorage.setItem(USERNAME_KEY, username);
  sessionStorage.setItem(CREDENTIALS_KEY, credentials);
}

export function clearSession() {
  sessionStorage.removeItem(USERNAME_KEY);
  sessionStorage.removeItem(CREDENTIALS_KEY);
}

export function getStoredUsername() {
  return sessionStorage.getItem(USERNAME_KEY);
}

export function getStoredCredentials() {
  return sessionStorage.getItem(CREDENTIALS_KEY);
}

export function getAuthorizationHeader() {
  const credentials = getStoredCredentials();
  return credentials ? `Basic ${credentials}` : null;
}

export const SESSION_EXPIRED_EVENT = "auth:sessionExpired";

export function notifySessionExpired() {
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
}
