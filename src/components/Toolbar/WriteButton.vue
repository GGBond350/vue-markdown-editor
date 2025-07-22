<script lang="ts" setup> 
import { useToolbarStore } from '@/store/toolbar';
import WriteIcon from "@/assets/images/write.svg?component"
import { BaseToolbarType } from '@/types/editor/toolbar';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';


const toolbarStore = useToolbarStore();
const { toggleOnlyWrite } = toolbarStore;
const { isOnlyWrite } = storeToRefs(toolbarStore);

const iconStyle = computed(() => {
    return { color: isOnlyWrite.value ? 'var(--icon-color-active)' : 'var(--icon-color)' };
});

</script>

<template> 
     <a-tooltip placement="top">
        <template #title>
            <div style="text-align: center; white-space: pre-line;">
                <div>只写</div>
            </div>
        </template>
        <span @click="() => { toggleOnlyWrite() }" class="toolbar-item">
            <WriteIcon :style="iconStyle" />
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
.toolbar-icon {
    width: 16px;
    height: 16px;
    transition: transform 0.3s;
}
</style>