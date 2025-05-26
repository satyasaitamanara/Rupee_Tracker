# Budget Tracker Application

A full-stack budget tracking application with user authentication, transaction management, and visual data representation.

## Features

- User authentication (signup/login)
- Dashboard with financial overview and charts
- Transaction management (add, edit, delete)
- Categorized transactions
- Filter and search functionality
- Responsive design for all devices

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Chart.js for data visualization
- React Router for navigation
- Axios for API requests

### Backend
- Flask Python framework
- MySQL database (via XAMPP)
- JWT for authentication
- RESTful API architecture

## Getting Started

### Prerequisites
- Node.js (v14+)
- Python (v3.7+)
- XAMPP (or MySQL)

### Setup

1. Clone the repository
2. Install frontend dependencies:
   ```
   npm install
   ```

3. Start MySQL server via XAMPP

4. Import the database schema:
   ```
   mysql -u root -p < backend/schema.sql
   ```
   
   Or use phpMyAdmin to run the SQL commands from the schema.sql file.

5. Install backend dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   ```

6. Start the backend server:
   ```
   cd backend
   flask run
   ```

7. Start the frontend development server:
   ```
   npm run dev
   ```

8. Open your browser and navigate to http://localhost:5173

## Application Structure

### Frontend
- `src/components/` - React components
- `src/pages/` - Page components
- `src/contexts/` - React contexts (authentication)
- `src/services/` - API services

### Backend
- `app.py` - Main Flask application
- `schema.sql` - Database schema

## License
MIT