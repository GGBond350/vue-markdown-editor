<template>
     <div class="help-container">
    <!-- Markdown 语法部分 -->
    <HelpSection title="Markdown 语法" :items="grammar" />
    
    <!-- 快捷键部分 -->
    <HelpSection title="快捷键" :items="shortcuts" />
  </div>
</template>

<script setup lang="ts">
import { grammar, shortcuts } from '@/config/help';
import HelpSection from './HelpSection.vue';
</script>

<style scoped>
.help-container {
  width: 100%;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  overflow-y: auto;
  background-color: var(--bg-color, #fff);
}

/* 滚动条样式 */
.help-container::-webkit-scrollbar {
  width: 6px;
}

.help-container::-webkit-scrollbar-track {
  background: var(--scrollbar-track-color, #f1f1f1);
}

.help-container::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb-color, #c1c1c1);
  border-radius: 3px;
}

.help-container::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover-color, #a8a8a8);
}
</style>