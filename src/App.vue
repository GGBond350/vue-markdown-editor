<script setup lang="ts">
import Header from './components/Header/header.vue';
import Footer from './components/Footer/footer.vue';
import Workspace from './components/Workspace/workspace.vue';
import { useToolbarStore } from '@/store/toolbar';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const toolbarStore = useToolbarStore();
const { isFullscreen } = storeToRefs(toolbarStore);
</script>

<template>
  <div class="app-container">
    <Header v-if="!isFullscreen"></Header>
    <main class="main-container">
        <Workspace />
    </main>
    <Footer v-if="!isFullscreen"></Footer>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden; /* 防止出现不必要的滚动条 */
  flex-direction: column; /* 使工具栏在顶部 */
}
/* 2. 为 Header 和 Footer 添加一些基本样式 */
/* (您可以根据需要替换成您自己的Header/Footer组件样式) */
:deep(.header-root), :deep(.footer-root) {
  flex-shrink: 0; /* 防止被压缩 */
  padding: 10px 20px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
}
:deep(.footer-root) {
  border-top: 1px solid #e0e0e0;
  border-bottom: none;
}


/* 3. 关键：这个样式现在被用上了 */
.main-container {
  flex: 1; /* 关键：让主容器占据所有剩余的垂直空间 */
  overflow: hidden; /* 关键：防止其子元素溢出 */
  margin: 10px;
}

</style>
