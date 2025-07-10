import { defineStore } from "pinia";
import { ref, shallowRef, type Component } from "vue";

export const useToolbarStore = defineStore("toolbar", () => {
    const isFullscreen = ref(false);

    function toggleFullscreen() {
        isFullscreen.value = !isFullscreen.value;
    }

    const isOnlyWrite = ref(false);
    function toggleOnlyWrite() {
        isOnlyWrite.value = !isOnlyWrite.value;
        if (isOnlyWrite.value) {
            isOnlyPreview.value = false; // 关闭预览模式
        }
    }

    const isOnlyPreview = ref(false);
    function toggleOnlyPreview() {
        isOnlyPreview.value = !isOnlyPreview.value;
        if (isOnlyPreview.value) {
            isOnlyWrite.value = false; // 关闭只写模式
        }
    }
    // 侧边栏相关状态
    const isLeftSidebarVisible = ref(false);
    const leftSidebarComponent = shallowRef<Component | null>(null);
    const leftSidebarMark = ref<string | null>(null);


    const isRightSidebarVisible = ref(false);
    const rightSidebarComponent = shallowRef<Component | null>(null);
    const rightSidebarMark = ref<string | null>(null);

    function setLeftSidebar(component: Component | null, mark: string | null) {
        if (leftSidebarMark.value !== mark) {
            leftSidebarComponent.value = component;
            leftSidebarMark.value = mark;
            isLeftSidebarVisible.value = true; // 显示左侧边栏
        } else {
            isLeftSidebarVisible.value = false; // 隐藏左侧边栏
        }
    }

    function setRightSidebar(component: Component | null, mark: string | null) {
        if (rightSidebarMark.value !== mark) {
            rightSidebarComponent.value = component;
            rightSidebarMark.value = mark;
            isRightSidebarVisible.value = true; // 显示右侧边栏
        } else {
            isRightSidebarVisible.value = false; // 隐藏右侧边栏
        }
    }



    return {
        // 状态

        isLeftSidebarVisible,
        isRightSidebarVisible,
        isFullscreen,
        isOnlyPreview,
        isOnlyWrite,
        leftSidebarComponent,
        leftSidebarMark,
        rightSidebarComponent,
        rightSidebarMark,


        toggleOnlyWrite,
        toggleOnlyPreview,
        toggleFullscreen,
        setLeftSidebar,
        setRightSidebar,
        
    };
});