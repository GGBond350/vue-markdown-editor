<script lang="ts" setup> 
import { useToolbarStore } from '@/store/toolbar';
import OutputIcon from "@/assets/images/output.svg"
import { storeToRefs } from 'pinia';
import Output from '@/components/Sidebar/Output.vue';
import { computed } from 'vue';

const toolbarStore = useToolbarStore();
const { setRightSidebar } = toolbarStore;
const { rightSidebarMark } = storeToRefs(toolbarStore);
const componentName = 'Output';

const iconStyle = computed(() => {
    return { color: rightSidebarMark.value === componentName ? 'var(--icon-color-active)' : 'var(--icon-color)' };
})

</script>

<template> 
     <a-tooltip placement="top">
        <template #title>
            <div style="text-align: center; white-space: pre-line;">
                <div>输出</div>
            </div>
        </template>
        <span @click="() => { setRightSidebar(Output, componentName) }" class="toolbar-item">
          <OutputIcon :style="iconStyle" />
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