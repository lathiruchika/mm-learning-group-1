# Frontend Todo App

This project implements a frontend application for a Todo List using React, integrated with a backend Spring Boot RESTful API.

## Overview

The frontend Todo App provides users with a user-friendly interface to manage their tasks efficiently. Integrated with a backend Spring Boot RESTful API, this application allows users to perform CRUD (Create, Read, Update, Delete) operations on their todos with real-time updates reflecting on the backend database.

## Technologies Used

- **React**: Frontend library for building user interfaces.
- **Axios**: Promise-based HTTP client for making requests to the backend API.
- **Integration**: Seamless integration with a backend Spring Boot RESTful API for real-time updates on database changes.

## Features

- **CRUD Operations**: Users can Create, Read, Update, and Delete todos.
- **Real-time Updates**: Changes made in the frontend reflect immediately on the backend database.
- **User Authentication**: Basic authentication implemented for a single user to validate in the frontend.
- **Context API**: Used for managing authentication state across multiple components.
- **Routing**: Implemented with React Router for navigation between different components.

## Getting Started

1. **Clone the Repository**: `git clone https://github.com/your_username/todo-frontend.git`
2. **Navigate to the Project Directory**: `cd todo-frontend`
3. **Install Dependencies**: `npm install`
4. **Start the Application**: `npm run dev`


## Folder Structure

- **src/auth/**: `AuthContext.jsx` (session state), `AuthService.js` (sessionStorage + Basic Auth helpers), `ProtectedRoute.jsx` (route guard).
- **src/api/**: `apiClient.js` (axios instance with auth + 401 interceptors), `authApi.js` (Basic Auth verification), `todoApi.js` (todo CRUD), `errorMapper.js` (backend error → user-friendly message mapping).
- **src/pages/**: `LoginPage.jsx`, `WelcomePage.jsx`, `TodoListPage.jsx`, `TodoFormPage.jsx`.
- **src/components/**: Shared UI (`Header`, `Footer`, `LoadingSpinner`, `InlineAlert`, `Error404`) and the `TodoApp` route shell.
- **src/mocks/**: MSW handlers providing an in-memory mock backend for local dev while the real backend is unavailable.
- **public/**: Static assets, `index.html`, and the generated `mockServiceWorker.js`.

## Configuration

Copy `.env.example` to `.env` and adjust:

- `VITE_API_BASE_URL` — backend base URL (default `http://localhost:8080`).
- `VITE_USE_MOCKS` — set to `false` once a real backend is running; defaults to `true` in dev so the app works against an in-memory mock (see `src/mocks/handlers.js`, seeded user `darshan` / `dummy`).

## Backend Integration

Auth uses HTTP Basic Auth: credentials are verified against `GET /basicauth`, then base64-encoded and sent as the `Authorization` header on every subsequent request via `apiClient`. A `401` response anywhere clears the session and redirects to `/login` with a "Session expired" message.
