require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const areasRouter = require('./routes/areas');
const landlordsRouter = require('./routes/landlords');
const submissionsRouter = require('./routes/submissions');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/areas', areasRouter);
app.use('/api/areas', landlordsRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/admin', adminRouter);

app.get('/api/tags', (req, res) => {
  res.json({
    red: ['维修积极', '押金秒退', '态度友好', '房间整洁', '价格公道', '周边便利', '隔音良好', '采光充足'],
    black: ['押金不退', '经常断电', '维修拖延', '隐性收费', '态度恶劣', '噪音严重', '水电高价', '虚假房源', '随意涨租', '限制退租']
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
