// src/routes/index.js
const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile('index.html', { root: './src/public' });
});


module.exports = router;