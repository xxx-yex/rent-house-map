<template>
  <div class="page">
    <header>
      <h2>提交租房信息</h2>
      <p class="subtitle">提交后需管理员审核才会展示</p>
    </header>

    <!-- 步骤1：选择地区（仅无 area_id 时显示） -->
    <div v-if="step === 1" class="section">
      <div class="section-title">选择地区</div>
      <div class="area-search-wrap">
        <input
          class="full-input area-search-input"
          v-model="areaKeyword"
          placeholder="搜索地区（如棠下、石牌、客村）..."
          @input="onAreaSearch"
          @focus="showAreaList = true"
        />
        <div v-if="showAreaList && filteredAreas.length" class="area-dropdown card">
          <div
            v-for="a in filteredAreas"
            :key="a.id"
            class="area-dropdown-item"
            :class="{ selected: form.area_id === a.id }"
            @click="selectArea(a)"
          >
            <span class="area-dropdown-name" v-html="highlightArea(a.name, areaKeyword)"></span>
            <span class="area-dropdown-meta">{{ a.district }} · {{ a.metro_line }}</span>
          </div>
        </div>
      </div>
      <button class="btn btn-primary" style="margin-top:16px;width:100%" :disabled="!form.area_id" @click="step = 2">下一步</button>
    </div>

    <!-- 地区信息（带 area_id 时显示） -->
    <div v-if="step > 1 && form.area_id" class="area-info-bar">
      为「{{ selectedAreaName }}」提交评价
    </div>

    <!-- 步骤2：选择类型 -->
    <div v-if="step === 2" class="section">
      <div class="section-title">提交类型</div>
      <div class="type-options">
        <button v-for="t in types" :key="t.value" class="type-btn" :class="{ active: form.type === t.value }" @click="selectType(t.value)">
          <div class="type-label">{{ t.label }}</div>
          <div class="type-desc">{{ t.desc }}</div>
        </button>
      </div>
      <div style="display:flex;gap:8px;margin-top:16px">
        <button class="btn" style="flex:1;background:var(--bg-200)" @click="step = 1">上一步</button>
        <button class="btn btn-primary" style="flex:1" :disabled="!form.type" @click="step = 3">下一步</button>
      </div>
    </div>

    <!-- 步骤3：填写内容 -->
    <div v-if="step === 3" class="section">
      <div class="section-title">填写信息</div>

      <!-- 房东评价 -->
      <template v-if="form.type === 'landlord'">
        <div class="form-group">
          <label>姓名/称呼</label>
          <input v-model="form.payload.name" class="full-input" placeholder="如：张阿姨" />
        </div>
        <div class="form-group">
          <label>身份</label>
          <select v-model="form.payload.is_agent" class="full-input">
            <option :value="0">房东</option>
            <option :value="1">中介</option>
          </select>
        </div>
        <div class="form-group">
          <label>评分（1-5）</label>
          <div class="star-row">
            <span v-for="n in 5" :key="n" class="star" :class="{ active: n <= form.payload.score }" @click="form.payload.score = n">★</span>
          </div>
        </div>
        <div class="form-group">
          <label>红标签（好评）</label>
          <div class="tag-select">
            <span v-for="t in presetTags.red" :key="'p-'+t" class="tag tag-red" :class="{ selected: form.payload.red_tags.includes(t) }" @click="toggleTag('red_tags', t)">{{ t }}</span>
            <span v-for="t in customRedTags" :key="'c-'+t" class="tag tag-red selected" @click="toggleTag('red_tags', t)">{{ t }}</span>
          </div>
          <input v-model="customRed" class="full-input" style="margin-top:8px" placeholder="自定义标签，回车添加" @keyup.enter="addCustomTag('red_tags')" />
        </div>
        <div class="form-group">
          <label>黑标签（差评）</label>
          <div class="tag-select">
            <span v-for="t in presetTags.black" :key="'p-'+t" class="tag tag-black" :class="{ selected: form.payload.black_tags.includes(t) }" @click="toggleTag('black_tags', t)">{{ t }}</span>
            <span v-for="t in customBlackTags" :key="'c-'+t" class="tag tag-black selected" @click="toggleTag('black_tags', t)">{{ t }}</span>
          </div>
          <input v-model="customBlack" class="full-input" style="margin-top:8px" placeholder="自定义标签，回车添加" @keyup.enter="addCustomTag('black_tags')" />
        </div>
        <div class="form-group">
          <label>补充说明</label>
          <textarea v-model="form.payload.comment" class="full-input" rows="3" placeholder="详细描述你的租房经历..."></textarea>
        </div>
        <div class="form-group">
          <label>上传凭证图片（可选，最多5张）</label>
          <ImageUploader v-model="proofImages" :max="5" />
        </div>
      </template>

      <!-- 地区评分 -->
      <template v-else-if="form.type === 'area_rating'">
        <div class="form-group" v-for="dim in ratingDims" :key="dim.key">
          <label>{{ dim.label }}（1-5）</label>
          <div class="star-row">
            <span v-for="n in 5" :key="n" class="star" :class="{ active: n <= form.payload[dim.key] }" @click="form.payload[dim.key] = n">★</span>
          </div>
        </div>
      </template>

      <!-- 租房规则 -->
      <template v-else-if="form.type === 'rental_rules'">
        <div class="form-group">
          <label>付款方式</label>
          <input v-model="form.payload.payment_method" class="full-input" placeholder="如：押二付一" />
        </div>
        <div class="form-group">
          <label>短租费</label>
          <input v-model="form.payload.short_term_fee" class="full-input" placeholder="如：短租加收10-20%" />
        </div>
        <div class="form-group">
          <label>水费</label>
          <input v-model="form.payload.water_rate" class="full-input" placeholder="如：3-6元/吨" />
        </div>
        <div class="form-group">
          <label>电费</label>
          <input v-model="form.payload.electricity_rate" class="full-input" placeholder="如：0.88-1.5元/度" />
        </div>
        <div class="form-group">
          <label>其他费用</label>
          <input v-model="form.payload.other_fees" class="full-input" placeholder="如：管理费50-100/月" />
        </div>
      </template>

      <div class="form-group">
        <label>备注/说明</label>
        <textarea v-model="form.submitter_note" class="full-input" rows="2" placeholder="给管理员的备注"></textarea>
      </div>

      <div style="display:flex;gap:8px;margin-top:16px">
        <button class="btn" style="flex:1;background:var(--bg-200)" @click="step = 2">上一步</button>
        <button class="btn btn-primary" style="flex:1" :disabled="submitting" @click="submit">{{ submitting ? '提交中...' : '提交' }}</button>
      </div>
    </div>

    <!-- 完成 -->
    <div v-if="step === 4" class="section" style="text-align:center;padding-top:40px">
      <div style="font-size:48px">✓</div>
      <h3 style="margin-top:12px">提交成功</h3>
      <p style="color:var(--text-200);margin-top:8px;font-size:14px">感谢你的贡献，管理员审核通过后将展示</p>
      <router-link to="/" class="btn btn-primary" style="margin-top:24px">返回首页</router-link>
    </div>
  </div>
</template>

<script>
import api from '../api'
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ImageUploader from '../components/ImageUploader.vue'

export default {
  setup() {
    const route = useRoute()
    const initialAreaId = route.query.area_id ? Number(route.query.area_id) : null
    const step = ref(initialAreaId ? 2 : 1)
    const areas = ref([])
    const presetTags = ref({ red: [], black: [] })
    const customRed = ref('')
    const customBlack = ref('')
    const proofImages = ref([])
    const submitting = ref(false)
    const areaKeyword = ref('')
    const showAreaList = ref(false)

    const filteredAreas = computed(() => {
      const kw = areaKeyword.value.trim().toLowerCase()
      if (!kw) return areas.value
      return areas.value.filter(a =>
        a.name.toLowerCase().includes(kw) ||
        a.district.toLowerCase().includes(kw) ||
        a.metro_line.toLowerCase().includes(kw)
      )
    })

    const selectedArea = computed(() => {
      if (!form.area_id) return null
      return areas.value.find(a => a.id === form.area_id) || null
    })

    function onAreaSearch() {
      showAreaList.value = true
    }

    function selectArea(area) {
      form.area_id = area.id
      areaKeyword.value = ''
      showAreaList.value = false
    }

    function clearArea() {
      form.area_id = ''
    }

    function highlightArea(text, keyword) {
      if (!keyword || !keyword.trim()) return text
      const kw = keyword.trim()
      const regex = new RegExp(`(${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
      return text.replace(regex, '<mark>$1</mark>')
    }

    const ratingDims = [
      { key: 'sanitation', label: '环境卫生' },
      { key: 'convenience', label: '便利程度' },
      { key: 'safety', label: '安全感' },
      { key: 'overall', label: '综合评分' },
    ]

    const customRedTags = computed(() => {
      return (form.payload.red_tags || []).filter(t => !(presetTags.value.red || []).includes(t))
    })
    const customBlackTags = computed(() => {
      return (form.payload.black_tags || []).filter(t => !(presetTags.value.black || []).includes(t))
    })

    const selectedAreaName = computed(() => {
      if (!form.area_id) return ''
      const a = areas.value.find(a => a.id === form.area_id)
      return a ? a.name : ''
    })

    const types = [
      { value: 'landlord', label: '房东/中介评价', desc: '评价某个房东或中介' },
      { value: 'area_rating', label: '地区评分', desc: '为地区环境打分' },
      { value: 'rental_rules', label: '租房规则', desc: '补充地区的租房费用信息' },
    ]

    const form = reactive({
      area_id: initialAreaId || '',
      type: '',
      payload: { name: '', is_agent: 0, score: 0, red_tags: [], black_tags: [], comment: '' },
      submitter_note: ''
    })

    onMounted(async () => {
      const [areasData, tagsData] = await Promise.all([
        api.get('/areas'),
        api.get('/tags')
      ])
      areas.value = areasData
      presetTags.value = tagsData
    })

    function selectType(type) {
      form.type = type
      if (type === 'area_rating') {
        form.payload = { area_id: Number(form.area_id), sanitation: 0, convenience: 0, safety: 0, overall: 0 }
      } else if (type === 'rental_rules') {
        form.payload = { area_id: Number(form.area_id), payment_method: '', short_term_fee: '', water_rate: '', electricity_rate: '', other_fees: '' }
      } else {
        form.payload = { name: '', is_agent: 0, score: 0, red_tags: [], black_tags: [], comment: '' }
      }
    }

    function toggleTag(field, tag) {
      const idx = form.payload[field].indexOf(tag)
      if (idx >= 0) form.payload[field].splice(idx, 1)
      else form.payload[field].push(tag)
    }

    function addCustomTag(field) {
      const src = field === 'red_tags' ? customRed : customBlack
      const val = src.value.trim()
      if (val && !form.payload[field].includes(val)) {
        form.payload[field].push(val)
      }
      if (field === 'red_tags') customRed.value = ''
      else customBlack.value = ''
    }

    async function submit() {
      submitting.value = true
      try {
        await api.post('/submissions', {
          type: form.type,
          area_id: Number(form.area_id),
          payload: form.payload,
          submitter_note: form.submitter_note,
          proof_images: proofImages.value
        })
        step.value = 4
      } catch {
        // toast handled by interceptor
      } finally {
        submitting.value = false
      }
    }

    return { step, areas, presetTags, form, types, ratingDims, customRed, customBlack, customRedTags, customBlackTags, proofImages, submitting, areaKeyword, showAreaList, filteredAreas, selectedArea, selectedAreaName, onAreaSearch, selectArea, clearArea, highlightArea, selectType, toggleTag, addCustomTag, submit }
  }
}
</script>

<style scoped>
.subtitle { font-size: 13px; color: var(--text-200); margin-top: 4px; }
.full-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--bg-300);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: #fff;
}
.full-input:focus { border-color: var(--primary-300); }
textarea.full-input { resize: vertical; }
select.full-input { appearance: auto; }

.type-options { display: flex; flex-direction: column; gap: 8px; }
.type-btn {
  padding: 12px;
  border: 2px solid var(--bg-300);
  border-radius: 10px;
  background: #fff;
  text-align: left;
  cursor: pointer;
}
.type-btn.active { border-color: var(--primary-300); background: var(--primary-200); }
.type-label { font-size: 15px; font-weight: 600; }
.type-desc { font-size: 12px; color: var(--text-200); margin-top: 2px; }

.form-group { margin-bottom: 14px; }
.form-group label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: var(--text-200); }

.star-row { display: flex; gap: 4px; }
.star { font-size: 24px; color: var(--bg-300); cursor: pointer; }
.star.active { color: var(--accent-100); }

.tag-select { display: flex; flex-wrap: wrap; gap: 4px; }
.tag { opacity: 0.5; cursor: pointer; }
.tag.selected { opacity: 1; }

.area-search-wrap { position: relative; }
.area-dropdown {
  position: absolute; left: 0; right: 0; top: 100%;
  z-index: 100; max-height: 280px; overflow-y: auto;
  margin-top: 4px; padding: 4px 0;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
.area-dropdown-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; cursor: pointer;
  border-bottom: 1px solid var(--bg-200);
}
.area-dropdown-item:last-child { border-bottom: none; }
.area-dropdown-item:hover { background: var(--bg-100); }
.area-dropdown-item.selected { background: var(--primary-200); }
.area-dropdown-name { font-size: 14px; font-weight: 600; }
.area-dropdown-meta { font-size: 12px; color: var(--text-200); flex-shrink: 0; margin-left: 12px; }

mark { background: #19725d; color: #fff; border-radius: 2px; padding: 0 2px; }

.selected-area-tag {
  margin-top: 10px; padding: 8px 12px; border-radius: 8px;
  background: var(--primary-200); color: var(--primary-300);
  font-size: 14px; font-weight: 500;
  display: flex; align-items: center; justify-content: space-between;
}
.remove-area { cursor: pointer; font-size: 18px; margin-left: 8px; }

.area-info-bar {
  margin-bottom: 16px; padding: 10px 16px; border-radius: 8px;
  background: var(--primary-200); color: var(--primary-300);
  font-size: 14px; font-weight: 600; text-align: center;
}
</style>
