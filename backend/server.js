const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 5000;
const upload = multer(); // store image in memory

app.use(express.json());
app.use(cors());

// Init SQLite DB
const db = new sqlite3.Database('./superheroes.db');

// Create tables if they don't exist
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS superheroes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nickname TEXT NOT NULL,
      real_name TEXT,
      origin_description TEXT,
      superpowers TEXT,
      catch_phrase TEXT
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      superhero_id INTEGER,
      image_data BLOB,
      content_type TEXT,
      FOREIGN KEY (superhero_id) REFERENCES superheroes(id) ON DELETE CASCADE
    )
  `);
});

// Modify your GET /superheroes endpoint to include image data
app.get('/superheroes', (req, res) => {
    db.all(`SELECT * FROM superheroes`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        // Create a promise for each hero to fetch its image
        const promises = rows.map(hero => {
            return new Promise((resolve) => {
                db.get(`SELECT image_data, content_type FROM images WHERE superhero_id = ?`,
                    [hero.id], (imgErr, image) => {
                        if (imgErr || !image) {
                            // No image or error, resolve with hero object as is
                            resolve(hero);
                        } else {
                            // Add base64 image to hero object
                            const base64 = Buffer.from(image.image_data).toString('base64');
                            hero.image = `data:${image.content_type};base64,${base64}`;
                            resolve(hero);
                        }
                    });
            });
        });

        // Wait for all image fetches to complete
        Promise.all(promises)
            .then(heroesWithImages => {
                res.json(heroesWithImages);
            })
            .catch(error => {
                res.status(500).json({ error: error.message });
            });
    });
});

// Get one superhero with image (as base64)
app.get('/superheroes/:id', (req, res) => {
    const id = req.params.id;

    db.get(`SELECT * FROM superheroes WHERE id = ?`, [id], (err, hero) => {
        if (err || !hero) return res.status(404).json({ error: 'Hero not found' });

        db.get(`SELECT image_data, content_type FROM images WHERE superhero_id = ?`, [id], (imgErr, image) => {
            if (imgErr) return res.status(500).json({ error: imgErr.message });

            if (image) {
                const base64 = Buffer.from(image.image_data).toString('base64');
                hero.image = `data:${image.content_type};base64,${base64}`;
            }

            res.json(hero);
        });
    });
});

// Create new superhero
app.post('/superheroes', upload.single('image'), (req, res) => {
    const { nickname, real_name, origin_description, superpowers, catch_phrase } = req.body;
    const image = req.file;

    db.run(
        `INSERT INTO superheroes (nickname, real_name, origin_description, superpowers, catch_phrase)
     VALUES (?, ?, ?, ?, ?)`,
        [nickname, real_name, origin_description, superpowers, catch_phrase],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            const heroId = this.lastID;

            if (image) {
                db.run(
                    `INSERT INTO images (superhero_id, image_data, content_type) VALUES (?, ?, ?)`,
                    [heroId, image.buffer, image.mimetype],
                    (imgErr) => {
                        if (imgErr) return res.status(500).json({ error: imgErr.message });
                        res.json({ id: heroId });
                    }
                );
            } else {
                res.json({ id: heroId });
            }
        }
    );
});

// Update superhero and image
app.put('/superheroes/:id', upload.single('image'), (req, res) => {
    const id = req.params.id;
    const { nickname, real_name, origin_description, superpowers, catch_phrase } = req.body;
    const image = req.file;

    db.run(
        `UPDATE superheroes SET nickname = ?, real_name = ?, origin_description = ?, superpowers = ?, catch_phrase = ? WHERE id = ?`,
        [nickname, real_name, origin_description, superpowers, catch_phrase, id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            if (image) {
                db.run(
                    `REPLACE INTO images (superhero_id, image_data, content_type) VALUES (?, ?, ?)`,
                    [id, image.buffer, image.mimetype],
                    (imgErr) => {
                        if (imgErr) return res.status(500).json({ error: imgErr.message });
                        res.json({ success: true });
                    }
                );
            } else {
                res.json({ success: true });
            }
        }
    );
});

// Delete superhero and image
app.delete('/superheroes/:id', (req, res) => {
    const id = req.params.id;

    db.run(`DELETE FROM superheroes WHERE id = ?`, [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Get raw image only
app.get('/superheroes/:id/image', (req, res) => {
    const id = req.params.id;

    db.get(`SELECT image_data, content_type FROM images WHERE superhero_id = ?`, [id], (err, image) => {
        if (err || !image) return res.status(404).json({ error: 'Image not found' });

        res.set('Content-Type', image.content_type);
        res.send(image.image_data);
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
