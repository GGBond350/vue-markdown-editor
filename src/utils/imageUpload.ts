/**
 * 将 File 对象转换为 Base64 字符串
 * @param file - 用户选择的图片文件
 * @returns - 返回一个包含 Base64 URL 和文件名的 Promise
 */

import { insertContentEvent } from "@/config/toolbar/event";
import { BaseToolbarType } from "@/types/editor/toolbar";

const fileToBase64 = (file: File): Promise<{ url: string; alt: string }> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const base64Url = reader.result as string;
			const altText = file.name;
			resolve({ url: base64Url, alt: altText });
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	})
}

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

    for (const file of Array.from(files)) {
      try {
        const { url, alt } = await fileToBase64(file);
        // 复用或创建一个新的事件来插入图片
				insertContentEvent(BaseToolbarType.IMAGE_LINK, { url, alt });
      } catch (error) {
        console.error('图片上传失败:', error);
        // 可以在此处添加用户提示
      }
    }
  };

  input.click();
}
