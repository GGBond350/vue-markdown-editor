<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useEditorState } from '../composables/useEditorState';
const editorContainer = ref<HTMLDivElement | null>(null);
const { content, initEditor} = useEditorState({
    defaultContent: 'Hello, this is a simple editor!',
    onContentChange(content) {
        console.log('Content changed:', content);
    },
});

onMounted(() => {
    if (editorContainer.value) {
        initEditor(editorContainer.value);
    }
});
</script>

<template>
   <div ref="editorContainer" class="editor-container"></div>
</template>

<style scoped>
.editor-container {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  height: 100%;
  box-sizing: border-box;
}
</style>
