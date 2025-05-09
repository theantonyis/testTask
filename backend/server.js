// server.js
const app = require('./app');  // Import your app configuration from app.js

// Set the port to listen on (either from environment or default to 3000)
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
