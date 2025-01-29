const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.post('/api/schedule-meeting', (req, res) => {
    const { title, date, time } = req.body;
    // Save to database
    pool.query('INSERT INTO meetings (title, date, time) VALUES (?, ?, ?)', [title, date, time], (err) => {
      if (err) return res.status(500).send(err);
      res.status(200).send('Meeting scheduled successfully');
    });
  });
  
  router.get('/api/meetings', (req, res) => {
    pool.query('SELECT * FROM meetings', (err, results) => {
      if (err) return res.status(500).send(err);
      res.status(200).json(results);
    });
  });
  