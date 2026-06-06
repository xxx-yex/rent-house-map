const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/:id/landlords', (req, res) => {
  const { page = 1, limit = 20, sort = 'score' } = req.query;
  const offset = (page - 1) * limit;

  const validSorts = { score: 'score DESC', created: 'created_at DESC' };
  const orderBy = validSorts[sort] || 'score DESC';

  const landlords = db.prepare(
    `SELECT * FROM landlords WHERE area_id = ? ORDER BY ${orderBy} LIMIT ? OFFSET ?`
  ).all(req.params.id, Number(limit), offset);

  const total = db.prepare('SELECT COUNT(*) as count FROM landlords WHERE area_id = ?').get(req.params.id).count;

  res.json({
    list: landlords.map(l => ({
      ...l,
      red_tags: JSON.parse(l.red_tags),
      black_tags: JSON.parse(l.black_tags),
      proof_images: JSON.parse(l.proof_images)
    })),
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit)
  });
});

module.exports = router;
