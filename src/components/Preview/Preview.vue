<script setup lang="ts">
import { useEditorStore } from '@/store/useEditorStore';
import { onMounted, ref } from 'vue';

import { usePreviewState } from '@/composables/usePreview';
const editorStore = useEditorStore();
const { setCurrentScrollContainer } = editorStore;
const previewContainer = ref<HTMLDivElement | null>(null);


const handleMouseEnter = () => {
  setCurrentScrollContainer('preview');
};

onMounted(() => {
  if (previewContainer.value) {
    usePreviewState().initPreview(previewContainer.value);
  }
});
const randomHeights = Array.from({ length: 100 }, () => 20 + Math.random() * 30);
</script>

<template>
  <div ref="previewContainer" class="preview-container" @mouseenter="handleMouseEnter">
    <div
      v-for="i in 100"
      :key="i"
      :data-line="i"
      :style="{ 
        height: `${randomHeights[i - 1]}px`, 
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'center'
      }"
    >
      这是 Preview 的第 {{ i }} 行，模拟对应 Editor 的第 {{ i }} 行。
    </div>
  </div>
</template>

<style scoped>
.preview-container {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  height: 100%;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  color: #333;
}

</style>
