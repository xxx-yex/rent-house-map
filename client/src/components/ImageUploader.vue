<template>
  <div class="image-uploader">
    <div class="image-list">
      <div v-for="(url, idx) in modelValue" :key="idx" class="image-item">
        <img :src="url" class="image-thumb" />
        <button class="image-remove" @click="removeImage(idx)">&times;</button>
      </div>
      <div v-if="modelValue.length < max" class="image-add" @click="triggerInput">
        <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" multiple @change="onSelect" style="display:none" />
        <span class="add-icon">+</span>
        <span class="add-text">上传图片</span>
      </div>
    </div>
    <div v-if="uploading" class="upload-hint">上传中...</div>
  </div>
</template>

<script>
import { ref } from 'vue'
import api from '../api'
import { useToast } from '../composables/useToast'

export default {
  props: {
    modelValue: { type: Array, default: () => [] },
    max: { type: Number, default: 5 }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const uploading = ref(false)
    const fileInput = ref(null)

    function triggerInput() {
      fileInput.value?.click()
    }

    async function onSelect(e) {
      const files = Array.from(e.target.files)
      if (!files.length) return
      if (props.modelValue.length + files.length > props.max) {
        useToast().show(`最多上传 ${props.max} 张图片`, 'error')
        return
      }

      uploading.value = true
      try {
        const fd = new FormData()
        files.forEach(f => fd.append('images', f))
        const { urls } = await api.post('/upload', fd)
        emit('update:modelValue', [...props.modelValue, ...urls])
      } catch {
        // toast handled by interceptor
      } finally {
        uploading.value = false
        e.target.value = ''
      }
    }

    function removeImage(idx) {
      const updated = [...props.modelValue]
      updated.splice(idx, 1)
      emit('update:modelValue', updated)
    }

    return { uploading, fileInput, triggerInput, onSelect, removeImage }
  }
}
</script>

<style scoped>
.image-list { display: flex; flex-wrap: wrap; gap: 8px; }
.image-item { position: relative; width: 80px; height: 80px; border-radius: 8px; overflow: hidden; }
.image-thumb { width: 100%; height: 100%; object-fit: cover; }
.image-remove {
  position: absolute; top: 2px; right: 2px;
  width: 20px; height: 20px; border-radius: 50%;
  background: rgba(0,0,0,0.6); color: #fff; border: none;
  font-size: 14px; line-height: 1; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.image-add {
  width: 80px; height: 80px; border-radius: 8px;
  border: 2px dashed var(--bg-300); display: flex; flex-direction: column;
  align-items: center; justify-content: center; cursor: pointer;
  transition: border-color 0.2s;
}
.image-add:hover { border-color: var(--primary-300); }
.add-icon { font-size: 24px; color: var(--text-200); line-height: 1; }
.add-text { font-size: 10px; color: var(--text-200); margin-top: 2px; }
.upload-hint { font-size: 12px; color: var(--text-200); margin-top: 4px; }
</style>
