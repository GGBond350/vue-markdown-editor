/**
 * 将 File 对象转换为 Base64 字符串
 * @param file - 用户选择的图片文件
 * @returns - 返回一个包含 Base64 URL 和文件名的 Promise
 */

import { insertContentEvent } from "@/config/toolbar/event";
import { useEditorStore } from "@/store/useEditorStore";
import { BaseToolbarType } from "@/types/editor/toolbar";

// todo 图片持久存储
const fileToBase64 = async (file: File): Promise<{ url: string; alt: string, id: string }> => {
	const compressedBase64 = await compressImage(file);
  const imageId = generateImageId();
  return  {
    url: compressedBase64,
    alt: `${file.name}`,
    id: imageId
  }
}

// 添加图片压缩函数
const compressImage = (file: File, maxWidth = 800, quality = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // 计算压缩后的尺寸
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // 绘制压缩后的图片
      ctx.drawImage(img, 0, 0, width, height);
      
      // 转换为 Base64
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * 生成唯一的图片ID
 */
const generateImageId = () => {
  return `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};


/**
 * 处理图片上传的函数
 * 触发文件选择，读取文件，并将其插入编辑器
 */

export const handleImageUpload = () => {
	const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true; // 允许选择多个文件

  input.onchange = async (event) => {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;
    const editorStore = useEditorStore();
    for (const file of Array.from(files)) {
      try {
        const { url, alt, id } = await fileToBase64(file);
        editorStore.addImage(id, url);
        // 复用或创建一个新的事件来插入图片
				insertContentEvent(BaseToolbarType.IMAGE_LINK, { url: `📷 ${id}`, alt });
        editorStore.clearUnusedImages(editorStore.content);
      } catch (error) {
        console.error('图片上传失败:', error);
        // 可以在此处添加用户提示
      }
    }
  };

  input.click();
}
