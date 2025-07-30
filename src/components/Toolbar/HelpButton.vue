<script lang="ts" setup> 
import { useToolbarStore } from '@/store/toolbar';
import HelpIcon from "@/assets/images/help.svg"
import { storeToRefs } from 'pinia';
import Help from '@/components/Sidebar/help.vue';
import { BaseToolbarType } from '@/types/editor/toolbar';
import { computed } from 'vue';

const toolbarStore = useToolbarStore();
const { setRightSidebar } = toolbarStore;
const { isRightSidebarVisible } = storeToRefs(toolbarStore);
const componentName = 'Help';

const iconStyle = computed(() => {
    return { color: isRightSidebarVisible.value ? 'var(--icon-color-active)' : 'var(--icon-color)' };
})

</script>

<template> 
     <a-tooltip placement="top">
        <template #title>
            <div style="text-align: center; white-space: pre-line;">
                <div>帮助</div>
            </div>
        </template>
        <span @click="() => { setRightSidebar(Help, componentName) }" class="toolbar-item">
          <HelpIcon :style="iconStyle" />
        </span>
    </a-tooltip>

</template>

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
</style>