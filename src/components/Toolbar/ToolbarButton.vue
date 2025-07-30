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
          <component :is="icon" class="iconStyle" />
        </span>
    </a-tooltip>

</template>
<script setup lang="ts">
import type { ToolbarItem } from '@/types/editor/toolbar';
import { computed } from 'vue';
import { useToolbarStore } from '@/store/toolbar';
import { storeToRefs } from 'pinia';

const toolbarStore = useToolbarStore();


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
    width: 18px;
    height: 18px;
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
.iconStyle {
		color: var(--icon-color);
}
</style>