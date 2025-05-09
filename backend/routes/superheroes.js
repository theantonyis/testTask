const express = require('express');
const multer = require('multer');
const path = require('path');
const {
    getAllSuperheroes,
    getSuperheroById,
    createSuperhero,
    updateSuperhero,
    deleteSuperhero
} = require('../controllers/superheroController');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

router.get('/', getAllSuperheroes);
router.get('/:id', getSuperheroById);
router.post('/', upload.array('images'), createSuperhero);
router.put('/:id', upload.array('images'), updateSuperhero);
router.delete('/:id', deleteSuperhero);

module.exports = router;
