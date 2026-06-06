<template>
  <div class="page">
    <header class="area-header">
      <router-link to="/areas" class="back">← 返回</router-link>
      <h2>棠下</h2>
      <p class="meta">天河区 · 21号线</p>
      <p class="desc">棠下村是天河区典型城中村，靠近BRT棠下站，生活便利但巷子较深</p>
    </header>

    <!-- PC端：评分+规则并排 -->
    <div class="detail-grid">
      <div class="detail-left">
        <!-- 地区评分 -->
        <div class="section">
          <div class="section-title">地区评分</div>
          <div class="card">
            <div class="rating-row">
              <span class="dim-label">环境卫生</span>
              <div class="rating-bar-bg">
                <div class="rating-bar-fill" style="width:50%"></div>
              </div>
              <span class="dim-score">2.5</span>
            </div>
            <div class="rating-row">
              <span class="dim-label">便利程度</span>
              <div class="rating-bar-bg">
                <div class="rating-bar-fill" style="width:80%"></div>
              </div>
              <span class="dim-score">4.0</span>
            </div>
            <div class="rating-row">
              <span class="dim-label">安全感</span>
              <div class="rating-bar-bg">
                <div class="rating-bar-fill" style="width:60%"></div>
              </div>
              <span class="dim-score">3.0</span>
            </div>
            <div class="rating-row">
              <span class="dim-label">综合评分</span>
              <div class="rating-bar-bg">
                <div class="rating-bar-fill" style="width:64%"></div>
              </div>
              <span class="dim-score">3.2</span>
            </div>
          </div>
        </div>

        <!-- 租房规则 -->
        <div class="section">
          <div class="section-title">租房基本规则</div>
          <div class="card rules-grid">
            <div class="rule-item">
              <span class="rule-label">付款方式</span>
              <span class="rule-value">押一付一</span>
            </div>
            <div class="rule-item">
              <span class="rule-label">短租费</span>
              <span class="rule-value">短租加收200/月</span>
            </div>
            <div class="rule-item">
              <span class="rule-label">水费</span>
              <span class="rule-value">6元/吨</span>
            </div>
            <div class="rule-item">
              <span class="rule-label">电费</span>
              <span class="rule-value">1.5元/度</span>
            </div>
            <div class="rule-item">
              <span class="rule-label">其他费用</span>
              <span class="rule-value">管理费50/月</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 房东列表：PC端右侧 / 移动端下方 -->
      <div class="detail-right">
        <div class="section">
          <div class="section-title">房东/中介评价（5）</div>

          <div class="card landlord-card">
            <div class="landlord-header">
              <span class="landlord-name">张阿姨</span>
              <span class="landlord-type">房东</span>
              <span class="landlord-score score-good">4.5</span>
            </div>
            <div class="tags-row">
              <span class="tag tag-red">维修积极</span>
              <span class="tag tag-red">押金秒退</span>
            </div>
            <p class="landlord-comment">住了两年，阿姨人很好，有问题随叫随到</p>
          </div>

          <div class="card landlord-card">
            <div class="landlord-header">
              <span class="landlord-name">李哥租房</span>
              <span class="landlord-type">中介</span>
              <span class="landlord-score score-bad">2.1</span>
            </div>
            <div class="tags-row">
              <span class="tag tag-black">押金不退</span>
              <span class="tag tag-black">隐性收费</span>
            </div>
            <p class="landlord-comment">退房时扣了800块各种费用，不给明细</p>
          </div>

          <div class="card landlord-card">
            <div class="landlord-header">
              <span class="landlord-name">王叔</span>
              <span class="landlord-type">房东</span>
              <span class="landlord-score score-good">4.0</span>
            </div>
            <div class="tags-row">
              <span class="tag tag-red">态度友好</span>
              <span class="tag tag-red">价格公道</span>
              <span class="tag tag-black">维修拖延</span>
            </div>
            <p class="landlord-comment">人不错就是修东西比较慢</p>
          </div>

          <div class="card landlord-card">
            <div class="landlord-header">
              <span class="landlord-name">赵某</span>
              <span class="landlord-type">房东</span>
              <span class="landlord-score score-bad">1.5</span>
            </div>
            <div class="tags-row">
              <span class="tag tag-black">押金不退</span>
              <span class="tag tag-black">态度恶劣</span>
              <span class="tag tag-black">随意涨租</span>
            </div>
            <p class="landlord-comment">第二年直接涨租500，不同意就搬走，押金也不退</p>
          </div>

          <div class="card landlord-card">
            <div class="landlord-header">
              <span class="landlord-name">周阿姨</span>
              <span class="landlord-type">房东</span>
              <span class="landlord-score score-good">4.5</span>
            </div>
            <div class="tags-row">
              <span class="tag tag-red">押金秒退</span>
              <span class="tag tag-red">态度友好</span>
              <span class="tag tag-red">价格公道</span>
            </div>
            <p class="landlord-comment">良心房东，住了一年多很舒心</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 提交入口 -->
    <div class="section" style="text-align:center; margin-top:8px;">
      <router-link to="/submit" class="btn btn-primary">提交租房评价</router-link>
    </div>
  </div>
</template>

<style scoped>
.area-header { margin-bottom: 20px; }
.back { font-size: 13px; color: var(--text-200); }
.area-header h2 { font-size: 22px; font-weight: 700; margin-top: 8px; }
.meta { font-size: 13px; color: var(--text-200); margin-top: 2px; }
.desc { font-size: 14px; color: var(--text-200); margin-top: 8px; line-height: 1.5; }

/* 移动端：上下排列 */
.detail-grid {
  display: flex;
  flex-direction: column;
}

.rating-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.dim-label { width: 60px; font-size: 13px; color: var(--text-200); flex-shrink: 0; }
.rating-bar-bg { flex: 1; height: 8px; background: var(--bg-200); border-radius: 4px; overflow: hidden; }
.rating-bar-fill { height: 100%; background: var(--primary-300); border-radius: 4px; transition: width 0.3s; }
.dim-score { width: 28px; font-size: 14px; font-weight: 600; text-align: right; }

.rules-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.rule-item { display: flex; flex-direction: column; gap: 2px; }
.rule-label { font-size: 12px; color: var(--text-200); }
.rule-value { font-size: 14px; font-weight: 500; }

.landlord-header { display: flex; align-items: center; gap: 8px; }
.landlord-name { font-size: 15px; font-weight: 600; }
.landlord-type { font-size: 11px; color: var(--text-200); background: var(--bg-200); padding: 1px 8px; border-radius: 10px; }
.landlord-score { margin-left: auto; font-size: 18px; font-weight: 700; }
.score-good { color: var(--primary-300); }
.score-bad { color: var(--red-badge); }
.tags-row { margin-top: 8px; }
.landlord-comment { margin-top: 8px; font-size: 13px; color: var(--text-200); line-height: 1.5; }

/* PC端：左右分栏 */
@media (min-width: 768px) {
  .area-header h2 { font-size: 28px; }
  .meta { font-size: 14px; }
  .desc { font-size: 15px; }

  .detail-grid {
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: 24px;
    align-items: start;
  }

  .dim-label { width: 70px; font-size: 14px; }
  .dim-score { font-size: 16px; width: 32px; }
  .rating-bar-bg { height: 10px; border-radius: 5px; }
  .rating-bar-fill { border-radius: 5px; }

  .rules-grid { gap: 16px; }
  .rule-label { font-size: 13px; }
  .rule-value { font-size: 15px; }

  .landlord-name { font-size: 16px; }
  .landlord-type { font-size: 12px; }
  .landlord-score { font-size: 22px; }
  .landlord-comment { font-size: 14px; }
}

@media (min-width: 1200px) {
  .detail-grid {
    grid-template-columns: 380px 1fr;
    gap: 32px;
  }
}
</style>
