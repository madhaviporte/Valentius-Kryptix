# Spendly

**Track your spending, simply.**

Spendly is a simple personal expense tracker that helps you keep track of your daily expenses. You can add, edit, delete and manage your expenses easily.

## Features

* Add new expenses
* Edit and delete expenses
* View all expenses
* Search and filter expenses
* Sort expenses
* Create and manage categories
* View total spending
* See recent expenses
* View category-wise expense summary
* Light and dark mode
* Responsive design for mobile and desktop
* Loading and error handling

## Tech Used

**Frontend:** React, Vite, JavaScript, CSS

**Backend:** Node.js, Express.js

**Database:** MongoDB, Mongoose

**API:** REST API

## How to Run Locally

First, clone the repository and open the project.

### Backend

Go to the Backend folder and install the dependencies:

```bash
npm install
```

Create a `.env` file and add your MongoDB connection string:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Start the backend:

```bash
npm run dev
```

### Frontend

Open another terminal, go to the Frontend folder and install the dependencies:

```bash
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Then start the frontend:

```bash
npm run dev
```

Open the local URL shown in the terminal.

## API

The backend provides APIs for users, categories and expenses.

Expense APIs include:

```text
GET    /api/expenses
GET    /api/expenses/:id
POST   /api/expenses
PUT    /api/expenses/:id
DELETE /api/expenses/:id
```

Categories and users also have their own API endpoints.

## Validation

Basic validation is added to the expense form. Title, amount, category and date are required, and the amount must be greater than zero.

The application also shows loading, error and empty states when needed.

## Deployment

The backend is deployed separately from the frontend.

* Backend: Render
* Frontend: Vercel
* Database: MongoDB

The frontend connects to the deployed backend using the `VITE_API_URL` environment variable.

## Why I Built This

I built Spendly as a full-stack project to practice working with React, REST APIs, Express, MongoDB and CRUD operations.

It also helped me understand how a frontend and backend are connected and how a full-stack application can be deployed.

## Author

**Madhavi Porte**

GitHub: https://github.com/madhaviporte
