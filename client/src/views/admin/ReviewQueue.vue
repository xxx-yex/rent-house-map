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

      <div v-if="item.proof_images && item.proof_images.length" class="proof-images">
        <span class="proof-label">凭证图片：</span>
        <div class="proof-list">
          <img v-for="url in item.proof_images" :key="url" :src="url" class="proof-thumb" @click="previewImage(url)" />
        </div>
      </div>

      <div v-if="status === 'pending'" class="sub-actions">
        <button class="btn btn-primary" @click="review(item.id, 'approved')">通过</button>
        <button class="btn" style="background:var(--red-badge);color:#fff" @click="review(item.id, 'rejected')">拒绝</button>
      </div>
      <div v-else class="sub-status" :class="item.status">
        {{ item.status === 'approved' ? '已通过' : '已拒绝' }}
      </div>
    </div>

    <!-- 图片预览 -->
    <div v-if="previewUrl" class="preview-overlay" @click="previewUrl = null">
      <img :src="previewUrl" class="preview-img" />
    </div>
  </div>
</template>

<script>
import api from '../../api'
import { ref, onMounted } from 'vue'

export default {
  setup() {
    const list = ref([])
    const loading = ref(true)
    const status = ref('pending')
    const previewUrl = ref(null)

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
      if (!token) return null
      return { Authorization: `Bearer ${token}` }
    }

    async function load() {
      const headers = getAuthHeaders()
      if (!headers) return
      loading.value = true
      const data = await api.get('/admin/submissions', { params: { status: status.value }, headers })
      list.value = data
      loading.value = false
    }

    async function review(id, newStatus) {
      const headers = getAuthHeaders()
      if (!headers) return
      await api.put(`/admin/submissions/${id}`, { status: newStatus }, { headers })
      load()
    }

    onMounted(load)

    function previewImage(url) {
      previewUrl.value = url
    }

    return { list, loading, status, tabs, typeLabels, load, review, previewUrl, previewImage }
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

.proof-images { margin-top: 8px; }
.proof-label { font-size: 12px; color: var(--text-200); }
.proof-list { display: flex; gap: 6px; margin-top: 4px; flex-wrap: wrap; }
.proof-thumb { width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 1px solid var(--bg-200); }
.preview-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 9999;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.preview-img { max-width: 90%; max-height: 90%; border-radius: 8px; }
</style>
