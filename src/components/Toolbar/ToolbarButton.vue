<template> 
    <a-tooltip placement="top">
        <template #title>
            <div style="text-align: center; white-space: pre-line;">
                <div>{{ item.title }}</div>
                <div v-if="item.hotkey" style="font-size: 12px;">
                {{ item.description }}
                </div>
            </div>
        </template>
        <span @click="handleClick" class="toolbar-item">
          <img :src="icon" class="toolbar-icon" />
        </span>
    </a-tooltip>

</template>
<script setup lang="ts">
import type { ToolbarItem } from '@/types/toolbar';
import { computed } from 'vue';

const props = defineProps<{
    item: ToolbarItem;
}>();
const icon = computed(() => {
    if (props.item.icon) return props.item.icon;
    return 'icon-default'; // Fallback icon
});
const handleClick = () => {
    if (props.item.onClick) {
        props.item.onClick();
    }
};

</script>
<style scoped>
.toolbar-item {
    width: 16px;
    height: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-sizing: content-box;
    padding: 3px;
    border-radius: 3px;
    margin: 0 2px;
    transition: all 0.3s;
}
</style>