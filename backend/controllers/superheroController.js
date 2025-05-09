const db = require('../models/db');
const fs = require('fs');
const path = require('path');

exports.getAllSuperheroes = (req, res) => {
    db.all(`SELECT * FROM superheroes`, [], (err, heroes) => {
        if (err) return res.status(500).json({ error: err.message });

        db.all(`SELECT superhero_id, path FROM images`, [], (err, images) => {
            if (err) return res.status(500).json({ error: err.message });

            // Group images by superhero_id
            const imageMap = {};
            images.forEach(img => {
                if (!imageMap[img.superhero_id]) {
                    imageMap[img.superhero_id] = [];
                }
                imageMap[img.superhero_id].push(`/uploads/${img.path}`);
            });

            // Attach images to each hero
            const heroesWithImages = heroes.map(hero => ({
                ...hero,
                images: imageMap[hero.id] || [],
            }));

            res.json(heroesWithImages);
        });
    });
};

exports.getSuperheroById = (req, res) => {
    const id = req.params.id;
    db.get(`SELECT * FROM superheroes WHERE id = ?`, [id], (err, hero) => {
        if (err || !hero) return res.status(404).json({ error: 'Not found' });
        db.all(`SELECT path FROM images WHERE superhero_id = ?`, [id], (err, images) => {
            hero.images = images.map(img => `/uploads/${img.path}`);
            res.json(hero);
        });
    });
};

exports.createSuperhero = (req, res) => {
    const { nickname, real_name, origin_description, superpowers, catch_phrase } = req.body;
    db.run(
        `INSERT INTO superheroes (nickname, real_name, origin_description, superpowers, catch_phrase) VALUES (?, ?, ?, ?, ?)`,
        [nickname, real_name, origin_description, superpowers, catch_phrase],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            const id = this.lastID;

            // Handle multiple image uploads
            const files = req.files || [];
            files.forEach(file => {
                db.run(`INSERT INTO images (superhero_id, path) VALUES (?, ?)`, [id, file.filename]);
            });
            res.status(201).json({ id });
        }
    );
};

exports.updateSuperhero = (req, res) => {
    const id = req.params.id;
    const {
        nickname,
        real_name,
        origin_description,
        superpowers,
        catch_phrase,
        existingImages = [] // Default to empty array if not provided
    } = req.body;

    // Ensure existingImages is an array
    const existingFilenames = Array.isArray(existingImages) ? existingImages.map(url => path.basename(url)) : [];

    db.serialize(() => {
        // Update superhero info
        db.run(
            `UPDATE superheroes SET nickname = ?, real_name = ?, origin_description = ?, superpowers = ?, catch_phrase = ? WHERE id = ?`,
            [nickname, real_name, origin_description, superpowers, catch_phrase, id],
            (err) => {
                if (err) return res.status(500).json({ error: err.message });

                // Get all current image filenames in DB for this hero
                db.all(`SELECT path FROM images WHERE superhero_id = ?`, [id], (err, rows) => {
                    if (err) return res.status(500).json({ error: err.message });

                    const currentFilenames = rows.map(row => row.path);
                    const imagesToDelete = currentFilenames.filter(filename => !existingFilenames.includes(filename));

                    // Delete files from filesystem and DB
                    imagesToDelete.forEach(filename => {
                        const filePath = path.join(__dirname, '../uploads', filename);
                        if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // Delete image file from disk
                        db.run(`DELETE FROM images WHERE superhero_id = ? AND path = ?`, [id, filename]); // Delete image record from DB
                    });

                    // Add new uploaded images
                    const files = req.files || [];
                    files.forEach(file => {
                        db.run(`INSERT INTO images (superhero_id, path) VALUES (?, ?)`, [id, file.filename]);
                    });

                    res.json({ message: 'Updated superhero with new images' });
                });
            }
        );
    });
};

exports.deleteSuperhero = (req, res) => {
    const id = req.params.id;
    db.all(`SELECT path FROM images WHERE superhero_id = ?`, [id], (err, images) => {
        if (err) return res.status(500).json({ error: err.message });

        // Delete files from filesystem
        images.forEach(img => {
            const filePath = path.join(__dirname, '../uploads', img.path);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // Delete image file from disk
        });

        // Delete superhero from DB
        db.run(`DELETE FROM superheroes WHERE id = ?`, [id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Superhero deleted' });
        });
    });
};
