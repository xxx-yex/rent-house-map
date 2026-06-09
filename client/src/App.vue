<template>
  <div id="app-root">
    <nav class="top-nav">
      <div class="nav-inner">
        <router-link to="/" class="nav-logo">租房地图</router-link>
        <div class="nav-links">
          <router-link to="/" class="nav-item">首页</router-link>
          <router-link to="/map" class="nav-item">地图</router-link>
          <router-link to="/areas" class="nav-item">地区</router-link>
        </div>
      </div>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
    <ToastNotification />
  </div>
</template>

<script>
import ToastNotification from './components/ToastNotification.vue'

export default {
  components: { ToastNotification }
}
</script>

<style scoped>
#app-root {
  min-height: 100vh;
}
.top-nav {
  position: sticky;
  top: 0;
  background: #fff;
  border-bottom: 1px solid var(--bg-300);
  z-index: 100;
}
.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 48px;
  max-width: 1100px;
  margin: 0 auto;
}
.nav-logo {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-100);
  text-decoration: none;
}
.nav-links {
  display: flex;
  gap: 16px;
}
.nav-item {
  font-size: 13px;
  color: var(--text-200);
  text-decoration: none;
  padding: 4px 0;
  transition: color 0.2s;
}
.nav-item:hover { color: var(--primary-300); }
.nav-item.router-link-active {
  color: var(--primary-300);
  font-weight: 600;
}
@media (min-width: 768px) {
  .nav-inner { height: 56px; padding: 0 24px; }
  .nav-logo { font-size: 18px; }
  .nav-links { gap: 24px; }
  .nav-item { font-size: 15px; }
}
.main-content {
  padding-bottom: 24px;
}
</style>
