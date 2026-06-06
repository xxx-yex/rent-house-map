<template>
  <div class="page">
    <header>
      <h2>审核队列</h2>
      <div class="tabs">
        <button v-for="t in tabs" :key="t.value" class="tab" :class="{ active: status === t.value }" @click="status = t.value; load()">
          {{ t.label }}
        </button>
      </div>
    </header>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="list.length === 0" class="empty">暂无待审核内容</div>

    <div v-for="item in list" :key="item.id" class="card submission-card">
      <div class="sub-meta">
        <span class="sub-type">{{ typeLabels[item.type] }}</span>
        <span v-if="item.area_name" class="sub-area">{{ item.area_name }}</span>
        <span class="sub-time">{{ item.created_at }}</span>
      </div>
      <pre class="sub-payload">{{ JSON.stringify(item.payload, null, 2) }}</pre>
      <p v-if="item.submitter_note" class="sub-note">备注：{{ item.submitter_note }}</p>

      <div v-if="status === 'pending'" class="sub-actions">
        <button class="btn btn-primary" @click="review(item.id, 'approved')">通过</button>
        <button class="btn" style="background:var(--red-badge);color:#fff" @click="review(item.id, 'rejected')">拒绝</button>
      </div>
      <div v-else class="sub-status" :class="item.status">
        {{ item.status === 'approved' ? '已通过' : '已拒绝' }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const list = ref([])
    const loading = ref(true)
    const status = ref('pending')
    const router = useRouter()

    const tabs = [
      { value: 'pending', label: '待审核' },
      { value: 'approved', label: '已通过' },
      { value: 'rejected', label: '已拒绝' },
    ]

    const typeLabels = {
      landlord: '房东评价',
      area_rating: '地区评分',
      rental_rules: '租房规则',
    }

    function getAuthHeaders() {
      const token = localStorage.getItem('admin_token')
      if (!token) { router.push('/admin/login'); return null }
      return { Authorization: `Bearer ${token}` }
    }

    async function load() {
      const headers = getAuthHeaders()
      if (!headers) return
      loading.value = true
      const { data } = await axios.get('/api/admin/submissions', { params: { status: status.value }, headers })
      list.value = data
      loading.value = false
    }

    async function review(id, newStatus) {
      const headers = getAuthHeaders()
      if (!headers) return
      await axios.put(`/api/admin/submissions/${id}`, { status: newStatus }, { headers })
      load()
    }

    onMounted(load)

    return { list, loading, status, tabs, typeLabels, load, review }
  }
}
</script>

<style scoped>
.tabs { display: flex; gap: 8px; margin-top: 12px; }
.tab {
  padding: 6px 16px;
  border: 1px solid var(--bg-300);
  border-radius: 20px;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
}
.tab.active { background: var(--primary-300); color: #fff; border-color: var(--primary-300); }

.sub-meta { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: 12px; color: var(--text-200); }
.sub-type { background: var(--bg-200); padding: 2px 8px; border-radius: 10px; }
.sub-area { font-weight: 500; color: var(--text-100); }
.sub-payload {
  margin-top: 10px;
  padding: 10px;
  background: var(--bg-200);
  border-radius: 6px;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
.sub-note { margin-top: 6px; font-size: 12px; color: var(--text-200); }
.sub-actions { display: flex; gap: 8px; margin-top: 12px; }
.sub-status { margin-top: 10px; font-size: 13px; font-weight: 600; }
.sub-status.approved { color: var(--primary-300); }
.sub-status.rejected { color: var(--red-badge); }
</style>
