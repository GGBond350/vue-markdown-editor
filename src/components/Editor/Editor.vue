<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useEditorState } from '../../composables/useEditorState';
const editorContainer = ref<HTMLDivElement | null>(null);
const { content, initEditor} = useEditorState({
    defaultContent: 'Hello, this is a simple editor!',
    onContentChange(content) {
    },
});

onMounted(() => {
    if (editorContainer.value) {
        initEditor(editorContainer.value);
    }
});
</script>

<template>
  <div ref="editorContainer" class="editor-instance-container"></div>
</template>

<style scoped>
.editor-instance-container {
  width: 100%;
  height: 100%; /* 继承来自Grid单元格的高度 */
  overflow-y: auto; /* 关键：在这里实现滚动！*/
}
</style>