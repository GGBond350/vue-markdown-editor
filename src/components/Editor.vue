<script setup lang="ts">
import { ref } from 'vue';
</script>

<template>
  <div class="editor-container">
    <textarea class="editor-textarea" />
  </div>
</template>

<style scoped>
.editor-container {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  height: 100%;
  box-sizing: border-box;
}
.editor-textarea {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  resize: none;
}
</style>
