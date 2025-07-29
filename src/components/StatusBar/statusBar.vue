<template>
    <div class="statusbar">
        <div class="statusbar-left">
            <span class="status-item">行: {{ cursorRow }}, 列: {{ cursorCol }}</span>
            <span class="status-item">行数: {{ lineCount }}</span>
            <span class="status-item">字数: {{ charCount }}</span>
        </div>
        <div class="statusbar-right">
          <a-checkbox :checked="isSyncScroll" @change="toggleSyncScroll"><span class="status-item">同步滚动</span></a-checkbox>
          <div class="status-item" @click="handleAreaScrollToTop">回到顶部</div>
        </div>
        
    </div>
</template>

<script setup lang="js">
import { useEditorStore } from '@/store/useEditorStore';
import { handleScrollToTop } from '@/utils/ScrollSynchronizer';
import { storeToRefs } from 'pinia';
const editorStore = useEditorStore();
const { toggleSyncScroll } = editorStore;
const { isSyncScroll, charCount, lineCount, cursorCol, cursorRow, editorView, previewView } = storeToRefs(editorStore);
const handleAreaScrollToTop = () => {
  if (editorView.value && previewView.value) {
   handleScrollToTop({
      editorView: editorView.value,
      previewView: previewView.value
    });
  }
};

</script>

<style scoped> 

.statusbar {
  display: flex;
  justify-content: space-between; /* 两端对齐 */
  align-items: center; /* 垂直居中 */
  padding: 10px 20px;
  background-color: var(--bg-color);
  border-top: 1px solid var(--border-color);
}

.statusbar-left, .statusbar-right {
  display: flex;
  align-items: center;
}

.status-item {
  margin-right: 15px;
  color: var(--text-color);
	font-size: 15px;
	cursor: pointer;
}

</style>
