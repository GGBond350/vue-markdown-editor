<template> 

    <div class="toolbar"> 
        <template v-for="(item, index) in toolbarItems" :key="index">
            <!-- 渲染分割线 -->
            <div v-if="item.type === 'separator'" class="toolbar-divider"></div>

            <!-- 如果有list，就渲染下拉菜单组件 -->
            <ToolbarDropdown class="toolbar-item" v-else-if="item.listToolbar && item.listToolbar.length > 0" :item="item" />

            <!-- 否则，渲染普通按钮组件 -->
            <ToolbarButton class="toolbar-item" v-else-if="!item.component" :item="item" />
            <component :is="item.component" class="toolbar-item"/>
        </template>
    </div>
       
</template>

<script setup lang="ts">
import type { ToolbarItem } from '@/types/toolbar';
import type { PropType } from 'vue';
import ToolbarButton from './ToolbarButton.vue';
import ToolbarDropdown from './ToolbarDropdown.vue';

defineProps({
    toolbarItems: {
        type: Array as PropType<ToolbarItem[]>,
        required: true,
    },
})



</script>

<style scoped>  
.toolbar-divider {
    background-color: var(--border-color);
    display: inline-block;
    height: 16px;
    margin: 0 8px;
    position: relative;
    top: 0.1em;
    width: 1px;
}
.toolbar {
    display: flex;
    align-items: center;
    padding: 0 8px;
}

</style>