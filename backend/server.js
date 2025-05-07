// backend/server.js
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

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'hero-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage });

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(uploadsDir));

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
                  file_path TEXT,
                  content_type TEXT,
                  FOREIGN KEY (superhero_id) REFERENCES superheroes(id) ON DELETE CASCADE
        )`);
});

app.get('/superheroes', (req, res) => {
    db.all(`SELECT * FROM superheroes`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const promises = rows.map(hero => {
            return new Promise(resolve => {
                db.get(`SELECT file_path FROM images WHERE superhero_id = ?`, [hero.id], (imgErr, image) => {
                    hero.image = image ? `/uploads/${path.basename(image.file_path)}` : null;
                    resolve(hero);
                });
            });
        });

        Promise.all(promises).then(data => res.json(data));
    });
});

app.get('/superheroes/:id', (req, res) => {
    const id = req.params.id;
    db.get(`SELECT * FROM superheroes WHERE id = ?`, [id], (err, hero) => {
        if (err || !hero) return res.status(404).json({ error: 'Not found' });

        db.get(`SELECT file_path FROM images WHERE superhero_id = ?`, [id], (imgErr, image) => {
            hero.image = image ? `/uploads/${path.basename(image.file_path)}` : null;
            res.json(hero);
        });
    });
});

app.post('/superheroes', upload.single('image'), (req, res) => {
    const { nickname, real_name, origin_description, superpowers, catch_phrase } = req.body;
    const image = req.file;

    db.run(`INSERT INTO superheroes (nickname, real_name, origin_description, superpowers, catch_phrase)
            VALUES (?, ?, ?, ?, ?)`,
        [nickname, real_name, origin_description, superpowers, catch_phrase],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            const heroId = this.lastID;
            if (image) {
                db.run(`INSERT INTO images (superhero_id, file_path, content_type)
                        VALUES (?, ?, ?)`, [heroId, image.path, image.mimetype]);
            }
            res.json({ id: heroId });
        });
});

app.put('/superheroes/:id', upload.single('image'), (req, res) => {
    const id = req.params.id;
    const { nickname, real_name, origin_description, superpowers, catch_phrase } = req.body;
    const image = req.file;

    db.run(`UPDATE superheroes SET nickname = ?, real_name = ?, origin_description = ?, superpowers = ?, catch_phrase = ? WHERE id = ?`,
        [nickname, real_name, origin_description, superpowers, catch_phrase, id],
        err => {
            if (err) return res.status(500).json({ error: err.message });

            if (image) {
                db.get(`SELECT file_path FROM images WHERE superhero_id = ?`, [id], (getErr, oldImage) => {
                    if (oldImage && fs.existsSync(oldImage.file_path)) {
                        fs.unlinkSync(oldImage.file_path);
                    }

                    db.run(`REPLACE INTO images (superhero_id, file_path, content_type)
                            VALUES (?, ?, ?)`, [id, image.path, image.mimetype]);
                    res.json({ message: 'Updated' });
                });
            } else {
                res.json({ message: 'Updated' });
            }
        });
});

app.delete('/superheroes/:id', (req, res) => {
    const id = req.params.id;
    db.get(`SELECT file_path FROM images WHERE superhero_id = ?`, [id], (imgErr, image) => {
        if (image && fs.existsSync(image.file_path)) fs.unlinkSync(image.file_path);
    });

    db.run(`DELETE FROM superheroes WHERE id = ?`, [id], err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Deleted' });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
