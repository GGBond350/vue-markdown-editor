<template>
    <div class="statusbar">
        <span class="status-item">Line: {{ cursorRow }}</span>
        <span class="status-item">Column: {{ cursorCol }}</span>
				<span class="status-item">Lines: {{ lineCount }}</span>
				<span class="status-item">Characters: {{ charCount }}</span>
    </div>
</template>

<script setup lang="js">
import { useEditorStore } from '@/store/useEditorStore';
import { storeToRefs } from 'pinia';
const editorStore = useEditorStore();
const { charCount, lineCount, cursorCol, cursorRow } = storeToRefs(editorStore);


</script>
