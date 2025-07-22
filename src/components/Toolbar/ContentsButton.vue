<script lang="ts" setup> 
import { useToolbarStore } from '@/store/toolbar';
import ContentsIcon from "@/assets/images/contents.svg?component";
import { storeToRefs } from 'pinia';
import Contents from '@/components/Sidebar/Contents.vue';
import { BaseToolbarType } from '@/types/editor/toolbar';
import { computed } from 'vue';

const toolbarStore = useToolbarStore();
const { setLeftSidebar } = toolbarStore;
const { isLeftSidebarVisible } = storeToRefs(toolbarStore);
const componentName = 'Contents';

const iconStyle = computed(() => {
    return { color: isLeftSidebarVisible.value ? '#409eff' : '#606266' };
})

</script>

<template> 
     <a-tooltip placement="top">
        <template #title>
            <div style="text-align: center; white-space: pre-line;">
                <div>目录</div>
            </div>
        </template>
        <span @click="() => { setLeftSidebar(Contents, componentName) }" class="toolbar-item">
          <ContentsIcon :style="iconStyle" />
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