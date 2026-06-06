<template>
  <div class="page">
    <header>
      <h2>管理员登录</h2>
    </header>
    <div class="section">
      <div class="form-group">
        <label>密码</label>
        <input v-model="password" type="password" class="full-input" placeholder="输入管理员密码" @keyup.enter="login" />
      </div>
      <button class="btn btn-primary" style="width:100%;margin-top:12px" @click="login">登录</button>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import api from '../../api'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const password = ref('')
    const error = ref('')
    const router = useRouter()

    async function login() {
      try {
        const data = await api.post('/admin/login', { password: password.value })
        localStorage.setItem('admin_token', data.token)
        router.push('/admin/review')
      } catch {
        error.value = '密码错误'
      }
    }

    return { password, error, login }
  }
}
</script>

<style scoped>
.form-group { margin-bottom: 14px; }
.form-group label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: var(--text-200); }
.full-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--bg-300);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}
.error { color: var(--red-badge); font-size: 13px; margin-top: 8px; }
</style>
