<template>
 <a-dropdown placement="bottom">
   <span class="toolbar-item">
      <EmojiIcon/>
    </span>
    <template #overlay>
      <Picker 
        :data="emojiIndex"
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
</style>