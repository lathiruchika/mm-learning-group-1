import { http, HttpResponse } from "msw";

// In-memory mock backend for local dev while the real Spring Boot backend
// (LLD: Basic Auth, /users/{username}/todos) is not yet available.

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const USERS = { darshan: "dummy", jane: "todo123" };

let nextId = 4;
const todosByUser = {
  darshan: [
    { id: 1, username: "darshan", description: "Learn AWS fundamentals", targetDate: "2026-10-01", done: false },
    { id: 2, username: "darshan", description: "Finish React auth story", targetDate: "2026-09-28", done: false },
    { id: 3, username: "darshan", description: "Review LLD document", targetDate: "2026-09-20", done: true },
  ],
  jane: [],
};

function parseBasicAuth(request) {
  const header = request.headers.get("Authorization") || "";
  if (!header.startsWith("Basic ")) {
    return null;
  }
  try {
    const decoded = atob(header.slice("Basic ".length));
    const [username, password] = decoded.split(":");
    return { username, password };
  } catch {
    return null;
  }
}

function requireAuth(request) {
  const credentials = parseBasicAuth(request);
  if (!credentials || USERS[credentials.username] !== credentials.password) {
    return null;
  }
  return credentials;
}

export const handlers = [
  http.get(`${baseURL}/basicauth`, ({ request }) => {
    const credentials = requireAuth(request);
    if (!credentials) {
      return new HttpResponse(null, { status: 401 });
    }
    return HttpResponse.text("Authenticated");
  }),

  http.get(`${baseURL}/users/:username/todos`, ({ request, params }) => {
    const credentials = requireAuth(request);
    if (!credentials) {
      return new HttpResponse(null, { status: 401 });
    }
    const todos = todosByUser[params.username] || [];
    return HttpResponse.json(todos);
  }),

  http.get(`${baseURL}/users/:username/todos/:id`, ({ request, params }) => {
    const credentials = requireAuth(request);
    if (!credentials) {
      return new HttpResponse(null, { status: 401 });
    }
    const todos = todosByUser[params.username] || [];
    const todo = todos.find((t) => String(t.id) === String(params.id));
    if (!todo) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(todo);
  }),

  http.post(`${baseURL}/users/:username/todos`, async ({ request, params }) => {
    const credentials = requireAuth(request);
    if (!credentials) {
      return new HttpResponse(null, { status: 401 });
    }
    const body = await request.json();
    const todos = todosByUser[params.username] || (todosByUser[params.username] = []);
    const todo = { id: nextId++, username: params.username, done: false, ...body };
    todos.push(todo);
    return HttpResponse.json(todo, { status: 201 });
  }),

  http.put(`${baseURL}/users/:username/todos/:id`, async ({ request, params }) => {
    const credentials = requireAuth(request);
    if (!credentials) {
      return new HttpResponse(null, { status: 401 });
    }
    const body = await request.json();
    const todos = todosByUser[params.username] || [];
    const index = todos.findIndex((t) => String(t.id) === String(params.id));
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    todos[index] = { ...todos[index], ...body, id: todos[index].id };
    return HttpResponse.json(todos[index]);
  }),

  http.delete(`${baseURL}/users/:username/todos/:id`, ({ request, params }) => {
    const credentials = requireAuth(request);
    if (!credentials) {
      return new HttpResponse(null, { status: 401 });
    }
    const todos = todosByUser[params.username] || [];
    const index = todos.findIndex((t) => String(t.id) === String(params.id));
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    todos.splice(index, 1);
    return new HttpResponse(null, { status: 200 });
  }),
];
