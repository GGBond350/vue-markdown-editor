<template>
    <div class="help-section">
    <h3 class="section-title">{{ title }}</h3>
    <ul class="help-list">
      <li v-for="item in items" :key="item.title" class="help-item">
        <component :is="item.icon" class="icon" />
        <span class="item-title">{{ item.title }}</span>
        <code class="rule">{{ item.rule }}</code>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { HelpItem } from '@/config/help';
import { ref } from 'vue';
interface Props {
    title: string;
    items: HelpItem[];
}
defineProps<Props>();

</script>

<style scoped>
.help-section {
  margin-bottom: 24px;
}

.section-title {
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--text-color-primary, #333);
  font-size: 14px;
}

.help-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.help-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  margin-bottom: 12px;
  color: var(--text-color-secondary, #666);
}

.icon {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 8px;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}


.item-title {
  flex: 1;
  min-width: 0;
}

.rule {
  margin-left: auto;
  font-size: 12px;
  background-color: var(--code-bg-color, #f5f5f5);
  padding: 2px 6px;
  border-radius: 3px;
  color: var(--code-text-color, #333);
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  white-space: pre;
}

</style>