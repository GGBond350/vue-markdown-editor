<template>
    <div class="header">
        <div class="header-left">
            <Logo class="logo-icon" />
            <span class="header-title">Vue Markdown Editor</span>
        </div>
        <div class="header-right">
            <LightIcon class="iconStyle themeIcon" @click="toggleTheme" v-if="isLightMode"/>
            <DarkIcon class="iconStyle themeIcon" @click="toggleTheme" v-else/>
            <component v-for="item in defaultSiteConfig" :is="item.component" class="iconStyle" @click="() => openLink(item.url)" />
        </div>
    </div>
</template>
<script setup lang="ts">
import Logo from '@/assets/images/snake.svg?component';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import LightIcon from '@/assets/images/light_mode.svg?component';
import DarkIcon from '@/assets/images/dark_mode.svg?component';
import { defaultSiteConfig } from '@/config/site';
import { useThemeStore } from '@/store/useThemeStore';
const themeStore = useThemeStore();
const { toggleTheme } = themeStore;
const { currentTheme } = storeToRefs(themeStore);


const isLightMode = computed(() => currentTheme.value === 'light');
const openLink = (url: string) => {
    window.open(url, '_blank');
};
</script>


<style scoped >


.header {
  display: flex;
  justify-content: space-between; /* 核心：两端对齐 */
  align-items: center; /* 垂直居中 */
  padding: 0 20px; /* 左右留出边距 */
  height: 50px; /* 定义一个合适的高度 */
  background-color: var(--bg-color);
}
.header-left {
  display: flex;
  align-items: center;
  gap: 10px; /* 图标和标题之间的间距 */
}
.header-right {
  display: flex;
  align-items: center;
  gap: 25px; /* 使用 gap 替代 margin */
}

.logo-icon {
  height: 30px; /* 控制图标大小 */
  width: 30px;
}
.header-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color);
}

.themeIcon {
    border: 1px solid var(--border-color);
    padding: 2px;
    border-radius: 6px;
}

.iconStyle {
  width: 28px;
  height: 28px;
  color: var(--icon-color);
  cursor: pointer;
  transition: all 0.3s;
}
.iconStyle:not(.themeIcon):hover {
    color: var(--icon-hover-bg);
    transform: scale(1.1); /* 鼠标悬停时放大 */
}

.themeIcon:hover {
   color: var(--icon-hover-bg);
   border: 1px solid var(--border-color);
   transform: scale(1.1); /* 鼠标悬停时放大 */
}


</style>
