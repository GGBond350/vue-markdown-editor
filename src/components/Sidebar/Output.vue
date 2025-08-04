<template>
  <div class="output-sidebar">
    <a-form layout="vertical">
      <a-form-item class="form-item" label="文件类型">
        <a-select v-model:value="fileType"  style="width: 100%;">
          <a-select-option value="PDF">PDF</a-select-option>
          <a-select-option value="HTML">HTML</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item class="form-item" label="导出文件名">
        <a-input v-model:value="fileName" placeholder="请填入文件名" />
      </a-form-item>
      <a-button type="primary" :disabled="loading" style="width: 100%;" @click="handleExport">
        {{ loading ? '导出中...' : '导出' }}
      </a-button>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useEditorStore } from '@/store/useEditorStore';
import { exportHTML } from '@/utils/exportHTML';
import { exportPdf } from '@/utils/exportPDF';
import { message } from 'ant-design-vue';
const editorStore = useEditorStore();
const { previewView } = editorStore;
const fileType = ref<'PDF' | 'HTML'>('PDF');
const fileName = ref('markdown');
const loading = ref(false);

const handleExport = async () => {
  if (!previewView) {
    alert('预览视图未找到');
    return;
  }
  loading.value = true;
  try {
    if (fileType.value === 'PDF') {
      await exportPdf(previewView, fileName.value);
    } else {
      await exportHTML(previewView, fileName.value);
    }
    message.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    message.error('导出失败，请重试');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.output-sidebar {
  padding: 16px;
}
</style>
