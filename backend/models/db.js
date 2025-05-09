const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.resolve(__dirname, '../superheroes.db'), (err) => {
    if (err) return console.error('DB connection error:', err);
    console.log('Connected to SQLite database');
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS superheroes (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           nickname TEXT,
           real_name TEXT,
           origin_description TEXT,
           superpowers TEXT,
           catch_phrase TEXT
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          superhero_id INTEGER,
          path TEXT,
          FOREIGN KEY(superhero_id) REFERENCES superheroes(id) ON DELETE CASCADE
            );
    `);
});

module.exports = db;
