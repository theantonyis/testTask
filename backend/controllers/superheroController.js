const dbPromise = require('../middleware/dbPromise');
const fs = require('fs');
const path = require('path');

exports.getAllSuperheroes = async (req, res) => {
    try {
        // Use async dbPromise to fetch data
        const rows = await dbPromise(`
            SELECT superheroes.*, images.path
            FROM superheroes
            LEFT JOIN images ON superheroes.id = images.superhero_id
        `);

        // Group images by superhero_id
        const heroesMap = {};

        rows.forEach(row => {
            const heroId = row.id;
            if (!heroesMap[heroId]) {
                heroesMap[heroId] = { ...row, images: [] }; // Initialize hero object with images array
            }

            if (row.path) {
                heroesMap[heroId].images.push(`/uploads/${row.path}`);
            }
        });

        // Convert heroesMap into an array and send it as response
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
            return res.status(404).json({ error: 'Not found' });
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

exports.createSuperhero = async (req, res) => {
    const { nickname, real_name, origin_description, superpowers, catch_phrase } = req.body;
    try {
        const result = await dbPromise(
            `INSERT INTO superheroes (nickname, real_name, origin_description, superpowers, catch_phrase) VALUES (?, ?, ?, ?, ?)`,
            [nickname, real_name, origin_description, superpowers, catch_phrase]
        );

        const id = result.lastID;

        // Handle multiple image uploads
        const files = req.files || [];
        for (const file of files) {
            await dbPromise(`INSERT INTO images (superhero_id, path) VALUES (?, ?)`, [id, file.filename]);
        }

        res.status(201).json({ id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.updateSuperhero = async (req, res) => {
    const id = req.params.id;
    const { nickname, real_name, origin_description, superpowers, catch_phrase, existingImages = [] } = req.body;

    try {
        // Update superhero info
        await dbPromise(
            `UPDATE superheroes SET nickname = ?, real_name = ?, origin_description = ?, superpowers = ?, catch_phrase = ? WHERE id = ?`,
            [nickname, real_name, origin_description, superpowers, catch_phrase, id]
        );

        // Get all current image filenames in DB for this hero
        const currentFilenames = await dbPromise(`SELECT path FROM images WHERE superhero_id = ?`, [id]);
        const imagesToDelete = currentFilenames.filter(filename => !existingImages.includes(filename));

        // Delete files from filesystem and DB
        for (const filename of imagesToDelete) {
            const filePath = path.join(__dirname, '../uploads', filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // Delete image file from disk
            await dbPromise(`DELETE FROM images WHERE superhero_id = ? AND path = ?`, [id, filename]); // Delete image record from DB
        }

        // Add new uploaded images
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

        // Delete files from filesystem
        for (const img of images) {
            const filePath = path.join(__dirname, '../uploads', img.path);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // Delete image file from disk
        }

        // Delete superhero from DB
        await dbPromise(`DELETE FROM superheroes WHERE id = ?`, [id]);
        res.json({ message: 'Superhero deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
