<script lang="ts" setup> 
import { useToolbarStore } from '@/store/toolbar';
import previewIcon from "@/assets/images/preview.svg?component";
import { BaseToolbarType } from '@/types/toolbar';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const toolbarStore = useToolbarStore();
const { toggleOnlyPreview } = toolbarStore;
const { isOnlyPreview } = storeToRefs(toolbarStore);

const iconStyle = computed(() => {
    return { color: isOnlyPreview.value ? 'var(--icon-color-active)' : 'var(--icon-color)' };
});

</script>

<template> 
     <a-tooltip placement="top">
        <template #title>
            <div style="text-align: center; white-space: pre-line;">
                <div>只读</div>
            </div>
        </template>
        <span @click="() => { toggleOnlyPreview() }" class="toolbar-item">
          <previewIcon :style="iconStyle" />
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