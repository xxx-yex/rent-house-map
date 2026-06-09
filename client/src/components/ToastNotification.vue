<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="toast"
        :class="'toast-' + msg.type"
        @click="remove(msg.id)"
      >
        {{ msg.text }}
      </div>
    </TransitionGroup>
  </div>
</template>

<script>
import { useToast } from '../composables/useToast'

export default {
  setup() {
    const { messages, remove } = useToast()
    return { messages, remove }
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  pointer-events: none;
}
.toast {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  color: #fff;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  max-width: 320px;
  word-break: break-word;
}
.toast-error { background: var(--red-badge, #c0392b); }
.toast-success { background: var(--primary-300, #19725D); }
.toast-info { background: #333; }

.toast-enter-active { transition: all 0.3s ease-out; }
.toast-leave-active { transition: all 0.2s ease-in; }
.toast-enter-from { opacity: 0; transform: translateX(40px); }
.toast-leave-to { opacity: 0; transform: translateX(40px); }
</style>
