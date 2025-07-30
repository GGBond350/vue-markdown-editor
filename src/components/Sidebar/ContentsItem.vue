<template>
    <div class="contents-item">
    <!-- 当前标题 -->
    <a
      :href="title.href"
      :class="[
        'contents-link',
        { 'active': isActive }
      ]"
      :style="{ paddingLeft: `${indentLevel * 16 + 8}px` }"
      @click="handleClick"
    >
      {{ title.title }}
    </a>
    
    <!-- 递归渲染子标题 -->
    <template v-if="title.children && title.children.length > 0">
      <ContentsItem
        v-for="child in title.children"
        :key="child.key"
        :title="child"
        :active-link="activeLink"
        :level="level + 1"
        @click="$emit('click', $event, child)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Title } from '@/utils/formatContents';
import { computed, ref } from 'vue';
interface Props {
    title: Title;
    activeLink: string;
    level?: number;
}
interface Emits {
    (e: 'click', event: Event , title: Title): void;
}
const props = withDefaults(defineProps<Props>(), {
    level: 0
});

const emit = defineEmits<Emits>();

const indentLevel = computed(() => {
    const headingLevel = parseInt(props.title.nodeName.charAt(1)) - 1;
    return Math.max(0, headingLevel);
})
const isActive = computed(() => {
    return props.activeLink === props.title.href;
});
const handleClick = (event: Event) => {
    emit('click', event, props.title);
};

</script>

<style scoped>
.contents-item {
  width: 100%;
}

.contents-link {
  display: block;
  padding: 6px 8px;
  color: var(--text-color, #333);
  text-decoration: none;
  font-size: 13px;
  line-height: 1.4;
  border-radius: 4px;
  transition: all 0.2s ease;
  cursor: pointer;
  word-break: break-word;
}

.contents-link:hover {
  background-color: var(--hover-bg-color, #f5f5f5);
  color: var(--primary-color, #1890ff);
}

.contents-link.active {
  background-color: var(--primary-color-light, #e6f7ff);
  color: var(--primary-color, #1890ff);
  font-weight: 500;
}

</style>