<template>
  <div class="page">
    <!-- 加载状态 -->
    <div v-if="loading" class="detail-grid">
      <div class="detail-left">
        <SkeletonCard />
        <SkeletonCard style="margin-top:16px" />
      </div>
      <div class="detail-right">
        <SkeletonCard />
        <SkeletonCard style="margin-top:12px" />
        <SkeletonCard style="margin-top:12px" />
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="hasError" class="error-state">
      <p>加载失败，请稍后重试</p>
      <button class="btn btn-primary" @click="loadData">重新加载</button>
    </div>

    <!-- 正常内容 -->
    <template v-else>
    <header class="area-header">
      <router-link to="/areas" class="back">← 返回</router-link>
      <h2>{{ area.name || '-' }}</h2>
      <p class="meta">{{ area.district || '-' }} · {{ area.metro_line || '-' }}</p>
      <p class="desc">{{ area.description || '' }}</p>
    </header>

    <div class="detail-grid">
      <div class="detail-left">
        <!-- 地区评分 -->
        <div class="section" ref="ratingSectionRef">
          <div class="section-title">地区评分</div>
          <div class="card">
            <div v-for="dim in ratingDims" :key="dim.key" class="rating-row">
              <span class="dim-label">{{ dim.label }}</span>
              <div class="rating-bar-bg">
                <div class="rating-bar-fill" :style="{ width: ratingVisible ? (area.ratings?.[dim.key] || 0) / 5 * 100 + '%' : '0%' }"></div>
              </div>
              <span class="dim-score">{{ area.ratings?.[dim.key] || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- 租房规则 -->
        <div class="section">
          <div class="section-title">租房基本规则</div>
          <div class="card rules-grid">
            <div class="rule-item">
              <span class="rule-label">付款方式</span>
              <span class="rule-value">{{ area.rules?.payment_method || '-' }}</span>
            </div>
            <div class="rule-item">
              <span class="rule-label">短租费</span>
              <span class="rule-value">{{ area.rules?.short_term_fee || '-' }}</span>
            </div>
            <div class="rule-item">
              <span class="rule-label">水费</span>
              <span class="rule-value">{{ area.rules?.water_rate || '-' }}</span>
            </div>
            <div class="rule-item">
              <span class="rule-label">电费</span>
              <span class="rule-value">{{ area.rules?.electricity_rate || '-' }}</span>
            </div>
            <div class="rule-item">
              <span class="rule-label">其他费用</span>
              <span class="rule-value">{{ area.rules?.other_fees || '-' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 房东列表 -->
      <div class="detail-right">
        <div class="section">
          <div class="section-title">房东/中介评价（{{ landlords.length }}）</div>

          <div v-if="landlords.length === 0" class="card empty-card">
            <div class="empty-icon">?</div>
            <div class="empty-text">未知区域待探索</div>
            <div class="empty-sub">暂无房东/中介评价数据</div>
          </div>

          <div v-for="l in landlords" :key="l.id" class="card landlord-card">
            <div class="landlord-header">
              <span class="landlord-name">{{ l.name }}</span>
              <span class="landlord-type">{{ l.is_agent ? '中介' : '房东' }}</span>
              <span class="landlord-score" :class="l.score >= 3 ? 'score-good' : 'score-bad'">{{ l.score }}</span>
            </div>
            <div class="tags-row">
              <span v-for="tag in l.redTags" :key="tag" class="tag tag-red tag-pop">{{ tag }}</span>
              <span v-for="tag in l.blackTags" :key="tag" class="tag tag-black tag-pop">{{ tag }}</span>
            </div>
            <p v-if="l.comment" class="landlord-comment">{{ l.comment }}</p>
            <div v-if="l.proof_images && l.proof_images.length" class="landlord-images">
              <img v-for="url in l.proof_images" :key="url" :src="url" class="landlord-img" @click="previewUrl = url" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="section" style="text-align:center; margin-top:8px;">
      <router-link :to="`/submit?area_id=${area.id}`" class="btn btn-primary">提交租房评价</router-link>
    </div>
    </template>

    <!-- 图片预览 -->
    <div v-if="previewUrl" class="preview-overlay" @click="previewUrl = null">
      <img :src="previewUrl" class="preview-img" />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'
import SkeletonCard from '../components/SkeletonCard.vue'
import { useScrollReveal } from '../composables/useScrollReveal'

const RATING_DIMS = [
  { key: 'sanitation', label: '环境卫生' },
  { key: 'convenience', label: '便利程度' },
  { key: 'safety', label: '安全感' },
  { key: 'overall', label: '综合评分' },
]

export default {
  components: { SkeletonCard },
  setup() {
    const route = useRoute()
    const area = ref({})
    const landlords = ref([])
    const ratingDims = RATING_DIMS
    const loading = ref(true)
    const hasError = ref(false)
    const previewUrl = ref(null)
    const ratingVisible = ref(false)
    const ratingSectionRef = ref(null)

    async function loadData() {
      loading.value = true
      hasError.value = false
      try {
        const id = route.params.id
        const [areaData, landlordData] = await Promise.all([
          api.get('/areas/' + id),
          api.get('/areas/' + id + '/landlords'),
        ])
        area.value = areaData
        api.post('/areas/' + id + '/view').catch(() => {})
        landlords.value = (landlordData.list || []).map(l => ({
          ...l,
          redTags: typeof l.red_tags === 'string' ? JSON.parse(l.red_tags || '[]') : (l.red_tags || []),
          blackTags: typeof l.black_tags === 'string' ? JSON.parse(l.black_tags || '[]') : (l.black_tags || []),
        }))
      } catch {
        hasError.value = true
      } finally {
        loading.value = false
        await nextTick()
        if (ratingSectionRef.value) {
          const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { ratingVisible.value = true; observer.disconnect() } },
            { threshold: 0.3 }
          )
          observer.observe(ratingSectionRef.value)
        }
        useScrollReveal('.landlord-card')
      }
    }

    onMounted(loadData)

    return { area, landlords, ratingDims, loading, hasError, loadData, previewUrl, ratingVisible, ratingSectionRef }
  }
}
</script>

<style scoped>
.area-header { margin-bottom: 20px; }
.error-state { text-align: center; padding: 60px 16px; color: var(--text-200); }
.error-state p { margin-bottom: 16px; }
.back { font-size: 13px; color: var(--text-200); }
.area-header h2 { font-size: 22px; font-weight: 700; margin-top: 8px; }
.meta { font-size: 13px; color: var(--text-200); margin-top: 2px; }
.desc { font-size: 14px; color: var(--text-200); margin-top: 8px; line-height: 1.5; }

.detail-grid {
  display: flex;
  flex-direction: column;
}

.rating-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.dim-label { width: 60px; font-size: 13px; color: var(--text-200); flex-shrink: 0; }
.rating-bar-bg { flex: 1; height: 8px; background: var(--bg-200); border-radius: 4px; overflow: hidden; }
.rating-bar-fill { height: 100%; background: var(--primary-300); border-radius: 4px; transition: width 0.8s ease-out; }
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

.empty-card { text-align: center; padding: 32px 16px; }
.empty-icon { font-size: 36px; color: var(--bg-300); margin-bottom: 8px; }
.empty-text { font-size: 16px; font-weight: 600; color: var(--text-100); }
.empty-sub { font-size: 13px; color: var(--text-200); margin-top: 4px; }

.landlord-images { margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap; }
.landlord-img { width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 1px solid var(--bg-200); }
.preview-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 9999;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.preview-img { max-width: 90%; max-height: 90%; border-radius: 8px; }

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
