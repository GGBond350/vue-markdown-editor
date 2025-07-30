<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useEditorStore } from '@/store/useEditorStore';
import { useEditorState } from '../../composables/useEditor';
const editorContainer = ref<HTMLDivElement | null>(null);
const editorStore = useEditorStore();
const { setCurrentScrollContainer } = editorStore;
const { initEditor } = useEditorState({
		enableShotcut: true,
    defaultContent: 'Hello, this is a simple editor!',
    onContentChange(content) {
    },
});

const handleMouseEnter = () => {
  setCurrentScrollContainer('editor');
};

onMounted(() => {
    if (editorContainer.value) {
			initEditor(editorContainer.value);
    }
});
</script>

<template>
  <div ref="editorContainer" class="editor-instance-container" @mouseenter="handleMouseEnter"></div>
</template>

<style scoped>
.editor-instance-container {
  width: 100%;
  height: 100%; /* 继承来自Grid单元格的高度 */
}
.editor-instance-container :deep(.cm-editor) {
  height: 100%;
}
.editor-instance-container :deep(.cm-scroller) {
  height: 100%;
}
.editor-instance-container :deep(.cm-line) {
	font-size: 16px;
	padding: 5px 2px 0px 10px;
}
</style>