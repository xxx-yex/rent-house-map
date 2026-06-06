<template>
  <div class="page">
    <header class="page-header">
      <h2>全部地区</h2>
      <div class="filters">
        <select v-model="filter.line" class="filter-select" @change="filterAreas">
          <option value="">全部线路</option>
          <option v-for="l in metroLines" :key="l" :value="l">{{ l }}</option>
        </select>
        <select v-model="filter.district" class="filter-select" @change="filterAreas">
          <option value="">全部区域</option>
          <option v-for="d in districts" :key="d" :value="d">{{ d }}</option>
        </select>
      </div>
    </header>

    <!-- 按地铁线路分组 -->
    <div v-for="group in grouped" :key="group.line" class="section">
      <div class="line-header">
        <span class="line-badge" :style="{ background: LINE_COLORS[group.line] || '#666' }">{{ group.line }}</span>
        <span class="line-count">{{ group.areas.length }} 个地区</span>
      </div>
      <div class="area-grid">
        <router-link
          v-for="area in group.areas"
          :key="area.id"
          :to="`/areas/${area.id}`"
          class="area-card card"
        >
          <div class="area-name">{{ area.name }}</div>
          <div class="area-meta">{{ area.district }} · {{ area.metro_line }}</div>
          <div class="area-score">
            <span class="score-num">{{ area.avg_score }}</span>
            <span class="score-label">综合</span>
            <span class="area-count">{{ area.landlord_count }} 条评价</span>
          </div>
        </router-link>
      </div>
    </div>

    <div v-if="filtered.length === 0" class="empty">暂无匹配的地区</div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

const LINE_COLORS = {
  '1号线': '#F3D03E', '2号线': '#00629B', '3号线': '#ECA21C',
  '4号线': '#00843D', '5号线': '#C41425', '6号线': '#8B5A2B',
  '7号线': '#9C5E23', '8号线': '#00838A', '13号线': '#8E3D8E',
  '14号线': '#8B7D34', '21号线': '#1B4D8E', '22号线': '#C73E5C',
  '广佛线': '#AF6BB5', 'BRT': '#E8572A', '公交': '#666666',
}

export default {
  setup() {
    const areas = ref([])
    const districts = ref([])
    const metroLines = ref([])
    const filter = ref({ line: '', district: '' })

    onMounted(async () => {
      const [areasData, districtsData, linesData] = await Promise.all([
        fetch('/api/areas').then(r => r.json()),
        fetch('/api/areas/districts').then(r => r.json()),
        fetch('/api/areas/metro-lines').then(r => r.json()),
      ])
      areas.value = areasData
      districts.value = districtsData
      metroLines.value = linesData
    })

    const filtered = computed(() => {
      let list = areas.value
      if (filter.value.line) {
        list = list.filter(a => a.metro_line.includes(filter.value.line))
      }
      if (filter.value.district) {
        list = list.filter(a => a.district === filter.value.district)
      }
      return list
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

    const grouped = computed(() => {
      const map = {}
      filtered.value.forEach(area => {
        const lines = parseMetroLines(area.metro_line)
        lines.forEach(line => {
          if (!map[line]) map[line] = { line, areas: [] }
          // 避免重复添加
          if (!map[line].areas.find(a => a.id === area.id)) {
            map[line].areas.push(area)
          }
        })
      })
      return Object.values(map).sort((a, b) => {
        const numA = parseInt(a.line)
        const numB = parseInt(b.line)
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB
        if (!isNaN(numA)) return -1
        if (!isNaN(numB)) return 1
        return a.line.localeCompare(b.line)
      })
    })

    function filterAreas() {
      // reactive through computed
    }

    function lineClass(line) {
      return { 'line-color': true }
    }

    return { areas, districts, metroLines, filter, filtered, grouped, filterAreas, lineClass, LINE_COLORS }
  }
}
</script>

<style scoped>
.page-header h2 { font-size: 20px; font-weight: 700; margin-bottom: 12px; }
.filters { display: flex; gap: 8px; margin-bottom: 20px; }
.filter-select {
  flex: 1; padding: 10px 12px; border: 1px solid var(--bg-300); border-radius: 8px;
  background: #fff; font-size: 14px; outline: none;
}

.line-header {
  display: flex; align-items: center; gap: 10px; margin-bottom: 12px;
}
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
.score-num { font-size: 18px; font-weight: 700; color: var(--primary-300); }
.score-label { font-size: 12px; color: var(--text-200); }
.area-count { font-size: 12px; color: var(--text-200); margin-left: auto; }

@media (min-width: 768px) {
  .page-header h2 { font-size: 24px; margin-bottom: 16px; }
  .filter-select { padding: 10px 16px; font-size: 14px; }

  .area-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .area-card { margin-bottom: 0; }
  .area-name { font-size: 16px; }
  .score-num { font-size: 20px; }
}

@media (min-width: 1024px) {
  .area-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
}
</style>
