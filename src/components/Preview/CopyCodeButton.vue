<template>
    <span class="copy-code-button" @click="handleCopy" :class="{ isCopied }" :disabled="loading">
        <CopyIcon v-if="!isCopied"  class="copy-icon"/>
        <CopyDoneIcon v-else  class="copy-icon"/>
    </span>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CopyIcon from '@/assets/images/copy.svg';
import CopyDoneIcon from '@/assets/images/copy-done.svg';

interface Props {
  content: string;
}

const props = defineProps<Props>();
const isCopied = ref(false);
const loading = ref(false);
const handleCopy = async () => {
  if (loading.value) return;
  
  loading.value = true;
  try {
    await navigator.clipboard.writeText(props.content);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (error) {
    console.error('复制失败:', error);
  } finally {
    loading.value = false;
  }
};

</script>

<style scoped>

.copy-code-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 8px;
}


.copy-icon {
  width: 100%;
  height: 100%;
  opacity: 0.8;
  transition: opacity 0.2s ease;
  color: var(--copy-icon-color);
}
.copy-icon:hover {
  color: var(--copy-icon-hover-color);
}


</style>