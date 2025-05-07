const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer to store files on disk
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename using timestamp and original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'hero-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage: storage });

app.use(express.json());
app.use(cors());
// Serve uploads directory statically
app.use('/uploads', express.static(uploadsDir));

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

    // Update images table to store file paths instead of blob data
    db.run(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      superhero_id INTEGER,
      file_path TEXT,
      content_type TEXT,
      FOREIGN KEY (superhero_id) REFERENCES superheroes(id) ON DELETE CASCADE
    )
  `);
});

// GET all superheroes with image paths
app.get('/superheroes', (req, res) => {
    db.all(`SELECT * FROM superheroes`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        // Create a promise for each hero to fetch its image
        const promises = rows.map(hero => {
            return new Promise((resolve) => {
                db.get(`SELECT file_path, content_type FROM images WHERE superhero_id = ?`,
                    [hero.id], (imgErr, image) => {
                        if (imgErr || !image) {
                            // No image or error, resolve with hero object as is
                            resolve(hero);
                        } else {
                            // Add image URL to hero object
                            hero.image = `/uploads/${path.basename(image.file_path)}`;
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

// Get one superhero with image URL
app.get('/superheroes/:id', (req, res) => {
    const id = req.params.id;

    db.get(`SELECT * FROM superheroes WHERE id = ?`, [id], (err, hero) => {
        if (err || !hero) return res.status(404).json({ error: 'Hero not found' });

        db.get(`SELECT file_path, content_type FROM images WHERE superhero_id = ?`, [id], (imgErr, image) => {
            if (imgErr) return res.status(500).json({ error: imgErr.message });

            if (image) {
                hero.image = `/uploads/${path.basename(image.file_path)}`;
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
                    `INSERT INTO images (superhero_id, file_path, content_type) VALUES (?, ?, ?)`,
                    [heroId, image.path, image.mimetype],
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
                // Get the old image file path to delete it
                db.get(`SELECT file_path FROM images WHERE superhero_id = ?`, [id], (getErr, oldImage) => {
                    if (oldImage && oldImage.file_path && fs.existsSync(oldImage.file_path)) {
                        try {
                            fs.unlinkSync(oldImage.file_path);
                        } catch (e) {
                            console.error('Failed to delete old image:', e);
                        }
                    }

                    // Insert or replace the new image
                    db.run(
                        `REPLACE INTO images (superhero_id, file_path, content_type) VALUES (?, ?, ?)`,
                        [id, image.path, image.mimetype],
                        (imgErr) => {
                            if (imgErr) return res.status(500).json({ error: imgErr.message });
                            res.json({ success: true });
                        }
                    );
                });
            } else {
                res.json({ success: true });
            }
        }
    );
});

// Delete superhero and image
app.delete('/superheroes/:id', (req, res) => {
    const id = req.params.id;

    // First get the image file path if exists
    db.get(`SELECT file_path FROM images WHERE superhero_id = ?`, [id], (getErr, image) => {
        // Delete the physical file if it exists
        if (image && image.file_path && fs.existsSync(image.file_path)) {
            try {
                fs.unlinkSync(image.file_path);
            } catch (e) {
                console.error('Failed to delete image file:', e);
            }
        }

        // Then delete the superhero from database
        // The image record will be deleted by cascade
        db.run(`DELETE FROM superheroes WHERE id = ?`, [id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });
});

// Get image directly (redirects to static file)
app.get('/superheroes/:id/image', (req, res) => {
    const id = req.params.id;

    db.get(`SELECT file_path, content_type FROM images WHERE superhero_id = ?`, [id], (err, image) => {
        if (err || !image) return res.status(404).json({ error: 'Image not found' });
        
        // Redirect to the static file
        res.redirect(`/uploads/${path.basename(image.file_path)}`);
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
