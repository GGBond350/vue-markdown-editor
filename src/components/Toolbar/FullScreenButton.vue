<script lang="ts" setup> 
import { useToolbarStore } from '@/store/toolbar';
import fullscreenIcon from "@/assets/images/fullscreen.svg?component";
import ExitFullscreenIcon from "@/assets/images/exit-fullscreen.svg?component";
import { BaseToolbarType } from '@/types/toolbar';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { Hotkey } from '@/config/hotkeys';

const toolbarStore = useToolbarStore();
const { toggleFullscreen } = toolbarStore;
const { isFullscreen } = storeToRefs(toolbarStore);

</script>

<template> 
     <a-tooltip placement="top">
        <template #title>
            <div style="text-align: center; white-space: pre-line;" >
                <div>{{ isFullscreen ? '退出全屏' : '全屏' }}</div>
                <div>{{ Hotkey.FULL_SCREEN.formatCommand }}</div>
            </div>
        </template>
        <span @click="() => { toggleFullscreen() }" class="toolbar-item">
          <fullscreenIcon  v-if="!isFullscreen" />
          <ExitFullscreenIcon  v-else />
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