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
    const isSideBySide = ref(false);
    // 侧边栏组件
    // 使用shallowRef避免深层响应式，提高性能
    const sidebarComponent = shallowRef<Component | null>(null);
    // 组件标识符，用于动态加载组件
    const componentMark = ref<string | null>(null);

    function setSidebarComponent(component: Component | null, mark: string | null) {
        if (mark === componentMark.value) {
            // 如果组件标识符相同，则不更新
            isSideBySide.value = !isSideBySide.value; // 切换侧边栏显示状态
        } else {
            isSideBySide.value = true; // 显示侧边栏
            sidebarComponent.value = component; // 设置新的组件
            componentMark.value = mark; // 更新组件标识符
        }
    }



    return {
        // 状态

        isSideBySide,
        isFullscreen,
        isOnlyPreview,
        isOnlyWrite,
        sidebarComponent,
        componentMark,


        toggleOnlyWrite,
        toggleOnlyPreview,
        toggleFullscreen,
        setSidebarComponent
    };
});