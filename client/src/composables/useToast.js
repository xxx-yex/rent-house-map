import { reactive } from 'vue'

const state = reactive({ messages: [] })
let nextId = 0

export function useToast() {
  function show(text, type = 'info', duration = 3000) {
    const id = nextId++
    state.messages.push({ id, text, type })
    setTimeout(() => {
      const idx = state.messages.findIndex(m => m.id === id)
      if (idx >= 0) state.messages.splice(idx, 1)
    }, duration)
  }

  function remove(id) {
    const idx = state.messages.findIndex(m => m.id === id)
    if (idx >= 0) state.messages.splice(idx, 1)
  }

  return { messages: state.messages, show, remove }
}
