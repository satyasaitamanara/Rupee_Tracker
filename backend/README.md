# Budget Tracker Backend

This is the backend API for the Budget Tracker application built with Flask and MySQL.

## Setup Instructions

### Prerequisites
- Python 3.7+
- MySQL (XAMPP or standalone)

### Database Setup
1. Start your MySQL server (via XAMPP or directly)
2. Create a database and import the schema:
   ```
   mysql -u root -p < schema.sql
   ```
   
   Or run the SQL commands in the `schema.sql` file using phpMyAdmin or another MySQL client.

### Environment Setup
1. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Start the Flask server:
   ```
   flask run
   ```

The API will be available at http://localhost:5000.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login an existing user
- `GET /api/auth/user` - Get the current user (requires authentication)

### Transactions
- `GET /api/transactions` - Get all transactions for the current user
- `GET /api/transactions/:id` - Get a specific transaction
- `POST /api/transactions` - Create a new transaction
- `PUT /api/transactions/:id` - Update an existing transaction
- `DELETE /api/transactions/:id` - Delete a transaction

## Authentication

All transaction endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```