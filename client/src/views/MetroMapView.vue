<template>
  <div class="map-page">
    <div id="metro-map-container">
      <div v-if="loading" class="map-loading">
        <div class="loading-spinner"></div>
        <p>地图加载中...</p>
      </div>
    </div>
    <div v-if="!loading" class="map-legend">
      <div class="legend-title">地铁线路</div>
      <div class="legend-items">
        <span v-for="(color, line) in LINE_COLORS" :key="line" class="legend-item"
              :class="{ active: activeLine === line }" @click="toggleLine(line)">
          <span class="legend-dot" :style="{ background: color }"></span>
          {{ line }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AMapLoader from '@amap/amap-jsapi-loader'
import api from '../api'

const LINE_COLORS = {
  '1号线': '#F3D03E', '2号线': '#00629B', '3号线': '#ECA21C',
  '4号线': '#00843D', '5号线': '#C41425', '6号线': '#8B5A2B',
  '8号线': '#00838A', '13号线': '#8E3D8E', '14号线': '#8B7D34',
  '21号线': '#1B4D8E', '广佛线': '#AF6BB5', 'BRT': '#E8572A', '公交': '#666666',
}

// Real metro line routes (station coordinates from OpenStreetMap)
const METRO_ROUTES = {
  '1号线': [[113.2267,23.0686],[113.2271,23.0817],[113.2287,23.0898],[113.2306,23.1013],[113.2350,23.1119],[113.2367,23.1210],[113.2414,23.1287],[113.2504,23.1280],[113.2588,23.1281],[113.2702,23.1292],[113.2801,23.1293],[113.2902,23.1265],[113.3026,23.1301],[113.3161,23.1338],[113.3229,23.1374],[113.3195,23.1525]],
  '2号线': [[113.2837,23.2399],[113.2819,23.2243],[113.2779,23.2139],[113.2702,23.1924],[113.2656,23.1843],[113.2517,23.1614],[113.2520,23.1506],[113.2561,23.1425],[113.2581,23.1351],[113.2588,23.1281],[113.2603,23.1175],[113.2647,23.1088],[113.2686,23.1000],[113.2715,23.0932],[113.2751,23.0847],[113.2888,23.0740],[113.2925,23.0673],[113.2933,23.0458],[113.2882,23.0362],[113.2812,23.0158],[113.2733,22.9970],[113.2645,22.9917]],
  '3号线': [[113.2997,23.3980],[113.2976,23.3887],[113.2901,23.3578],[113.2902,23.3382],[113.2951,23.2917],[113.2837,23.2399],[113.2920,23.2247],[113.3008,23.2225],[113.3209,23.1996],[113.3205,23.1877],[113.3150,23.1778],[113.3215,23.1628],[113.3190,23.1537],[113.3184,23.1439],[113.3161,23.1338],[113.3158,23.1220],[113.3180,23.1090],[113.3149,23.0990],[113.3167,23.0805],[113.3139,23.0572],[113.3153,23.0406],[113.3163,23.0205],[113.3244,22.9962],[113.3563,22.9520],[113.3799,22.9382]],
  '3号线支线': [[113.3386,23.1734],[113.3465,23.1555],[113.3394,23.1426],[113.3341,23.1374],[113.3265,23.1357],[113.3161,23.1338]],
  '4号线': [[113.4013,23.1352],[113.3900,23.1269],[113.3847,23.1183],[113.3791,23.1002],[113.3713,23.0696],[113.3804,23.0602],[113.3948,23.0461],[113.4101,23.0309],[113.4598,22.9599],[113.4699,22.9422],[113.4795,22.9222],[113.4736,22.8883],[113.4851,22.8697],[113.5045,22.8386],[113.5135,22.8276],[113.5224,22.8035],[113.5337,22.7951],[113.5355,22.7845],[113.5364,22.7748],[113.5512,22.7617],[113.5678,22.7561],[113.5896,22.7509],[113.6049,22.7691]],
  '5号线': [[113.2031,23.1164],[113.2128,23.1278],[113.2277,23.1289],[113.2328,23.1400],[113.2365,23.1444],[113.2520,23.1506],[113.2714,23.1421],[113.2811,23.1391],[113.2916,23.1371],[113.3018,23.1374],[113.3026,23.1301],[113.3089,23.1225],[113.3158,23.1220],[113.3271,23.1209],[113.3404,23.1201],[113.3582,23.1177],[113.3719,23.1215],[113.3847,23.1183],[113.3962,23.1117],[113.4104,23.1066],[113.4268,23.1028],[113.4407,23.1059],[113.4520,23.1088],[113.4635,23.1063]],
  '6号线': [[113.1965,23.1667],[113.2014,23.1608],[113.2060,23.1549],[113.2120,23.1383],[113.2128,23.1278],[113.2257,23.1178],[113.2350,23.1119],[113.2445,23.1117],[113.2603,23.1175],[113.2650,23.1216],[113.2728,23.1210],[113.2839,23.1175],[113.2902,23.1265],[113.2916,23.1371],[113.2943,23.1436],[113.3013,23.1499],[113.3154,23.1622],[113.3215,23.1628],[113.3386,23.1734],[113.3442,23.1810],[113.3599,23.1922],[113.3721,23.1934],[113.3909,23.1959],[113.4046,23.1934],[113.4277,23.1909],[113.4456,23.1838],[113.4547,23.1749],[113.4627,23.1733],[113.4765,23.1785],[113.4959,23.1750]],
  '8号线': [[113.2118,23.2392],[113.2146,23.2252],[113.2260,23.2138],[113.2378,23.2028],[113.2357,23.1906],[113.2333,23.1839],[113.2304,23.1737],[113.2297,23.1663],[113.2307,23.1588],[113.2365,23.1444],[113.2404,23.1375],[113.2414,23.1287],[113.2418,23.1208],[113.2445,23.1117],[113.2471,23.1043],[113.2506,23.0975],[113.2553,23.0912],[113.2643,23.0887],[113.2715,23.0932],[113.2878,23.0946],[113.3029,23.0979],[113.3149,23.0990],[113.3297,23.0997],[113.3363,23.1012],[113.3515,23.1012],[113.3622,23.1013],[113.3791,23.1002]],
  '13号线': [[113.3574,23.1277],[113.3771,23.1279],[113.3900,23.1269],[113.4153,23.1191],[113.4268,23.1028],[113.4501,23.0974],[113.4686,23.0970],[113.4923,23.0858],[113.5132,23.0858],[113.5359,23.0975],[113.5649,23.1134],[113.5906,23.1262],[113.5991,23.1345],[113.6314,23.1404],[113.6447,23.1397]],
  '14号线': [[113.2837,23.2399],[113.3126,23.2538],[113.3181,23.2801],[113.3414,23.3014],[113.3630,23.3512],[113.3951,23.3779],[113.4451,23.3966],[113.4616,23.4157],[113.4821,23.4016],[113.4899,23.3798],[113.5028,23.3659],[113.5194,23.3524],[113.5385,23.3340],[113.5467,23.3258],[113.5596,23.3100],[113.5720,23.2923],[113.5880,23.2873]],
  '21号线': [[113.3574,23.1277],[113.3844,23.1334],[113.4013,23.1352],[113.4014,23.1471],[113.3977,23.1655],[113.4256,23.1677],[113.4441,23.1683],[113.4627,23.1733],[113.4737,23.1896],[113.4843,23.2125],[113.5216,23.2520],[113.5685,23.2811],[113.5880,23.2873],[113.6079,23.2882],[113.6377,23.2815],[113.6651,23.2791],[113.6963,23.2750],[113.7395,23.2791],[113.7869,23.2819],[113.8087,23.2810]],
  '广佛线': [[113.1349,22.9615],[113.1237,22.9677],[113.1100,22.9679],[113.1015,22.9866],[113.1031,22.9962],[113.1030,23.0096],[113.1030,23.0216],[113.1067,23.0296],[113.1178,23.0302],[113.1277,23.0302],[113.1361,23.0342],[113.1487,23.0368],[113.1500,23.0452],[113.1500,23.0575],[113.1530,23.0687],[113.1869,23.0683],[113.2077,23.0685],[113.2267,23.0686],[113.2349,23.0754],[113.2418,23.0860],[113.2553,23.0912],[113.2660,23.0787],[113.2806,23.0705],[113.2925,23.0673],[113.3139,23.0575]],
}

function parseMetroLines(metroLine) {
  const parts = metroLine.split('/')
  return parts.map((part) => {
    let trimmed = part.trim()
    if (/^\d+$/.test(trimmed)) {
      const last = parts[parts.length - 1].trim()
      if (last.includes('号线')) trimmed += '号线'
    }
    return trimmed
  }).filter(Boolean)
}

// Map metro_line values to their route keys for filtering
function getLineRouteKeys(lineName) {
  if (lineName === '3号线') return ['3号线', '3号线支线']
  return [lineName]
}

export default {
  setup() {
    const router = useRouter()
    const activeLine = ref(null)
    const loading = ref(true)
    let mapInstance = null
    const markers = []
    const polylines = []

    onMounted(async () => {
      const areas = await api.get('/areas')
      loading.value = false

      const AMap = await AMapLoader.load({
        key: '6ae35c1718f482e6e4e811a092a06add',
        version: '2.0',
        plugins: ['AMap.Scale', 'AMap.ToolBar'],
      })

      mapInstance = new AMap.Map('metro-map-container', {
        zoom: 10,
        center: [113.32, 23.13],
        mapStyle: 'amap://styles/whitesmoke',
        viewMode: '2D',
      })
      mapInstance.addControl(new AMap.Scale())

      // Draw real metro line routes
      Object.entries(METRO_ROUTES).forEach(([routeKey, path]) => {
        // Use the base line name for color (e.g. "3号线支线" uses 3号线 color)
        const baseLine = routeKey.replace('支线', '')
        const color = LINE_COLORS[baseLine] || '#999'

        const polyline = new AMap.Polyline({
          path,
          strokeColor: color,
          strokeWeight: 5,
          strokeOpacity: 0.85,
          strokeStyle: 'solid',
          lineJoin: 'round',
          lineCap: 'round',
          zIndex: 50,
          extData: { line: baseLine },
        })
        mapInstance.add(polyline)
        polylines.push(polyline)
      })

      // Add markers for each 城中村 area
      const container = document.querySelector('#metro-map-container')

      areas.forEach(area => {
        if (!area.lng || !area.lat) return
        const lines = parseMetroLines(area.metro_line)
        const primaryLine = lines[0]
        const color = LINE_COLORS[primaryLine] || '#666'

        const normalSize = 10
        const hoverSize = 14

        const marker = new AMap.Marker({
          position: [area.lng, area.lat],
          content: buildMarkerHtml(normalSize, color, '0 1px 4px rgba(0,0,0,0.3)'),
          offset: new AMap.Pixel(-normalSize / 2 - 1, -normalSize / 2 - 1),
          zIndex: 100,
          extData: { area },
        })

        // Area name label above marker
        const label = new AMap.Marker({
          position: [area.lng, area.lat],
          content: '<div style="'
            + 'font-size:11px;font-weight:600;color:#292524;'
            + 'background:rgba(255,255,255,0.85);padding:1px 5px;'
            + 'border-radius:3px;white-space:nowrap;'
            + 'box-shadow:0 1px 2px rgba(0,0,0,0.1);'
            + 'pointer-events:none;'
            + '">' + area.name + '</div>',
          offset: new AMap.Pixel(-20, -22),
          zIndex: 99,
          extData: { areaId: area.id },
        })

        const infoWindow = new AMap.InfoWindow({
          isCustom: true,
          content: buildInfoHtml(area),
          offset: new AMap.Pixel(0, -20),
        })

        marker.on('click', () => {
          infoWindow.open(mapInstance, marker.getPosition())
        })
        marker.on('mouseover', () => {
          marker.setContent(buildMarkerHtml(hoverSize, color, '0 2px 6px rgba(0,0,0,0.4)'))
          marker.setOffset(new AMap.Pixel(-hoverSize / 2 - 1, -hoverSize / 2 - 1))
        })
        marker.on('mouseout', () => {
          marker.setContent(buildMarkerHtml(normalSize, color, '0 1px 4px rgba(0,0,0,0.3)'))
          marker.setOffset(new AMap.Pixel(-normalSize / 2 - 1, -normalSize / 2 - 1))
        })

        mapInstance.add([marker, label])
        markers.push({ marker, label, area })
      })

      // Delegate click for InfoWindow navigation
      container.addEventListener('click', (e) => {
        const link = e.target.closest('[data-nav]')
        if (link) {
          e.stopPropagation()
          router.push(link.getAttribute('data-nav'))
        }
      })
    })

    function buildMarkerHtml(size, color, shadow) {
      return '<div style="'
        + 'width:' + size + 'px;height:' + size + 'px;border-radius:50%;'
        + 'background:' + color + ';border:2px solid #fff;'
        + 'box-shadow:' + shadow + ';cursor:pointer;'
        + '"></div>'
    }

    function buildInfoHtml(area) {
      return '<div style="'
        + 'background:#fff;border:1px solid #e0e0e0;border-radius:8px;'
        + 'padding:12px 16px;min-width:180px;max-width:240px;'
        + 'font-family:-apple-system,BlinkMacSystemFont,sans-serif;'
        + 'box-shadow:0 2px 8px rgba(0,0,0,0.1);'
        + '">'
        + '<div style="font-size:15px;font-weight:700;color:#292524;">' + area.name + '</div>'
        + '<div style="font-size:12px;color:#78716c;margin-top:2px;">' + area.district + ' · ' + area.metro_line + '</div>'
        + '<div style="display:flex;align-items:baseline;gap:6px;margin-top:8px;">'
        + '<span style="font-size:20px;font-weight:700;color:#19725D;">' + area.avg_score + '</span>'
        + '<span style="font-size:12px;color:#78716c;">综合</span>'
        + '<span style="font-size:12px;color:#78716c;margin-left:auto;">' + area.landlord_count + ' 条评价</span>'
        + '</div>'
        + '<div data-nav="/areas/' + area.id + '" style="'
        + 'display:block;margin-top:10px;text-align:center;'
        + 'padding:6px 0;border-radius:6px;font-size:13px;'
        + 'background:#19725D;color:#fff;cursor:pointer;'
        + '">查看详情</div>'
        + '</div>'
    }

    function toggleLine(line) {
      if (activeLine.value === line) {
        activeLine.value = null
        markers.forEach(({ marker, label }) => { marker.show(); label.show() })
        polylines.forEach(p => p.show())
      } else {
        activeLine.value = line
        const routeKeys = getLineRouteKeys(line)
        markers.forEach(({ marker, label, area }) => {
          const lines = parseMetroLines(area.metro_line)
          if (lines.includes(line)) { marker.show(); label.show() }
          else { marker.hide(); label.hide() }
        })
        polylines.forEach(p => {
          const pLine = p.getExtData().line
          if (routeKeys.includes(pLine) || pLine === line) p.show()
          else p.hide()
        })
      }
    }

    onUnmounted(() => {
      if (mapInstance) mapInstance.destroy()
    })

    return { LINE_COLORS, activeLine, toggleLine, loading }
  }
}
</script>

<style scoped>
.map-page { position: relative; width: 100%; height: calc(100vh - 56px); }
#metro-map-container { width: 100%; height: 100%; position: relative; }
.map-loading {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; background: var(--bg-100); z-index: 10;
}
.map-loading p { margin-top: 12px; color: var(--text-200); font-size: 14px; }
.loading-spinner {
  width: 32px; height: 32px; border: 3px solid var(--bg-200);
  border-top-color: var(--primary-300); border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.map-legend {
  position: absolute; top: 12px; left: 12px; z-index: 200;
  background: rgba(255,255,255,0.95); border-radius: 10px;
  padding: 12px 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  max-width: 280px;
}
.legend-title { font-size: 13px; font-weight: 700; color: #292524; margin-bottom: 8px; }
.legend-items { display: flex; flex-wrap: wrap; gap: 6px; }
.legend-item {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; color: #78716c; cursor: pointer;
  padding: 2px 6px; border-radius: 4px;
  transition: background 0.2s;
}
.legend-item:hover { background: #f5f5f4; }
.legend-item.active { background: #f0fdf5; color: #292524; font-weight: 600; }
.legend-dot {
  display: inline-block; width: 8px; height: 8px;
  border-radius: 50%; flex-shrink: 0;
}

@media (max-width: 480px) {
  .map-legend { max-width: 200px; padding: 8px 10px; }
  .legend-item { font-size: 10px; }
}
</style>
