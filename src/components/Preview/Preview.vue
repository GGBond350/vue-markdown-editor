<script setup lang="ts">
import { useEditorStore } from '@/store/useEditorStore';
import { computed, onMounted, ref } from 'vue';

import { usePreviewState } from '@/composables/usePreview';
import { parseMarkdown } from '@/parser/core/parse';
import { transformHtml } from '@/parser/core/transform';
const editorStore = useEditorStore();
const { setCurrentScrollContainer } = editorStore;
const previewContainer = ref<HTMLDivElement | null>(null);


const handleMouseEnter = () => {
  setCurrentScrollContainer('preview');
};

const renderedHtml = computed(() => {
  if (editorStore.content) {
    console.log('Rendering preview for content:', editorStore.content);
    const ast = parseMarkdown(editorStore.content);
    console.log('Preview AST:', ast);
    return transformHtml(ast);
  }
  return '';
})

onMounted(() => {
  if (previewContainer.value) {
    usePreviewState().initPreview(previewContainer.value);
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
