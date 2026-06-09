<template>
  <div class="skeleton-card">
    <div class="skeleton-line skeleton-shimmer" :style="{ width: '60%' }"></div>
    <div class="skeleton-line skeleton-shimmer" :style="{ width: '40%' }"></div>
    <div v-if="!compact" class="skeleton-line skeleton-shimmer" :style="{ width: '80%' }"></div>
  </div>
</template>

<script>
export default {
  props: {
    compact: { type: Boolean, default: false }
  }
}
</script>

<style scoped>
.skeleton-card {
  padding: 16px;
  background: #fff;
  border: 1px solid var(--bg-200);
  border-radius: 10px;
}
.skeleton-line {
  height: 14px;
  border-radius: 4px;
  background: var(--bg-200);
  margin-bottom: 10px;
}
.skeleton-line:last-child { margin-bottom: 0; }
.skeleton-shimmer {
  background: linear-gradient(90deg, var(--bg-200) 25%, var(--bg-100) 50%, var(--bg-200) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
