# Bus Booking System

A full-stack, aesthetically pleasing Bus Booking System featuring automated waitlists, dynamic seating rendering based on gender assignment, and simulated seamless payments.

## Tech Stack
- Frontend: React (Vite), Tailwind CSS, Framer Motion
- Backend: FastAPI, SQLAlchemy, PyMySQL
- Database: MySQL
- Caching: Redis
- Authentication: Firebase Google Auth

## Setup Instructions

### Pre-requisites
1. Node.js (v18+)
2. Python (3.9+)
3. MySQL Desktop/Server installed (with root:root credentials by default)
4. Redis server running on default port 6379

### 1. Database Setup
Create the initial database in MySQL:
```bash
mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS bus_booking;"
```
*Note: The FastAPI application will create the required tables automatically on the first run.*

### 2. Backend Setup
Navigate into the `backend` directory, create a virtual environment, and install requirements:
```bash
cd backend
python -m venv venv
venv\Scripts\activate      # On Windows
# source venv/bin/activate # On Unix/MacOS
pip install -r requirements.txt
```
Run the FastAPI backend:
```bash
uvicorn main:app --reload
```
The backend will be available at `http://localhost:8000`. API documentation is at `http://localhost:8000/docs`.

### 3. Frontend Setup
Navigate into the `frontend` directory and install dependencies:
```bash
cd frontend
npm install
```
Start the Vite development server:
```bash
npm run dev
```
The frontend will be available at `http://localhost:5173`.

## Features
- Interactive Bus Seating with animations (Hover, Glow, Scale).
- Color-coded seats post-booking based on gender (Pink for Female, Green for Male).
- Waitlist system functioning automatically upon cancellations.
- Simulated manual payments (e.g. UPI/QR code simulation).
- Admin endpoints integration.

