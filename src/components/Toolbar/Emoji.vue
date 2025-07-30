<template>
 <a-dropdown placement="bottom">
   <span class="toolbar-item">
      <EmojiIcon class="iconStyle" />
    </span>
    <template #overlay>
      <Picker 
        :data="emojiIndex"
        :i18n="i18n"
        emojiTooltip
        @select="insertEmojiEvent"
      />
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { Picker, EmojiIndex } from 'emoji-mart-vue-fast/src';
import data from "emoji-mart-vue-fast/data/all.json";
import "emoji-mart-vue-fast/css/emoji-mart.css";
import EmojiIcon from '@/assets/images/emoji.svg?component';
import { insertEmojiEvent } from '@/config/toolbar/event';

const emojiIndex = new EmojiIndex(data);
const i18n = {
  search: '搜索',
  notfound: '未找到表情',
  categories: {
    search: '搜索结果',
    recent: '常用表情',
    smileys: '笑脸与表情',
    people: '人物',
    nature: '动物与自然',
    foods: '食物',
    activity: '活动',
    places: '地点',
    objects: '物品',
    symbols: '符号',
    flags: '国旗',
    custom: '自定义表情',
  }
}
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
</style>