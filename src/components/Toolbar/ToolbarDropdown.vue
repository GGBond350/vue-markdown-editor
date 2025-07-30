<template>
    <a-dropdown  placement="bottom">
        <span class="toolbar-item">
            <component :is="item.icon" class="iconStyle" /></span>
        <template #overlay>
            <a-menu :items="menuItems" @click="handleMenuClick" class="menuStyle"/>
        </template>
    </a-dropdown>

</template>

<script setup lang="ts">
import type { ToolbarItem } from '@/types/editor/toolbar';
import type { ItemType } from 'ant-design-vue';
import type { MenuInfo } from 'ant-design-vue/es/menu/src/interface';
import { computed, ref } from 'vue';

const props = defineProps<{
 item: ToolbarItem,

}>();

const menuItems = computed<ItemType[]>(() => {
    if (!props.item.listToolbar) return [];
    return props.item.listToolbar.map(item => ({
        key: item.type,
        label: item.title,
    }));
});

const handleMenuClick = (info: MenuInfo) => {
    const key = info.key as string;
    const selectedItem = props.item.listToolbar?.find(item => item.type === key);
    if (selectedItem?.onClick) {
        selectedItem.onClick();
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
.menuStyle {
		background: var(--bg-color);
}
.menuStyle :deep(.ant-dropdown-menu-title-content) {
	color: var(--heading-color);
}  
</style>