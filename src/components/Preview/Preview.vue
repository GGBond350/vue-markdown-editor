<script setup lang="ts">
import { useEditorStore } from '@/store/useEditorStore';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

import { usePreviewState } from '@/composables/usePreview';
import { parseMarkdown } from '@/parser/core/parse';
import { transformHtml } from '@/parser/core/transform';

const editorStore = useEditorStore();
const { setCurrentScrollContainer } = editorStore;
const previewContainer = ref<HTMLDivElement | null>(null);

// 防抖后的内容
const debouncedContent = ref(editorStore.content);
let debounceTimer: number | null = null;

// 监听内容变化，使用防抖
watch(() => editorStore.content, (newContent) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  
  debounceTimer = setTimeout(() => {
    debouncedContent.value = newContent;
  }, 150); // 300ms 防抖延迟
}, { immediate: true });

const handleMouseEnter = () => {
  setCurrentScrollContainer('preview');
};

const renderedHtml = computed(() => {
  if (debouncedContent.value) {
    const ast = parseMarkdown(debouncedContent.value);
    return transformHtml(ast);
  }
  return '';
})

onMounted(() => {
  if (previewContainer.value) {
    usePreviewState().initPreview(previewContainer.value);
  }
});

// 清理定时器
onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
});
</script>

<template>
  <div ref="previewContainer" class="preview-container" @mouseenter="handleMouseEnter" v-html="renderedHtml">
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
.preview-line {
	color: var(--text-color);
}

</style>
