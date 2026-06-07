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
      <div class="section search-section">
        <input
          class="search-box"
          v-model="searchKeyword"
          placeholder="搜索地区（如棠下、石牌、客村）..."
          @input="onSearch"
        />
        <div v-if="searchKeyword.trim()" class="search-results card">
          <div v-if="searchResults.length === 0" class="search-empty">未找到匹配的地区</div>
          <router-link v-for="area in searchResults" :key="area.id" :to="`/areas/${area.id}`" class="search-result-item" @click="searchKeyword = ''">
            <span class="search-result-name">{{ area.name }}</span>
            <span class="search-result-meta">{{ area.district }} · {{ area.metro_line }}</span>
          </router-link>
        </div>
      </div>

      <!-- 按地铁线路展示热门 -->
      <div v-if="hotList.length > 0" class="section">
        <div class="section-title">热搜榜 <span class="hot-sub">近30天</span></div>
        <div class="hot-list">
          <router-link v-for="(item, idx) in hotList" :key="item.id" :to="`/areas/${item.id}`" class="hot-item">
            <span class="hot-rank" :class="{ 'hot-top': idx < 3 }">{{ idx + 1 }}</span>
            <div class="hot-info">
              <span class="hot-name">{{ item.name }}</span>
              <span class="hot-meta">{{ item.district }}</span>
            </div>
            <span class="hot-count">{{ item.search_count }}次</span>
          </router-link>
        </div>
      </div>

      <div class="section">
        <div class="section-title">按地铁线路选房</div>
        <div class="line-tabs">
          <button
            v-for="line in availableLines"
            :key="line"
            class="line-tab"
            :class="{ active: selectedLine === line }"
            :style="selectedLine === line ? { background: lineColors[line] || '#666', color: '#fff' } : {}"
            @click="selectedLine = line"
          >{{ line }}</button>
        </div>
        <div v-if="currentLineAreas.length" class="area-grid">
          <router-link v-for="area in currentLineAreas" :key="area.id" :to="`/areas/${area.id}`" class="area-card card">
            <div class="area-name">{{ area.name }}</div>
            <div class="area-meta">{{ area.district }}</div>
            <div class="area-score">
              <span class="score-num">{{ area.avg_score }}</span>
              <span class="score-label">综合</span>
            </div>
            <div class="area-count">{{ area.landlord_count }} 条评价</div>
          </router-link>
        </div>
        <div v-else class="line-empty">该线路暂无地区数据</div>
      </div>

      <div class="section" style="text-align:center; margin-top:16px;">
        <router-link to="/map" class="btn btn-primary" style="margin-right:8px;">查看地铁地图</router-link>
        <router-link to="/areas" class="btn btn-primary" style="background:#fff;color:var(--primary-300);border:1px solid var(--primary-300);">查看全部 42 个地区</router-link>
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
    const hotList = ref([])
    const searchKeyword = ref('')
    const searchResults = ref([])
    const selectedLine = ref('')

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

    onMounted(async () => {
      const [areasData, hotData] = await Promise.all([
        fetch('/api/areas').then(r => r.json()),
        fetch('/api/areas/hot-search').then(r => r.json()),
      ])
      areas.value = areasData
      hotList.value = hotData
      // 默认选中第一条可用线路
      const map = {}
      areasData.forEach(a => {
        parseMetroLines(a.metro_line).forEach(line => {
          if (!map[line]) map[line] = true
        })
      })
      const allLines = Object.keys(map)
      const hotFirst = HOT_LINES.find(l => allLines.includes(l))
      selectedLine.value = hotFirst || allLines[0] || ''
    })

    function onSearch() {
      const kw = searchKeyword.value.trim().toLowerCase()
      if (!kw) {
        searchResults.value = []
        return
      }
      searchResults.value = areas.value.filter(a =>
        a.name.toLowerCase().includes(kw) ||
        a.district.toLowerCase().includes(kw) ||
        a.metro_line.toLowerCase().includes(kw)
      )
    }

    const lineAreaMap = computed(() => {
      const map = {}
      areas.value.forEach(area => {
        const lines = parseMetroLines(area.metro_line)
        lines.forEach(line => {
          if (!map[line]) map[line] = []
          if (!map[line].find(a => a.id === area.id)) {
            map[line].push(area)
          }
        })
      })
      return map
    })

    const availableLines = computed(() => {
      const all = Object.keys(lineAreaMap.value)
      const ordered = HOT_LINES.filter(l => all.includes(l))
      all.filter(l => !ordered.includes(l)).forEach(l => ordered.push(l))
      return ordered
    })

    const currentLineAreas = computed(() => lineAreaMap.value[selectedLine.value] || [])

    return { areas, hotList, lineColors, searchKeyword, searchResults, onSearch, selectedLine, availableLines, currentLineAreas }
  }
}
</script>

<style scoped>
.hero-section { width: 100%; background: #FFFFFF; }
.hero-title { text-align: center; padding: 0 0 24px; }
.hero-title h1 { font-size: 22px; font-weight: 700; color: var(--text-100); letter-spacing: 2px; }
.hero-title p { font-size: 13px; color: var(--text-200); margin-top: 4px; }

.search-box-link { text-decoration: none; display: block; }
.search-section { position: relative; }
.search-results {
  position: absolute; left: 0; right: 0; top: 100%;
  z-index: 100; max-height: 320px; overflow-y: auto;
  margin-top: 4px; padding: 4px 0;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
.search-empty { padding: 16px; text-align: center; color: var(--text-200); font-size: 14px; }
.search-result-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; text-decoration: none; color: inherit;
  border-bottom: 1px solid var(--bg-200);
}
.search-result-item:last-child { border-bottom: none; }
.search-result-item:hover { background: var(--bg-100); }
.search-result-name { font-size: 14px; font-weight: 600; }
.search-result-meta { font-size: 12px; color: var(--text-200); flex-shrink: 0; margin-left: 12px; }

.line-tabs {
  display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px;
}
.line-tab {
  padding: 5px 14px; border-radius: 20px; border: 1px solid var(--bg-200);
  font-size: 13px; font-weight: 600; cursor: pointer; background: var(--bg-100);
  color: var(--text-200); transition: all .15s;
}
.line-tab:hover { border-color: var(--text-200); }
.line-tab.active { border-color: transparent; color: #fff; }
.line-empty { padding: 24px; text-align: center; color: var(--text-200); font-size: 14px; }

.area-grid { display: flex; flex-direction: column; gap: 0; }
.area-card { display: block; text-decoration: none; color: inherit; }
.area-name { font-size: 15px; font-weight: 600; }
.area-meta { font-size: 12px; color: var(--text-200); margin-top: 2px; }
.area-score { display: flex; align-items: baseline; gap: 6px; margin-top: 6px; }
.score-num { font-size: 20px; font-weight: 700; color: var(--primary-300); }
.score-label { font-size: 12px; color: var(--text-200); }
.area-count { font-size: 12px; color: var(--text-200); margin-top: 2px; }

.section-title { font-size: 16px; font-weight: 700; color: var(--text-100); margin-bottom: 12px; }
.hot-sub { font-size: 12px; font-weight: 400; color: var(--text-200); margin-left: 6px; }
.hot-list { display: flex; flex-direction: column; gap: 0; }
.hot-item {
  display: flex; align-items: center; gap: 12px; padding: 10px 0;
  border-bottom: 1px solid var(--bg-200); text-decoration: none; color: inherit;
}
.hot-item:last-child { border-bottom: none; }
.hot-rank {
  width: 22px; height: 22px; border-radius: 6px; font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-200); color: var(--text-200); flex-shrink: 0;
}
.hot-top { background: var(--primary-300); color: #fff; }
.hot-info { flex: 1; min-width: 0; }
.hot-name { font-size: 14px; font-weight: 600; display: block; }
.hot-meta { font-size: 12px; color: var(--text-200); }
.hot-count { font-size: 12px; color: var(--text-200); flex-shrink: 0; }

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
