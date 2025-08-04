import { createApp, nextTick, type Ref } from 'vue';
import CopyCodeButton from '@/components/Preview/CopyCodeButton.vue';

export function useCopyCode(previewContainer: Ref<HTMLElement | null>, contentSignal: Ref<string>) {
  // 存储已创建的 Vue 应用实例，用于清理
  const appInstances = new Set<any>();

  const getCodeContent = (header: Element): string => {
    const codeElement = header.closest('.mini-vue-md-code-container')?.querySelector('code');
    return codeElement?.textContent || '';
  };

  const clearCopyButtons = () => {
    // 清理所有 Vue 应用实例
    appInstances.forEach(app => {
      try {
        app.unmount();
      } catch (error) {
        console.error('清理复制按钮失败:', error);
      }
    });
    appInstances.clear();

    // 移除所有复制按钮 DOM
    previewContainer.value?.querySelectorAll('.copy-code-button-wrapper')
      .forEach(button => button.remove());
  };

  const addCopyButtons = () => {
    if (!previewContainer.value) return;

    // 先清理旧按钮
    clearCopyButtons();

    // 查找所有代码块的 header
    const codeHeaders = previewContainer.value.querySelectorAll('.mini-vue-md-code-right');
    
    codeHeaders.forEach((header) => {
      try {
        // 避免重复添加
        if (header.querySelector('.copy-code-button-wrapper')) return;
        
        const codeContent = getCodeContent(header);
        if (!codeContent) return;

        // 创建容器
        const buttonContainer = document.createElement('span');
        buttonContainer.className = 'copy-code-button-wrapper';

        // 创建 Vue 应用实例
        const app = createApp(CopyCodeButton, { 
          content: codeContent 
        });
        
        // 挂载到容器
        app.mount(buttonContainer);
        
        // 添加到 header
        header.appendChild(buttonContainer);
        
        // 保存应用实例用于清理
        appInstances.add(app);
      } catch (error) {
        console.error('添加复制按钮失败:', error);
      }
    });
  };

  return {
    addCopyButtons,
    clearCopyButtons
  };
}
