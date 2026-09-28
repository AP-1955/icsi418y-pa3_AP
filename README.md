# MERN Stack User Authentication (ICS418Y PA2)

**Author:** Apollo Pham  
**Course:** ICSI 418Y - Programming Assignment 2  

## Description
A full-stack web application built using the MERN stack (MongoDB, Express, React, Node.js) featuring user registration, duplicate username validation, secure password handling, and user login functionality connected to a cloud MongoDB Atlas database.

## Tech Stack
* **Frontend:** React (Vite), HTML, CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas, Mongoose ODM

## How to Run
1. **Clone the repository** and open the project directory.
2. **Setup the Backend:**
   * Navigate to the `server` folder: `cd server`
   * Install dependencies: `npm install`
   * Create a `.env` file in the `server` directory and add your configuration:
     ```env
     PORT=5000
     MONGO_URI=your_mongodb_atlas_connection_string
     ```
   * Start the server: `npm run dev`
3. **Setup the Frontend:**
   * Navigate to the `client` folder: `cd client`
   * Install dependencies: `npm install`
   * Start the development server: `npm run dev`
4. Open your web browser at `http://localhost:5173/`.

## Known Issues
None.