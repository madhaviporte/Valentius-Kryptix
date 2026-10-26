# Task API

A simple REST API for managing tasks. Users can register, log in, and create, update, view, and delete their own tasks.

This project is built using Node.js, Express.js, and MongoDB.

## Features

- User registration and login
- Password hashing using bcryptjs
- JWT authentication
- Create, read, update, and delete tasks
- Users can only access their own tasks
- Task status: pending, in-progress, completed
- Input validation
- Proper HTTP status codes
- MongoDB database using Mongoose

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- bcryptjs
- JSON Web Token (JWT)
- dotenv
- cors

## Project Setup

### Install Dependencies

npm install

### Environment Variables

Create a .env file in the root folder:

PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

Do not upload the .env file to GitHub.

### Run the Project

For development:

npm run dev

For normal start:

npm start

The server will run on:

http://localhost:3000

## Authentication

Before using the task APIs:

1. Register a user.
2. Login with the same email and password.
3. Copy the JWT token from the login response.
4. Use the token with every task request.

Authorization header:

Authorization: Bearer YOUR_TOKEN

If the token is missing or invalid, the API returns 401 Unauthorized.

## API Endpoints

### 1. Register User

Method: POST

Endpoint: /api/auth/register

Authentication: Not required

Request Body:

{
  "name": "Madhavi",
  "email": "madhavi@example.com",
  "password": "123456"
}

Success Response: 201 Created

{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "name": "Madhavi",
    "email": "madhavi@example.com",
    "createdAt": "date"
  }
}

The password is never returned in the response.

### 2. Login User

Method: POST

Endpoint: /api/auth/login

Authentication: Not required

Request Body:

{
  "email": "madhavi@example.com",
  "password": "123456"
}

Success Response: 200 OK

{
  "message": "Login successful",
  "token": "your_jwt_token",
  "user": {
    "id": "user_id",
    "name": "Madhavi",
    "email": "madhavi@example.com"
  }
}

Use the token for the task APIs.

## Task APIs

All task APIs require JWT authentication.

### 3. Create Task

Method: POST

Endpoint: /api/tasks

Request Body:

{
  "title": "Complete API assignment",
  "description": "Finish the REST API project",
  "status": "pending"
}

Status can be:

- pending
- in-progress
- completed

Success Response: 201 Created

{
  "message": "Task created successfully",
  "task": {
    "_id": "task_id",
    "title": "Complete API assignment",
    "description": "Finish the REST API project",
    "status": "pending",
    "user": "user_id"
  }
}

### 4. Get All Tasks

Method: GET

Endpoint: /api/tasks

Returns all tasks created by the logged-in user.

Success Response: 200 OK

{
  "count": 1,
  "tasks": [
    {
      "_id": "task_id",
      "title": "Complete API assignment",
      "description": "Finish the REST API project",
      "status": "pending",
      "user": "user_id"
    }
  ]
}

### 5. Get Task by ID

Method: GET

Endpoint: /api/tasks/:id

Replace :id with the task ID.

Success Response: 200 OK

{
  "task": {
    "_id": "task_id",
    "title": "Complete API assignment",
    "description": "Finish the REST API project",
    "status": "pending",
    "user": "user_id"
  }
}

If the task does not exist, the API returns 404 Not Found.

### 6. Update Task

Method: PUT

Endpoint: /api/tasks/:id

You can update the title, description, or status.

Request Body:

{
  "title": "Complete REST API Assignment",
  "status": "in-progress"
}

Success Response: 200 OK

{
  "message": "Task updated successfully",
  "task": {
    "_id": "task_id",
    "title": "Complete REST API Assignment",
    "description": "Finish the REST API project",
    "status": "in-progress",
    "user": "user_id"
  }
}

### 7. Delete Task

Method: DELETE

Endpoint: /api/tasks/:id

Replace :id with the task ID.

No request body is required.

Success Response: 200 OK

{
  "message": "Task deleted successfully"
}

## Validation and Error Responses

The API checks the input before saving data.

| Status Code | Meaning |
| 200 | Request successful |
| 201 | Data created successfully |
| 400 | Invalid input |
| 401 | Authentication required or token is invalid |
| 404 | Resource not found |
| 500 | Server error |

For example, creating a task without a title returns:

{
  "message": "Title is required and must be a non-empty string"
}

## Running Tests

### Install Dependencies

npm install

This installs the application dependencies plus the development dependencies used for testing (Jest and Supertest).

### Run All Tests

npm test

### Run Tests with Coverage

npm run test:coverage

### Coverage Report

The coverage report is generated in the coverage folder in the project root:

- Open coverage/lcov-report/index.html in a browser for the full HTML report.
- coverage/lcov.info contains the machine-readable lcov data.
- coverage/coverage-summary.json contains per-file totals.
- A text summary is also printed to the terminal after the run.

The suite fails if statement, branch, function or line coverage of the application code drops below 80 percent (configured in jest.config.js). The coverage folder is generated output and does not need to be committed.

### Test Environment Configuration

No extra configuration is required to run the tests:

- tests/setup.js (registered in jest.config.js) sets NODE_ENV, a test-only JWT_SECRET, a dummy MONGO_URI and an empty PORT before the application code loads, so tests do not depend on your .env file.
- tests/helpers/testApp.js loads the real server.js with mongoose.connect stubbed and app.listen disabled, so tests never open a database connection, never bind a port and do not require a running MongoDB instance.
- Test files live in tests/unit/ (unit tests) and tests/integration/ (Supertest HTTP tests).

## Testing with Postman

The API was tested using Postman.

The following operations were tested:

- User registration
- User login
- Protected routes without a token
- Create task
- Get all tasks
- Get task by ID
- Update task
- Delete task
- Input validation

## Project Structure

task-api/
├── controllers/
│   ├── authController.js
│   └── taskController.js
├── middleware/
│   └── authMiddleware.js
├── models/
│   ├── User.js
│   └── Task.js
├── routes/
│   ├── authRoutes.js
│   └── taskRoutes.js
├── .env
├── .gitignore
├── server.js
├── package.json
├── package-lock.json
└── README.md

## Author

Madhavi Porte