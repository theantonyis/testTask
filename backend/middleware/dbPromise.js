const db = require('../models/db');  // Import your db connection

// Utility to handle async SQLite queries
const dbPromise = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);  // Reject on error
            else resolve(rows);     // Resolve with result rows
        });
    });
};

module.exports = dbPromise;
