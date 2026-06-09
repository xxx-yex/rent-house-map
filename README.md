# 广州租房地图

> Web 端广州租房评价平台，帮助租客快速了解各地区租房环境、规则和房东口碑。

## 文档索引

| 文档 | 说明 |
|------|------|
| [PRD](docs/PRD.md) | 产品需求 — 定位、信息架构、页面规划 |
| [DESIGN](docs/DESIGN.md) | 设计规范 — 配色系统、动画规范、响应式布局 |
| [ARCHITECTURE](docs/ARCHITECTURE.md) | 技术架构 — 技术栈、项目结构、关键决策 |
| [DATABASE](docs/DATABASE.md) | 数据库设计 — 表结构、ER 关系、种子数据 |
| [API](docs/API.md) | 接口文档 — 公共接口、用户提交、管理端 |
| [ROADMAP](docs/ROADMAP.md) | 迭代路线图 — 版本规划、开发进度 |
| [V1.1](docs/V1.1.md) | v1.1 体验补全 — 开发计划 |
| [CRAWL_WORKFLOW](docs/douyin/CRAWL_WORKFLOW.md) | 抖音评论采集工作流 |
| [DOUYIN_DATA_FORMAT](docs/douyin/DOUYIN_DATA_FORMAT.md) | 抖音数据导入格式规范 |
| [DOUYIN_DATA_EXAMPLES](docs/douyin/DOUYIN_DATA_EXAMPLES.md) | 抖音评论分类与转换示例集 |

## 快速开始

```bash
# 启动后端
cd server && npm start        # http://localhost:3000

# 启动前端
cd client && npm run dev      # http://localhost:5173
```

## 当前版本：v1.1 体验补全（开发中）

> v1.0 MVP 已完成，正在进行 v1.1 开发，详见 [V1.1 开发计划](docs/V1.1.md)

## v1.0 MVP — 已完成

- 42 个地区数据，覆盖广州 7 个行政区
- 地区评分 / 租房规则 / 房东红黑榜
- 管理员审核系统
- 首页迷宫动画 + 地铁线路分组
