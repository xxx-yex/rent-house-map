const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'rental.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS areas (
    id            INTEGER PRIMARY KEY,
    name          TEXT    NOT NULL UNIQUE,
    district      TEXT    NOT NULL,
    metro_line    TEXT    DEFAULT '',
    description   TEXT    DEFAULT '',
    created_at    TEXT    DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS area_ratings (
    id            INTEGER PRIMARY KEY,
    area_id       INTEGER NOT NULL,
    dimension     TEXT    NOT NULL,
    score         REAL    NOT NULL DEFAULT 0 CHECK(score >= 0 AND score <= 5),
    updated_at    TEXT    DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE,
    UNIQUE(area_id, dimension)
  );

  CREATE TABLE IF NOT EXISTS rental_rules (
    id            INTEGER PRIMARY KEY,
    area_id       INTEGER NOT NULL UNIQUE,
    payment_method TEXT   DEFAULT '',
    short_term_fee TEXT   DEFAULT '',
    water_rate    TEXT    DEFAULT '',
    electricity_rate TEXT DEFAULT '',
    other_fees    TEXT    DEFAULT '',
    updated_at    TEXT    DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS landlords (
    id            INTEGER PRIMARY KEY,
    area_id       INTEGER NOT NULL,
    name          TEXT    NOT NULL,
    is_agent      INTEGER DEFAULT 0,
    score         REAL    DEFAULT 0 CHECK(score >= 0 AND score <= 5),
    red_tags      TEXT    DEFAULT '[]',
    black_tags    TEXT    DEFAULT '[]',
    comment       TEXT    DEFAULT '',
    proof_images  TEXT    DEFAULT '[]',
    created_at    TEXT    DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id            INTEGER PRIMARY KEY,
    type          TEXT    NOT NULL,
    area_id       INTEGER,
    payload       TEXT    NOT NULL,
    submitter_note TEXT   DEFAULT '',
    proof_images  TEXT    DEFAULT '[]',
    status        TEXT    DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
    reviewed_at   TEXT,
    review_note   TEXT    DEFAULT '',
    created_at    TEXT    DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL
  );
`);

const insertArea = db.prepare(`INSERT OR IGNORE INTO areas (name, district, metro_line, description) VALUES (?, ?, ?, ?)`);
const insertRating = db.prepare(`INSERT OR IGNORE INTO area_ratings (area_id, dimension, score) VALUES (?, ?, ?)`);
const insertRules = db.prepare(`INSERT OR IGNORE INTO rental_rules (area_id, payment_method, short_term_fee, water_rate, electricity_rate, other_fees) VALUES (?, ?, ?, ?, ?, ?)`);
const insertLandlord = db.prepare(`INSERT INTO landlords (area_id, name, is_agent, score, red_tags, black_tags, comment) VALUES (?, ?, ?, ?, ?, ?, ?)`);

const seedData = db.transaction(() => {
  const areas = [
    // === 天河区 ===
    ['棠下', '天河区', '13/21号线', '天河区典型城中村，靠近BRT棠下站，生活便利但巷子较深'],
    ['石牌', '天河区', '3号线', '天河核心区，巷子密集环境复杂，但交通极其便利，靠近岗顶IT圈'],
    ['车陂', '天河区', '4/13号线', '车陂南地铁站旁，租金相对实惠，生活配套成熟'],
    ['龙洞', '天河区', '6号线', '靠近高校区，学生租客多，环境相对较好，物价低'],
    ['员村', '天河区', '5号线', '临近珠江新城，性价比不错的选择，老城区氛围浓厚'],
    ['冼村', '天河区', '5号线', '紧邻珠江新城CBD，地段优越但租金偏高，部分已改造'],
    ['猎德', '天河区', '5号线', '已改造城中村，环境较好但租金较高，靠近珠江新城'],
    ['上社', '天河区', 'BRT', 'BRT上社站旁，交通方便，靠近天河软件园'],
    ['黄村', '天河区', '4/21号线', '奥体中心附近，环境相对开阔，地铁直达'],
    ['元岗', '天河区', '3/6号线', '天河客运站旁，交通枢纽，房源选择多'],
    ['长湴', '天河区', '6号线', '龙洞隔壁，靠近华南植物园，环境清幽'],
    ['岑村', '天河区', '公交', '靠近华南快速，以公交出行为主，租金便宜'],

    // === 海珠区 ===
    ['客村', '海珠区', '3/8号线', '双地铁交汇，交通枢纽，生活便利，餐饮丰富'],
    ['赤岗', '海珠区', '8号线', '靠近广州塔，地铁便利，租金适中'],
    ['康鹭', '海珠区', '8号线', '康乐村+鹭江村片区，中大站附近，制衣厂聚集，大规模改造中'],
    ['大塘', '海珠区', '3号线', '地铁直达，靠近海珠湖，生活配套齐全'],
    ['瑞宝', '海珠区', '2号线', '南洲站附近，租金便宜，临近海珠创新湾'],
    ['沥滘', '海珠区', '广佛/3号线', '广佛线南端终点，改造中，租金较低'],
    ['石溪', '海珠区', '广佛线', '广佛线石溪站，改造进行中，临江地段'],

    // === 白云区 ===
    ['三元里', '白云区', '2号线', '广州老牌城中村，靠近火车站，人口密集'],
    ['同和', '白云区', '3号线', '统租统管试点村，管理规范，靠近南方医院'],
    ['黄边', '白云区', '2号线', '地铁直达，设计之都旁，近年发展较快'],
    ['嘉禾望岗', '白云区', '2/3/14号线', '三线交汇枢纽，房源丰富，租金实惠'],
    ['永泰', '白云区', '3号线', '地铁旁，生活便利，租金较低'],
    ['萧岗', '白云区', '2号线', '地铁直达，靠近白云山，环境较好'],
    ['大源', '白云区', '公交', '广州最大城中村之一，电商聚集地，房源极多'],
    ['陈田', '白云区', '2号线', '江夏站附近，改造中，靠近白云大道北'],

    // === 番禺区 ===
    ['大石', '番禺区', '3号线', '番禺最热门城中村之一，直达天河，通勤方便'],
    ['厦滘', '番禺区', '3号线', '地铁旁，靠近万博商圈，租金便宜'],
    ['南浦', '番禺区', '2号线', '岛居生活，环境较好，适合家庭居住'],
    ['洛溪', '番禺区', '2号线', '靠近海珠，过桥即到，老牌居住区'],
    ['市桥', '番禺区', '3号线', '番禺老城区，配套成熟，生活便利'],
    ['大学城南', '番禺区', '4号线', '高校聚集区，学生租房热门，环境好'],

    // === 荔湾区 ===
    ['坑口', '荔湾区', '1号线', '地铁直达，老广生活区，租金实惠'],
    ['西塱', '荔湾区', '1号线', '地铁1号线西端，租金便宜，旧改进行中'],
    ['东漖', '荔湾区', '1号线', '坑口附近，新社区较多，居住环境改善'],
    ['花地湾', '荔湾区', '1号线', '地铁旁，老城区生活气息浓，配套成熟'],

    // === 越秀区 ===
    ['登峰', '越秀区', '5号线', '小北站旁，靠近淘金商圈，租金偏高'],
    ['寺右', '越秀区', '5号线', '五羊邨附近，老城区核心地段，生活便利'],

    // === 黄埔区 ===
    ['大沙地', '黄埔区', '5号线', '黄埔老城区中心，配套成熟，租金适中'],
    ['文冲', '黄埔区', '5号线', '地铁直达，靠近石化厂区，租金较低'],
    ['南岗', '黄埔区', '13号线', '开发区附近，通勤天河需转线，租金便宜'],
  ];

  const areaIds = {};
  areas.forEach(([name, district, metro, desc]) => {
    insertArea.run(name, district, metro, desc);
    const row = db.prepare('SELECT id FROM areas WHERE name = ?').get(name);
    areaIds[name] = row.id;
  });

  // 为每个地区生成评分和规则
  const districts = areas.map(([name, district, metro, desc]) => {
    const seed = hashStr(name);
    return {
      name,
      ratings: {
        sanitation: clampScore(2.0 + (seed % 30) / 10),
        convenience: clampScore(2.5 + (seed % 25) / 10),
        safety: clampScore(2.5 + (seed % 20) / 10),
        overall: clampScore(2.8 + (seed % 22) / 10),
      }
    };
  });

  districts.forEach(({ name, ratings }) => {
    const id = areaIds[name];
    if (!id) return;
    Object.entries(ratings).forEach(([dim, score]) => {
      insertRating.run(id, dim, score);
    });
  });

  // 租房规则
  const rulesData = [
    ['棠下', '押一付一', '短租加收200/月', '6元/吨', '1.5元/度', '管理费50/月'],
    ['石牌', '押一付一', '无', '5元/吨', '1.5元/度', '无'],
    ['车陂', '押一付一', '短租加收100/月', '5元/吨', '1.2元/度', '垃圾费20/月'],
    ['龙洞', '押一付一', '无', '5元/吨', '1.0元/度', '无'],
    ['员村', '押二付一', '无', '6元/吨', '1.5元/度', '管理费30/月'],
    ['冼村', '押二付一', '无', '6元/吨', '1.5元/度', '管理费80/月'],
    ['猎德', '押二付一', '无', '6元/吨', '1.2元/度', '物业费100/月'],
    ['上社', '押一付一', '短租加收150/月', '5元/吨', '1.3元/度', '管理费40/月'],
    ['黄村', '押一付一', '无', '5元/吨', '1.2元/度', '无'],
    ['元岗', '押一付一', '短租加收200/月', '5元/吨', '1.5元/度', '管理费30/月'],
    ['长湴', '押一付一', '无', '5元/吨', '1.0元/度', '无'],
    ['岑村', '押一付一', '无', '5元/吨', '1.0元/度', '无'],
    ['客村', '押一付一', '短租加收200/月', '6元/吨', '1.5元/度', '管理费50/月'],
    ['赤岗', '押一付一', '无', '5元/吨', '1.3元/度', '管理费30/月'],
    ['康鹭', '押一付一', '无', '5元/吨', '1.5元/度', '无'],
    ['大塘', '押一付一', '无', '5元/吨', '1.2元/度', '管理费20/月'],
    ['瑞宝', '押一付一', '无', '5元/吨', '1.0元/度', '无'],
    ['沥滘', '押一付一', '无', '5元/吨', '1.0元/度', '无'],
    ['石溪', '押一付一', '无', '5元/吨', '1.2元/度', '无'],
    ['三元里', '押一付一', '短租加收150/月', '6元/吨', '1.5元/度', '管理费40/月'],
    ['同和', '押一付一', '无', '5元/吨', '1.0元/度', '管理费50/月'],
    ['黄边', '押一付一', '无', '5元/吨', '1.2元/度', '管理费30/月'],
    ['嘉禾望岗', '押一付一', '无', '5元/吨', '1.0元/度', '无'],
    ['永泰', '押一付一', '无', '5元/吨', '1.0元/度', '无'],
    ['萧岗', '押一付一', '无', '5元/吨', '1.2元/度', '无'],
    ['大源', '押一付一', '短租加收100/月', '5元/吨', '1.0元/度', '管理费30/月'],
    ['陈田', '押一付一', '无', '5元/吨', '1.2元/度', '无'],
    ['大石', '押一付一', '短租加收200/月', '5元/吨', '1.3元/度', '管理费40/月'],
    ['厦滘', '押一付一', '无', '5元/吨', '1.2元/度', '管理费20/月'],
    ['南浦', '押一付一', '无', '5元/吨', '1.0元/度', '物业费60/月'],
    ['洛溪', '押一付一', '无', '5元/吨', '1.2元/度', '物业费80/月'],
    ['市桥', '押一付一', '无', '5元/吨', '1.0元/度', '无'],
    ['大学城南', '押一付一', '无', '5元/吨', '0.9元/度', '无'],
    ['坑口', '押一付一', '无', '5元/吨', '1.2元/度', '无'],
    ['西塱', '押一付一', '无', '5元/吨', '1.0元/度', '无'],
    ['东漖', '押一付一', '无', '5元/吨', '1.0元/度', '管理费30/月'],
    ['花地湾', '押一付一', '无', '5元/吨', '1.2元/度', '管理费40/月'],
    ['登峰', '押二付一', '无', '6元/吨', '1.5元/度', '管理费60/月'],
    ['寺右', '押二付一', '无', '6元/吨', '1.5元/度', '管理费80/月'],
    ['大沙地', '押一付一', '无', '5元/吨', '1.2元/度', '管理费30/月'],
    ['文冲', '押一付一', '无', '5元/吨', '1.0元/度', '无'],
    ['南岗', '押一付一', '无', '5元/吨', '1.0元/度', '无'],
  ];
  rulesData.forEach(([name, pay, short, water, elec, other]) => {
    const id = areaIds[name];
    if (id) insertRules.run(id, pay, short, water, elec, other);
  });

  // 房东评价（部分热门地区）
  const landlords = [
    ['棠下', '张阿姨', 0, 4.5, '["维修积极","押金秒退"]', '[]', '住了两年，阿姨人很好，有问题随叫随到'],
    ['棠下', '李哥租房', 1, 2.1, '[]', '["押金不退","隐性收费"]', '退房时扣了800块各种费用，不给明细'],
    ['石牌', '王叔', 0, 4.0, '["态度友好","价格公道"]', '["维修拖延"]', '人不错就是修东西比较慢'],
    ['石牌', '赵某', 0, 1.5, '[]', '["押金不退","态度恶劣","随意涨租"]', '第二年直接涨租500，不同意就搬走'],
    ['车陂', '刘姐', 0, 4.2, '["维修积极","房间整洁"]', '[]', '房间收拾很干净，下水道堵了一天内修好'],
    ['龙洞', '陈房东', 0, 3.8, '["采光充足"]', '["噪音严重"]', '采光好但靠路边比较吵'],
    ['员村', '黄中介', 1, 2.8, '[]', '["虚假房源"]', '网上看的图和实际差太多'],
    ['员村', '周阿姨', 0, 4.5, '["押金秒退","态度友好","价格公道"]', '[]', '良心房东，住了一年多很舒心'],
    ['客村', '林姐', 0, 4.3, '["态度友好","周边便利"]', '[]', '楼下就是地铁站和超市，很方便'],
    ['客村', '某中介公司', 1, 2.0, '[]', '["隐性收费","虚假房源"]', '带看收费，图片和实物严重不符'],
    ['三元里', '吴叔', 0, 3.5, '["价格公道"]', '["维修拖延","噪音严重"]', '价格确实便宜但维护一般'],
    ['同和', '郑阿姨', 0, 4.6, '["维修积极","押金秒退","态度友好"]', '[]', '统租管理后规范很多，阿姨很负责'],
    ['大石', '陈哥', 0, 3.9, '["价格公道","采光充足"]', '["噪音严重"]', '价格实惠适合通勤族，就是隔音差'],
    ['大石', '某房产', 1, 1.8, '[]', '["押金不退","态度恶劣","隐性收费"]', '退房各种扣钱，押金基本拿不回来'],
    ['厦滘', '何姐', 0, 4.0, '["态度友好","房间整洁"]', '[]', '房子收拾得干净，回复也很及时'],
    ['黄边', '曾叔', 0, 3.7, '["价格公道"]', '["维修拖延"]', '便宜但修东西要催好几遍'],
    ['嘉禾望岗', '何房东', 0, 3.5, '["价格公道"]', '["经常断电"]', '隔三差五停电，说是线路老化'],
    ['冼村', '赵姐', 0, 3.2, '["周边便利"]', '["水电高价","隐性收费"]', '位置好但水电费比别的村贵不少'],
    ['登峰', '马叔', 0, 4.0, '["态度友好","维修积极"]', '[]', '越秀区少见的好房东，房子保养很好'],
    ['大沙地', '梁姐', 0, 4.1, '["价格公道","押金秒退"]', '[]', '黄埔区性价比很高的选择'],
  ];
  landlords.forEach(([name, lname, agent, score, red, black, comment]) => {
    const id = areaIds[name];
    if (id) insertLandlord.run(id, lname, agent, score, red, black, comment);
  });
});

function hashStr(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function clampScore(val) {
  return Math.round(Math.min(5, Math.max(1, val)) * 10) / 10;
}

seedData();
console.log('数据库初始化完成');
const count = db.prepare('SELECT COUNT(*) as c FROM areas').get();
console.log(`已插入 ${count.c} 个地区`);
db.close();
