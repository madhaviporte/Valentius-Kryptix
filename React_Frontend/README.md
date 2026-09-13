# TaskFlow

TaskFlow is a full-stack task management web application where users can create an account, log in, and manage their daily tasks.

I built this project to get hands-on experience with full-stack web development, authentication, REST APIs, database integration, and responsive frontend design.

## Features

- User registration and login
- Secure password hashing
- JWT-based authentication
- Protected routes
- Create new tasks
- View all personal tasks
- Edit tasks
- Delete tasks
- Task status management
- Input validation
- Loading and error states
- Responsive design for desktop, tablet, and mobile
- Users can only access their own tasks

## Tech Stack

### Frontend

- React.js
- React Router
- CSS
- JavaScript

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

### Tools

- Postman
- Git and GitHub

## How It Works

A user first creates an account using the registration page. After logging in, a JWT token is generated and used to access the protected task routes.

Once logged in, the user can open the My Tasks page and manage their tasks.

Each task has a title, description, and status. Users can create new tasks, update existing ones, or delete them when they are no longer needed.

Tasks are connected to the user who created them, so one user cannot access another user's tasks.

## Authentication

Authentication is handled using JWT.

Passwords are hashed before being stored in the database using bcryptjs. After a successful login, the server generates a JWT token.

The token is checked by the authentication middleware before protected task requests are processed.

If a user tries to access a protected route without a valid token, the API returns an authentication error.

## Task Operations

The application supports the following operations:

- Create a task
- Get all tasks
- Get a task by ID
- Update a task
- Delete a task

Task status can be:

- Pending
- In-progress
- Completed

## API

Main API routes include:

### Authentication

POST `/api/auth/register`

Used to create a new user account.

POST `/api/auth/login`

Used to log in and receive an authentication token.

### Tasks

POST `/api/tasks`

Creates a new task.

GET `/api/tasks`

Returns the logged-in user's tasks.

GET `/api/tasks/:id`

Returns a particular task.

PUT `/api/tasks/:id`

Updates an existing task.

DELETE `/api/tasks/:id`

Deletes a task.

Task routes require a valid JWT token.

## Project Structure

The project is divided into frontend and backend parts.

Frontend handles:

- Login and registration pages
- Navigation
- Task dashboard
- Task forms
- Task list/cards
- Responsive UI

Backend handles:

- Authentication
- API routes
- Controllers
- Database models
- JWT middleware
- Task operations

## Validation and Error Handling

The application checks user input before processing requests.

For example, required fields are checked during registration and task creation. Invalid task IDs and invalid task status values are also handled.

The API uses appropriate HTTP status codes such as:

- 200 - Successful request
- 201 - Resource created
- 400 - Invalid input
- 401 - Authentication required or invalid token
- 404 - Resource not found
- 500 - Server error

## Responsive Design

The frontend is designed to work across different screen sizes.

The layout adapts for:

- Desktop
- Tablet
- Mobile
- Small mobile screens

On smaller screens, the navigation changes to a mobile-friendly menu and task items are displayed as cards instead of forcing a desktop-style layout.

The main goal was to make the application easy to use without horizontal scrolling or broken layouts.

## Testing

I tested the backend APIs using Postman.

The following were tested:

- User registration
- User login
- Authentication
- Protected routes
- Task creation
- Fetching tasks
- Fetching a task by ID
- Task update
- Task deletion
- Invalid input
- Invalid authentication token

I also checked the frontend flow for login, registration, logout, task creation, editing, deletion, navigation, loading states, and error states.

## Running the Project

### Backend

Go to the backend folder and install the dependencies:

npm install

Create a `.env` file and add:

PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

Then start the server:

npm run dev

### Frontend

Go to the frontend folder and install the dependencies:

npm install

Then start the development server:

npm run dev

## What I Learned

This project helped me understand how a frontend and backend work together in a full-stack application.

I got practical experience with React, Express, MongoDB, JWT authentication, protected routes, REST APIs, and CRUD operations.

I also learned how important responsive design is when building a real web application. Making the application work properly on smaller screens required more than just changing a few styles.

Overall, TaskFlow was a useful project for improving both my frontend and backend development skills.

## Author

Madhavi Porte