const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./superheroes.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS superheroes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nickname TEXT NOT NULL,
    real_name TEXT,
    origin_description TEXT,
    superpowers TEXT,
    catch_phrase TEXT
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    superhero_id INTEGER,
    image_data BLOB,
    content_type TEXT,
    FOREIGN KEY(superhero_id) REFERENCES superheroes(id) ON DELETE CASCADE
  )`);
});

module.exports = db;
