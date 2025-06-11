
import { ref, watch } from 'vue';


const STORAGE_KEY = 'vue-markdown-editor-content';

// 定义编辑器内容的选项类型
interface EditorContentOptions {
  defaultContent?: string; // 默认内容
  isPersistent?: boolean; // 是否持久化内容到本地存储
  storageKey?: string; // 本地存储的键名
}

export function useEditorContent(options: EditorContentOptions = {}) {

    const {
        defaultContent = '',
        isPersistent = true,
        storageKey = STORAGE_KEY
    } = options;

    // 从本地存储获取初始内容
    const getInitialContent = (): string => {
        if (!isPersistent) {
            return defaultContent;
        }
        return localStorage.getItem(storageKey) || defaultContent;
    };
    // 创建响应式引用来存储编辑器内容
    const content = ref<string>(getInitialContent());

    // 更新内容
    const updateContent = (newContent: string) => {
        content.value = newContent; 
        setStoredContent(newContent);
    }

    // 获取本地存储的内容
    const getStoredContent = () => {
        return localStorage.getItem(storageKey) || '';
    }

    // 设置本地存储的内容
    const setStoredContent = (newContent: string) => {
        if (isPersistent) {
            localStorage.setItem(storageKey, newContent);
        }
    }

    // 清除本地存储的内容
    const clearStoredContent = () => {
        localStorage.removeItem(storageKey);
        content.value = defaultContent; // 清除后重置内容
    }

    watch(content, (newContent) => {
        setStoredContent(newContent);
    })

    return {
        content,
        updateContent,
        getStoredContent,
        setStoredContent,
        clearStoredContent
    }
}
