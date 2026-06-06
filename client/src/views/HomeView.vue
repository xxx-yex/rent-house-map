<template>
  <div>
    <section class="hero-section">
      <HeroAnimation />
    </section>
    <div class="hero-title">
      <h1>租房地图</h1>
      <p>真实评价，帮你避雷找房</p>
    </div>

    <div class="page">
      <div class="section">
        <router-link to="/areas" class="search-box-link">
          <input class="search-box" placeholder="搜索地区（如棠下、石牌、客村）..." readonly />
        </router-link>
      </div>

      <!-- 按地铁线路展示热门 -->
      <div v-for="group in hotGroups" :key="group.line" class="section">
        <div class="line-header">
          <span class="line-badge" :style="{ background: lineColors[group.line] || '#666' }">{{ group.line }}</span>
          <span class="line-count">{{ group.areas.length }} 个地区</span>
        </div>
        <div class="area-grid">
          <router-link v-for="area in group.areas" :key="area.id" :to="`/areas/${area.id}`" class="area-card card">
            <div class="area-name">{{ area.name }}</div>
            <div class="area-meta">{{ area.district }}</div>
            <div class="area-score">
              <span class="score-num">{{ area.avg_score }}</span>
              <span class="score-label">综合</span>
            </div>
            <div class="area-count">{{ area.landlord_count }} 条评价</div>
          </router-link>
        </div>
      </div>

      <div class="section" style="text-align:center; margin-top:16px;">
        <router-link to="/areas" class="btn btn-primary">查看全部 42 个地区</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import HeroAnimation from '../components/HeroAnimation.vue'

const lineColors = {
  '1号线': '#F3D03E', '2号线': '#00629B', '3号线': '#ECA21C',
  '4号线': '#00843D', '5号线': '#C41425', '6号线': '#8B5A2B',
  '7号线': '#9C5E23', '8号线': '#00838A', '13号线': '#8E3D8E',
  '14号线': '#8B7D34', '21号线': '#1B4D8E', '22号线': '#C73E5C',
  '广佛线': '#AF6BB5', 'BRT': '#E8572A', '公交': '#666666',
}

// 首页优先展示的热门线路
const HOT_LINES = ['3号线', '5号线', '8号线', '2号线', '4号线', '6号线']

export default {
  components: { HeroAnimation },
  setup() {
    const areas = ref([])

    onMounted(async () => {
      areas.value = await fetch('/api/areas').then(r => r.json())
    })

    function parseMetroLines(metroLine) {
      const parts = metroLine.split('/')
      return parts.map((part, i) => {
        let trimmed = part.trim()
        if (/^\d+$/.test(trimmed)) {
          const last = parts[parts.length - 1].trim()
          if (last.includes('号线')) trimmed += '号线'
        }
        return trimmed
      }).filter(Boolean)
    }

    const hotGroups = computed(() => {
      const map = {}
      areas.value.forEach(area => {
        const lines = parseMetroLines(area.metro_line)
        lines.forEach(line => {
          if (!map[line]) map[line] = { line, areas: [] }
          if (!map[line].areas.find(a => a.id === area.id)) {
            map[line].areas.push(area)
          }
        })
      })
      return HOT_LINES
        .filter(l => map[l])
        .map(l => map[l])
    })

    return { areas, hotGroups, lineColors }
  }
}
</script>

<style scoped>
.hero-section { width: 100%; background: #FFFFFF; }
.hero-title { text-align: center; padding: 0 0 24px; }
.hero-title h1 { font-size: 22px; font-weight: 700; color: var(--text-100); letter-spacing: 2px; }
.hero-title p { font-size: 13px; color: var(--text-200); margin-top: 4px; }

.search-box-link { text-decoration: none; display: block; }

.line-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.line-badge {
  display: inline-block; padding: 3px 12px; border-radius: 20px;
  font-size: 13px; font-weight: 600; color: #fff;
}
.line-count { font-size: 12px; color: var(--text-200); }

.area-grid { display: flex; flex-direction: column; gap: 0; }
.area-card { display: block; text-decoration: none; color: inherit; }
.area-name { font-size: 15px; font-weight: 600; }
.area-meta { font-size: 12px; color: var(--text-200); margin-top: 2px; }
.area-score { display: flex; align-items: baseline; gap: 6px; margin-top: 6px; }
.score-num { font-size: 20px; font-weight: 700; color: var(--primary-300); }
.score-label { font-size: 12px; color: var(--text-200); }
.area-count { font-size: 12px; color: var(--text-200); margin-top: 2px; }

@media (min-width: 768px) {
  .hero-title h1 { font-size: 28px; letter-spacing: 4px; }
  .hero-title p { font-size: 15px; }
  .area-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .area-card { margin-bottom: 0; }
  .score-num { font-size: 24px; }
}
@media (min-width: 1024px) {
  .area-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; }
}
</style>
