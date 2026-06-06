<template>
  <div class="page">
    <header>
      <h2>提交租房信息</h2>
      <p class="subtitle">提交后需管理员审核才会展示</p>
    </header>

    <!-- 步骤1：选择地区 -->
    <div v-if="step === 1" class="section">
      <div class="section-title">选择地区</div>
      <select v-model="form.area_id" class="full-input">
        <option value="">请选择地区</option>
        <option v-for="a in areas" :key="a.id" :value="a.id">{{ a.name }}（{{ a.district }}）</option>
      </select>
      <button class="btn btn-primary" style="margin-top:16px;width:100%" :disabled="!form.area_id" @click="step = 2">下一步</button>
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
            <span v-for="t in presetTags.red" :key="t" class="tag tag-red" :class="{ selected: form.payload.red_tags.includes(t) }" @click="toggleTag('red_tags', t)">{{ t }}</span>
          </div>
          <input v-model="customRed" class="full-input" style="margin-top:8px" placeholder="自定义标签，回车添加" @keyup.enter="addCustomTag('red_tags')" />
        </div>
        <div class="form-group">
          <label>黑标签（差评）</label>
          <div class="tag-select">
            <span v-for="t in presetTags.black" :key="t" class="tag tag-black" :class="{ selected: form.payload.black_tags.includes(t) }" @click="toggleTag('black_tags', t)">{{ t }}</span>
          </div>
          <input v-model="customBlack" class="full-input" style="margin-top:8px" placeholder="自定义标签，回车添加" @keyup.enter="addCustomTag('black_tags')" />
        </div>
        <div class="form-group">
          <label>补充说明</label>
          <textarea v-model="form.payload.comment" class="full-input" rows="3" placeholder="详细描述你的租房经历..."></textarea>
        </div>
      </template>

      <div class="form-group">
        <label>备注/说明</label>
        <textarea v-model="form.submitter_note" class="full-input" rows="2" placeholder="给管理员的备注"></textarea>
      </div>

      <div style="display:flex;gap:8px;margin-top:16px">
        <button class="btn" style="flex:1;background:var(--bg-200)" @click="step = 2">上一步</button>
        <button class="btn btn-primary" style="flex:1" @click="submit">提交</button>
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
import { ref, reactive, onMounted } from 'vue'

export default {
  setup() {
    const step = ref(1)
    const areas = ref([])
    const presetTags = ref({ red: [], black: [] })
    const customRed = ref('')
    const customBlack = ref('')

    const types = [
      { value: 'landlord', label: '房东/中介评价', desc: '评价某个房东或中介' },
      { value: 'area_rating', label: '地区评分', desc: '为地区环境打分' },
      { value: 'rental_rules', label: '租房规则', desc: '补充地区的租房费用信息' },
    ]

    const form = reactive({
      area_id: '',
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
      try {
        await api.post('/submissions', {
          type: form.type,
          area_id: Number(form.area_id),
          payload: form.payload,
          submitter_note: form.submitter_note,
          proof_images: []
        })
        step.value = 4
      } catch {
        alert('提交失败，请重试')
      }
    }

    return { step, areas, presetTags, form, types, customRed, customBlack, selectType, toggleTag, addCustomTag, submit }
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
</style>
