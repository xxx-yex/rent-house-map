const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const { district, metro_line, search } = req.query;
  let sql = `
    SELECT a.*,
      COALESCE(ROUND(AVG(ar.score), 1), 0) as avg_score,
      (SELECT COUNT(*) FROM landlords l WHERE l.area_id = a.id) as landlord_count
    FROM areas a
    LEFT JOIN area_ratings ar ON a.id = ar.area_id
    WHERE 1=1
  `;
  const params = [];

  if (district) {
    sql += ' AND a.district = ?';
    params.push(district);
  }
  if (metro_line) {
    sql += ' AND a.metro_line LIKE ?';
    params.push(`%${metro_line}%`);
  }
  if (search) {
    sql += ' AND a.name LIKE ?';
    params.push(`%${search}%`);
  }

  sql += ' GROUP BY a.id ORDER BY a.district, a.name';

  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

router.get('/districts', (req, res) => {
  const rows = db.prepare('SELECT DISTINCT district FROM areas ORDER BY district').all();
  res.json(rows.map(r => r.district));
});

router.get('/metro-lines', (req, res) => {
  const rows = db.prepare("SELECT DISTINCT metro_line FROM areas WHERE metro_line != '' ORDER BY metro_line").all();
  const lines = [];
  rows.forEach(r => {
    const raw = r.metro_line;
    // Handle formats like "3/6号线" → ["3号线", "6号线"]
    const parts = raw.split('/');
    parts.forEach((part, i) => {
      let trimmed = part.trim();
      if (!trimmed) return;
      // If this part is just a number, inherit 号线 from the last part
      if (/^\d+$/.test(trimmed)) {
        const lastPart = parts[parts.length - 1].trim();
        if (lastPart.includes('号线')) trimmed += '号线';
      }
      if (trimmed && !lines.includes(trimmed)) lines.push(trimmed);
    });
  });
  lines.sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    if (!isNaN(numA)) return -1;
    if (!isNaN(numB)) return 1;
    return a.localeCompare(b);
  });
  res.json(lines);
});

// Log a search/view for an area
router.post('/:id/view', (req, res) => {
  const area = db.prepare('SELECT id FROM areas WHERE id = ?').get(req.params.id);
  if (!area) return res.status(404).json({ error: '地区不存在' });
  db.prepare('INSERT INTO search_logs (area_id) VALUES (?)').run(req.params.id);
  res.json({ ok: true });
});

// Hot search ranking (last 30 days)
router.get('/hot-search', (req, res) => {
  const rows = db.prepare(`
    SELECT a.id, a.name, a.district, a.metro_line, a.avg_score,
      COUNT(sl.id) as search_count
    FROM search_logs sl
    JOIN (
      SELECT a2.*, COALESCE(ROUND(AVG(ar.score), 1), 0) as avg_score
      FROM areas a2 LEFT JOIN area_ratings ar ON a2.id = ar.area_id
      GROUP BY a2.id
    ) a ON a.id = sl.area_id
    WHERE sl.searched_at >= datetime('now', 'localtime', '-30 days')
    GROUP BY sl.area_id
    ORDER BY search_count DESC
    LIMIT 10
  `).all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const area = db.prepare('SELECT * FROM areas WHERE id = ?').get(req.params.id);
  if (!area) return res.status(404).json({ error: '地区不存在' });

  const ratings = db.prepare('SELECT dimension, score FROM area_ratings WHERE area_id = ?').all(req.params.id);
  const rules = db.prepare('SELECT * FROM rental_rules WHERE area_id = ?').get(req.params.id);
  const landlordCount = db.prepare('SELECT COUNT(*) as count FROM landlords WHERE area_id = ?').get(req.params.id).count;

  const ratingsMap = {};
  ratings.forEach(r => { ratingsMap[r.dimension] = r.score; });

  res.json({ ...area, ratings: ratingsMap, rules: rules || null, landlordCount });
});

module.exports = router;
