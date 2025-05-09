# Superhero Database Application

A full-stack web application for managing a database of superheroes. This application allows users to view, add, edit, and delete superheroes, including their images.

## Project Structure

The project is divided into two main parts:

- **Backend**: A Node.js/Express.js API server that handles data storage and retrieval using SQLite
- **Frontend**: A React application built with Vite that provides the user interface

## Technologies Used

### Backend
- Node.js
- Express.js
- SQLite3 (for database)
- Multer (for file uploads)
- CORS (for cross-origin resource sharing)

### Frontend
- React 19
- React Router
- Axios (for API requests)
- Tailwind CSS (for styling)
- Vite (for build and development)

## Setup and Running Instructions

### Prerequisites
- Node.js (v16 or higher recommended)
- npm (v7 or higher recommended)

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. The backend server will run on http://localhost:5000

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. The frontend application will run on http://localhost:5173 (or another port if 5173 is in use)

## API Endpoints

The backend provides the following API endpoints:

- `GET /api/superheroes` - Get all superheroes
- `GET /api/superheroes/:id` - Get a superhero by ID
- `POST /api/superheroes` - Create a new superhero (with image upload)
- `PUT /api/superheroes/:id` - Update a superhero (with image upload)
- `DELETE /api/superheroes/:id` - Delete a superhero

## Features

- View a list of superheroes with pagination
- View detailed information about a specific superhero
- Add new superheroes with images
- Edit existing superhero information and images
- Delete superheroes

## Assumptions

1. **Development Environment**: The application is intended for development use, not production deployment.
2. **Database**: The application uses SQLite for simplicity, which stores data in a local file (superheroes.db).
3. **Image Storage**: Images are stored locally in the backend's 'uploads' directory, not in a cloud storage service.
4. **Concurrent Users**: The application is not designed for high concurrency or multiple simultaneous users.
5. **Authentication**: No authentication or authorization is implemented; all API endpoints are publicly accessible.
6. **Error Handling**: Basic error handling is implemented, but not comprehensive production-level error handling.
7. **Browser Compatibility**: The application is designed for modern browsers and may not work correctly in older browsers.
8. **Network**: The frontend and backend are assumed to be running on the same machine (localhost).
