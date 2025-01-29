const express = require('express');
const pool = require('../config/db'); // Ensure this points to your database connection file
const router = express.Router();

// Endpoint to fetch carousel slides
router.get('/carousel', async (req, res) => {
    try {
        const [slides] = await pool.query('SELECT * FROM carousel_slides');
        res.json(slides); // Send slides as the response
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching carousel data');
    }
});

// Endpoint to fetch highlights (optional, based on your previous routes)
router.get('/highlights', async (req, res) => {
    try {
        const highlights = await pool.query('SELECT * FROM highlights ORDER BY created_at DESC LIMIT 10');
        res.json(highlights[0]); // Send highlights as the response
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching highlights');
    }
});

// Endpoint for user stats (if needed)
router.get('/user-stats/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const stats = await pool.query('SELECT * FROM user_stats WHERE user_id = ?', [userId]);
        res.json(stats[0] || {}); // Send stats as the response
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching user stats');
    }
});

module.exports = router;
