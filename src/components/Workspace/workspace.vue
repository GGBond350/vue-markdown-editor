<script setup lang="ts">
import StatusBar from '../StatusBar/StatusBar.vue';
import Editor from '../Editor/Editor.vue';
import Preview from '../Preview/Preview.vue';
import Toolbar from '../Toolbar/index.vue';
import { defaultToolbarsConfig } from '@/config/toolbar';
import { useToolbarStore } from '@/store/toolbar';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const toolbarStore = useToolbarStore();
const {
    isLeftSidebarVisible,
    leftSidebarComponent,
    isRightSidebarVisible,
    rightSidebarComponent,
    isOnlyPreview,
    isOnlyWrite
} = storeToRefs(toolbarStore);

const gridColumnsStyle = computed(() => {
    const leftWidth = isLeftSidebarVisible.value ? '240px' : '0';
    const rightWidth = isRightSidebarVisible.value ? '240px' : '0';
    let editorWidth = '1fr';
    let previewWidth = '1fr';
    if (isOnlyPreview.value) {
        editorWidth = '0';
    } else if (isOnlyWrite.value) {
        previewWidth = '0';
    }
    return {
        "gridTemplateColumns": `${leftWidth} ${editorWidth} ${previewWidth} ${rightWidth}`
    };
})



</script>

<template>

    <div class="workspace" :style="gridColumnsStyle">
        <div class="workspace-item toolbar-container">
            <Toolbar :toolbar-items="defaultToolbarsConfig"></Toolbar>
        </div>
        <div  v-if="isLeftSidebarVisible" class="workspace-item left-container">
           <component :is="leftSidebarComponent" />
        </div>
        <div v-if="!isOnlyPreview" class="workspace-item editor-container">
            <Editor />
        </div>
        <div v-if="!isOnlyWrite" class="workspace-item preview-container">
            <Preview />
        </div>
        <div v-if="isRightSidebarVisible" class="workspace-item right-container">
            <component :is="rightSidebarComponent" />
        </div>
        <div class="workspace-item statusbar-container">
            <StatusBar />
        </div>  
    </div>
</template>

<style scoped > 

.workspace {
    display: grid;
    width: 100%;
    height: 100%;
    border: 1px solid var(--border-color);
    grid-template-rows: auto 1fr auto;
    grid-template-areas: 
        "toolbar toolbar toolbar toolbar"
        "left editor preview right"
        "statusbar statusbar statusbar statusbar";
    padding: 10px;
    box-sizing: border-box; /* 确保padding和border不会影响总宽度 */
    transition: grid-template-columns 0.3s ease-in-out;
}
.workspace-item {
    background-color: var(--bg-color);
    border-radius: 4px;
    border: 1px solid var(--border-color);
    overflow: hidden; /* 确保子内容不会溢出 */
    display: flex; /* 让子组件能撑满 */
    flex-direction: column;
}


.toolbar-container {
    grid-area: toolbar;
}
.left-container {
    grid-area: left;
}
.editor-container {
    grid-area: editor;
}
.preview-container {
    grid-area: preview;
}
.right-container {
    grid-area: right;
}
.statusbar-container {
    grid-area: statusbar;
} 
</style>