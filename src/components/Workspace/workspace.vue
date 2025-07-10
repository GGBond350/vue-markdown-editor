<script setup lang="ts">
import Directory from '../Sidebar/directory.vue';
import Help from '../Sidebar/help.vue';
import StatusBar from '../StatusBar/statusBar.vue';
import Editor from '../Sidebar/Editor.vue';
import Preview from '../Preview/Preview.vue';
import Toolbar from '../Toolbar/Toolbar.vue';
import { defaultToolbarsConfig } from '@/config/toolbar';
import { useToolbarStore } from '@/store/toolbar';
import { storeToRefs } from 'pinia';

const toolbarStore = useToolbarStore();
const {
    isLeftSidebarVisible,
    leftSidebarComponent,
    isRightSidebarVisible,
    rightSidebarComponent,
    isOnlyPreview,
    isOnlyWrite
} = storeToRefs(toolbarStore);



</script>

<template>

    <div class="workspace">
        <div class="workspace-item toolbar-container">
            <Toolbar :toolbar-items="defaultToolbarsConfig"></Toolbar>
        </div>
        <div  v-show="isLeftSidebarVisible" class="workspace-item left-container">
           <component :is="leftSidebarComponent" />
        </div>
        <div v-show="!isOnlyPreview" class="workspace-item editor-container">
            <Editor />
        </div>
        <div v-show="!isOnlyWrite" class="workspace-item preview-container">
            <Preview />
        </div>
        <div v-show="isRightSidebarVisible" class="workspace-item right-container">
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
    grid-template-rows: auto 1fr auto;
    grid-template-columns: 240px 1fr 1fr 240px;
    grid-template-areas: 
        "toolbar toolbar toolbar toolbar"
        "left editor preview right"
        "statusbar statusbar statusbar statusbar";
    gap: 10px;
    padding: 10px;    
}
.workspace-item {
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #e0e0e0;
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