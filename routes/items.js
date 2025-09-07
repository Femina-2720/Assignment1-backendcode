const express = require('express');
const mongoose = require('mongoose');
const Item = require('../models/Item');

const router = express.Router();

// GET /items?category=&minPrice=&maxPrice=&q=
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, q } = req.query;
    const filter = {};

    if (category && category.trim()) filter.category = new RegExp(`^${category.trim()}$`, 'i');
    if (q && q.trim()) filter.$or = [
      { name: new RegExp(q.trim(), 'i') },
      { description: new RegExp(q.trim(), 'i') }
    ];
    if ((minPrice && !isNaN(minPrice)) || (maxPrice && !isNaN(maxPrice))) {
      filter.price = {};
      if (minPrice && !isNaN(minPrice)) filter.price.$gte = Number(minPrice);
      if (maxPrice && !isNaN(maxPrice)) filter.price.$lte = Number(maxPrice);
    }

    const items = await Item.find(filter).sort({ createdAt: -1 });
    console.log('Applied filter:', filter);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
