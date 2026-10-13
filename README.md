# LuxuryStay – Hotel Management System

## Project Overview

LuxuryStay is a web-based Hotel Management System developed to manage hotel operations through a single platform. The system provides separate dashboards for Admin, Staff, and Guests.

## Technologies Used

**Frontend:** React.js, Vite, JavaScript, HTML, CSS

**Backend:** Node.js, Express.js

**Database:** MongoDB, Mongoose

**Authentication:** JWT, bcryptjs

**Email Service:** Nodemailer for password reset verification

## Main Features

### Admin
- Manage hotel rooms and bookings
- Create and manage staff accounts
- View reports and financial information
- Monitor feedback and hotel operations

### Staff
- View and manage bookings
- Handle guest check-in and check-out
- Manage housekeeping and maintenance tasks
- View room and guest information

### Guest
- Register and log in
- Browse available rooms
- Make room bookings
- View booking details
- Update profile information
- Reset forgotten password using email verification

## Project Structure

- `client/` – React frontend
- `server/` – Express backend and API routes
- `database/` – MongoDB sample data in JSON format

## How to Run the Project

### Requirements

- Node.js and npm
- MongoDB Community Server

### Backend Setup

1. Open the `server` folder in a terminal.
2. Run `npm install`.
3. Create a `.env` file using `.env.example` as a reference.
4. Set the MongoDB connection string and a secure JWT secret.
5. Add Gmail App Password credentials if testing email OTP.
6. Run `npm run dev`.

The backend runs on `http://localhost:5000`.

### Frontend Setup

1. Open the `client` folder in another terminal.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open the local URL displayed by Vite, usually `http://localhost:5173`.

### Database Setup

Connect MongoDB Compass to `mongodb://127.0.0.1:27017`.

Create the `luxurystay` database and import the sample JSON collections from the `database` folder.

### User Roles

The system supports three roles: Admin, Staff, and Guest.

New accounts registered through the public registration page receive the Guest role. Admin and Staff roles require authorized account setup.

## Project Submission

This project was developed as an academic E-Project to demonstrate frontend development, backend APIs, database integration, authentication, and hotel management workflows.
## Demo Login Credentials

Admin
Email: admin@luxury.com
Password: [admin12]

Staff
Email: saadkhan@luxury.com
Password: [saadkhan1]

Guest
Email: [user@gmail.com]
Password: [user12]
## GitHub Repository

Project Source Code:
https://github.com/haniyayaseen58-rgb/LuxuryStay-Hotel-Management-System