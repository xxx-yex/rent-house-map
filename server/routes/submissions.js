const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
  const { type, area_id, payload, submitter_note, proof_images } = req.body;

  const validTypes = ['area_rating', 'rental_rules', 'landlord'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: '无效的提交类型' });
  }
  if (!payload) {
    return res.status(400).json({ error: '缺少提交内容' });
  }

  const result = db.prepare(`
    INSERT INTO submissions (type, area_id, payload, submitter_note, proof_images)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    type,
    area_id || null,
    typeof payload === 'string' ? payload : JSON.stringify(payload),
    submitter_note || '',
    JSON.stringify(proof_images || [])
  );

  res.json({ id: result.lastInsertRowid, status: 'pending' });
});

module.exports = router;
