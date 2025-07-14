<template>
    <div class="header">
        <div class="header-left">
            <Logo class="logo-icon" />
            <span class="header-title">Vue Markdown Editor</span>
        </div>
        <div class="header-right">
            <LightIcon class="iconStyle themeIcon" @click="toggleTheme('light')"></LightIcon>
            <DarkIcon class="iconStyle themeIcon" @click="toggleTheme('dark')"></DarkIcon>
            <component v-for="item in defaultSiteConfig" :is="item.component" class="iconStyle" @click="() => openLink(item.url)" />
        </div>
    </div>
</template>
<script setup lang="ts">
import Logo from '@/assets/images/snake.svg?component';
import GiteeIcon from '@/assets/images/gitee.svg?component';
import GithubIcon from '@/assets/images/github-fill.svg?component';
import LightIcon from '@/assets/images/light_mode.svg?component';
import DarkIcon from '@/assets/images/dark_mode.svg?component';
import { defaultSiteConfig } from '@/config/site';

const toggleTheme = (theme: 'light' | 'dark') => {
   
};
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
  border-bottom: 1px solid #e0e0e0;
  background-color: #fff;
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
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.themeIcon {
    border: 1px solid #dcdfe6;
    padding: 2px;
    border-radius: 6px;
}

.iconStyle {
  width: 28px;
  height: 28px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
}
.iconStyle:not(.themeIcon):hover {
    color: #333; /* 鼠标悬停时改变颜色 */
    transform: scale(1.1); /* 鼠标悬停时放大 */
}

.themeIcon:hover {
   color: #333;
   border: 1px solid #404040;
   transform: scale(1.1); /* 鼠标悬停时放大 */
}


</style>
