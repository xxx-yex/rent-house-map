const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const adminAuth = require('../middleware/adminAuth');

router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: '密码错误' });
  }
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

router.get('/submissions', adminAuth, (req, res) => {
  const { status = 'pending' } = req.query;
  const rows = db.prepare(
    'SELECT s.*, a.name as area_name FROM submissions s LEFT JOIN areas a ON s.area_id = a.id WHERE s.status = ? ORDER BY s.created_at DESC'
  ).all(status);

  res.json(rows.map(r => ({
    ...r,
    payload: JSON.parse(r.payload),
    proof_images: JSON.parse(r.proof_images)
  })));
});

router.put('/submissions/:id', adminAuth, (req, res) => {
  const { status, review_note } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: '无效状态' });
  }

  const submission = db.prepare('SELECT * FROM submissions WHERE id = ?').get(req.params.id);
  if (!submission) return res.status(404).json({ error: '提交不存在' });

  const updateStatus = db.prepare(`
    UPDATE submissions SET status = ?, reviewed_at = datetime('now','localtime'), review_note = ? WHERE id = ?
  `);

  if (status === 'approved') {
    const payload = JSON.parse(submission.payload);
    const applyApproval = getApprovalHandler(submission.type, payload);
    const transaction = db.transaction(() => {
      applyApproval();
      updateStatus.run(status, review_note || '', req.params.id);
    });
    transaction();
  } else {
    updateStatus.run(status, review_note || '', req.params.id);
  }

  res.json({ success: true });
});

function getApprovalHandler(type, payload) {
  switch (type) {
    case 'landlord':
      return () => {
        db.prepare(`
          INSERT INTO landlords (area_id, name, is_agent, score, red_tags, black_tags, comment)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          payload.area_id,
          payload.name,
          payload.is_agent || 0,
          payload.score || 0,
          JSON.stringify(payload.red_tags || []),
          JSON.stringify(payload.black_tags || []),
          payload.comment || ''
        );
      };

    case 'area_rating':
      return () => {
        const dimensions = ['sanitation', 'convenience', 'safety', 'overall'];
        dimensions.forEach(dim => {
          if (payload[dim] !== undefined) {
            const existing = db.prepare(
              'SELECT score FROM area_ratings WHERE area_id = ? AND dimension = ?'
            ).get(payload.area_id, dim);

            if (existing) {
              const newScore = Math.round((existing.score * 0.8 + payload[dim] * 0.2) * 10) / 10;
              db.prepare('UPDATE area_ratings SET score = ? WHERE area_id = ? AND dimension = ?')
                .run(newScore, payload.area_id, dim);
            } else {
              db.prepare('INSERT INTO area_ratings (area_id, dimension, score) VALUES (?, ?, ?)')
                .run(payload.area_id, dim, payload[dim]);
            }
          }
        });
      };

    case 'rental_rules':
      return () => {
        const existing = db.prepare('SELECT id FROM rental_rules WHERE area_id = ?').get(payload.area_id);
        if (existing) {
          const fields = ['payment_method', 'short_term_fee', 'water_rate', 'electricity_rate', 'other_fees'];
          const updates = fields.filter(f => payload[f] !== undefined);
          if (updates.length > 0) {
            const setClause = updates.map(f => `${f} = ?`).join(', ');
            db.prepare(`UPDATE rental_rules SET ${setClause}, updated_at = datetime('now','localtime') WHERE area_id = ?`)
              .run(...updates.map(f => payload[f]), payload.area_id);
          }
        } else {
          db.prepare(`
            INSERT INTO rental_rules (area_id, payment_method, short_term_fee, water_rate, electricity_rate, other_fees)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(
            payload.area_id,
            payload.payment_method || '',
            payload.short_term_fee || '',
            payload.water_rate || '',
            payload.electricity_rate || '',
            payload.other_fees || ''
          );
        }
      };

    default:
      return () => {};
  }
}

module.exports = router;
