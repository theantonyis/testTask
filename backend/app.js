// backend/app.js
const express = require('express');
const cors = require('cors');
const fileUpload = require('multer');
const path = require('path');
const superheroRoutes = require('./routes/superheroes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/superheroes', superheroRoutes);

module.exports = app;
