# Task API

This project is a REST API for managing tasks. Users can register, log in, and manage their own tasks.

## Features

- User registration and login
- Password hashing using bcryptjs
- JWT authentication
- Create, view, update, and delete tasks
- Users can manage only their own tasks
- Task status management
- Input validation
- MongoDB database using Mongoose

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- bcryptjs
- jsonwebtoken
- dotenv
- cors
- Jest
- Supertest

## Installation

Clone the repository and open the Task-APIs folder.

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project folder.

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Add your MongoDB connection string and JWT secret. Do not upload the `.env` file to GitHub.

## Run the Server

For development:

```bash
npm run dev
```

To start the server:

```bash
npm start
```

The server runs at `http://localhost:3000`.

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Login |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks` | Get all your tasks |
| GET | `/api/tasks/:id` | Get a task by ID |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

Registration and login do not require a token. All task routes require JWT authentication.

Add the token to the request header:

```http
Authorization: Bearer YOUR_TOKEN
```

## Task Status

Tasks can have one of these statuses:

- `pending`
- `in-progress`
- `completed`

Users can create tasks, view their tasks, update task details, and delete tasks. Users cannot access other users' tasks.

## Error Handling

The API uses HTTP status codes to handle requests.

| Status Code | Description |
|---|---|
| 200 | Request successful |
| 201 | Resource created |
| 400 | Invalid input |
| 401 | Unauthorized |
| 404 | Resource not found |
| 500 | Server error |

## Testing

Run all tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

The project uses Jest and Supertest for unit and API integration tests.

The coverage report is generated in:

`coverage/lcov-report/index.html`

The minimum coverage threshold is set to 80% for statements, branches, functions, and lines.

The tests use a mocked database connection, so MongoDB does not need to be running when executing the automated test suite.

## Project Structure

```text
Task-APIs/
├── controllers/
├── middleware/
├── models/
├── routes/
├── tests/
│   ├── helpers/
│   ├── integration/
│   └── unit/
├── server.js
├── package.json
├── package-lock.json
├── jest.config.js
└── README.md
```

## Author

Madhavi Porte
