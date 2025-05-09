const db = require("../models/db")
const dbPromise = require('../middleware/dbPromise');
const fs = require('fs');
const path = require('path');

exports.getAllSuperheroes = async (req, res) => {
    try {
        const rows = await dbPromise(`
            SELECT superheroes.*, images.path
            FROM superheroes
            LEFT JOIN images ON superheroes.id = images.superhero_id
        `);

        const heroesMap = {};

        rows.forEach(row => {
            const heroId = row.id;
            if (!heroesMap[heroId]) {
                heroesMap[heroId] = { ...row, images: [] };
            }

            if (row.path) {
                heroesMap[heroId].images.push(`/uploads/${row.path}`);
            }
        });

        const heroesWithImages = Object.values(heroesMap);
        res.json(heroesWithImages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.getSuperheroById = async (req, res) => {
    const id = req.params.id;
    try {
        const rows = await dbPromise(`
            SELECT superheroes.*, images.path
            FROM superheroes
                     LEFT JOIN images ON superheroes.id = images.superhero_id
            WHERE superheroes.id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Superhero not found' });
        }

        const hero = { ...rows[0], images: [] };
        rows.forEach(row => {
            if (row.path) {
                hero.images.push(`/uploads/${row.path}`);
            }
        });

        res.json(hero);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createSuperhero = (req, res) => {
    const { nickname, real_name, origin_description, superpowers, catch_phrase } = req.body;
    db.run(
        `INSERT INTO superheroes (nickname, real_name, origin_description, superpowers, catch_phrase) VALUES (?, ?, ?, ?, ?)`,
        [nickname, real_name, origin_description, superpowers, catch_phrase],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            const id = this.lastID;

            const files = req.files || [];
            files.forEach(file => {
                db.run(`INSERT INTO images (superhero_id, path) VALUES (?, ?)`, [id, file.filename]);
            });
            res.status(201).json({ id });
        }
    );
};


exports.updateSuperhero = async (req, res) => {
    const id = req.params.id;
    const { nickname, real_name, origin_description, superpowers, catch_phrase, existingImages = [] } = req.body;

    try {
        await dbPromise(
            `UPDATE superheroes SET nickname = ?, real_name = ?, origin_description = ?, superpowers = ?, catch_phrase = ? WHERE id = ?`,
            [nickname, real_name, origin_description, superpowers, catch_phrase, id]
        );

        const currentFilenames = await dbPromise(`SELECT path FROM images WHERE superhero_id = ?`, [id]);
        const imagesToDelete = currentFilenames.filter(filename => !existingImages.includes(filename));

        for (const filename of imagesToDelete) {
            const filePath = path.join(__dirname, '../uploads', filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            await dbPromise(`DELETE FROM images WHERE superhero_id = ? AND path = ?`, [id, filename]);
        }

        const files = req.files || [];
        for (const file of files) {
            await dbPromise(`INSERT INTO images (superhero_id, path) VALUES (?, ?)`, [id, file.filename]);
        }

        res.json({ message: 'Updated superhero with new images' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteSuperhero = async (req, res) => {
    const id = req.params.id;
    try {
        const images = await dbPromise(`SELECT path FROM images WHERE superhero_id = ?`, [id]);

        for (const img of images) {
            const filePath = path.join(__dirname, '../uploads', img.path);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await dbPromise(`DELETE FROM superheroes WHERE id = ?`, [id]);
        res.json({ message: 'Superhero deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
