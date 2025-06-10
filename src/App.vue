<script setup lang="ts">
import { ref } from 'vue';
import Editor from './components/Editor.vue';
import Preview from './components/Preview.vue';
</script>

<template>
  <div class="app-container">
    <div class="editor-container">
      <Editor />
    </div>
    <div class="preview-container">
      <Preview />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden; /* 防止出现不必要的滚动条 */
}

.editor-container,
.preview-container {
  flex: 1;
  padding: 10px;
  overflow-y: auto; /* 如果内容过多，允许各自滚动 */
  height: 100%; /* 确保子元素高度能正确计算 */
  box-sizing: border-box;
}
.editor-container {
  border-right: 1px solid #eee;
  background-color: skyblue; 
}

</style>
