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

**Prerequisites**: Node 18+ (required by Vite 5) and npm.

1. **Clone the Repository**: `git clone https://github.com/your_username/todo-frontend.git`
2. **Navigate to the Project Directory**: `cd todo-frontend`
3. **Install Dependencies**: `npm install`
4. **Configure the API base URL**: `cp .env.example .env`, then edit `.env` and set `VITE_API_BASE_URL` to your backend (defaults to `http://localhost:8080` if unset). `.env` is gitignored — never commit it.
5. **Start the Application**: `npm run dev`
6. **Build for production**: `npm run build`
7. **Lint**: `npm run lint`

### Troubleshooting

- **Requests going to the wrong host**: confirm `.env` has `VITE_API_BASE_URL` set and restart `npm run dev` (Vite only reads `.env` at startup).
- **CORS errors in the browser console**: the backend must allow the frontend's origin; check its CORS configuration.
- **401 responses from the backend**: verify the credentials/session used for the request are valid against the configured `VITE_API_BASE_URL`.

## Folder Structure

- **src/**: Contains the source code for the frontend application.
  - **api/apiClient.js**: Centralized axios instance (`VITE_API_BASE_URL`) shared by all API modules.
  - **components/**: Contains React components for different parts of the application.
    - **components/api/**: Feature-specific API calls (todos) built on top of `src/api/apiClient.js`.
  - **security/**: Contains authentication-related components and context provider.
- **public/**: Contains static assets and index.html file.

## Backend Integration
