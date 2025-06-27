

import type { Extension } from '@codemirror/state';
import { ViewPlugin } from '@codemirror/view';
import type { EditorView } from 'codemirror';
import { nanoid } from 'nanoid';

// 上传成功后的回调函数
export type UploadCallback = (param: { url: string, alt?: string }) => void;


export type EventExtensionOptions = {
    scrollWrapper: string;
    // 拖拽上传处理函数
  // 它接收文件和成功回调，由调用者实现具体的上传逻辑
  onDragUpload?: (file: File, callback: UploadCallback) => void;
  // 粘贴上传处理函数
  onPasteUpload?: (file: File, callback: UploadCallback) => void;
  // 其他自定义事件扩展
  eventExt?: any; 
}


class ImageHandler {
    private currentObjectURL: string | null = null;

    handleImageFile(file: File, view: EditorView, uploadCallback?: (file: File, callback: UploadCallback) => void) {
        
        if (this.currentObjectURL) {
            URL.revokeObjectURL(this.currentObjectURL); // 释放之前的对象URL
        }

        const tempUrl = URL.createObjectURL(file);
        this.currentObjectURL = tempUrl;

        const ImageAlt = nanoid(8); // 生成一个唯一的alt文本

        const selection = view.state.selection.main;

        const content = `![${ImageAlt}](${tempUrl})\n`;
        const start = selection.from;

        view.dispatch({
            changes: {
                from: selection.from,
                to: selection.to,
                insert: content
            },
            selection: {
                anchor: start + content.length,
            }
        });


        const handleUploadSuccess: UploadCallback = ({ url, alt }) => {
            try {
                const finalMarkdown  = `![${alt || ImageAlt}](${url})\n`;
                const doc = view.state.doc;
                const textAtInsertPosition = doc.sliceString(start, start + content.length);


                /**
                 * 这个验证确保只有当临时图片内容保持原样时，才进行替换，
                 * 是一种防止意外破坏用户内容的保护机制。
                 */
                if (textAtInsertPosition === content) {
                    view.dispatch({
                        changes: {
                            from: start,
                            to: start + content.length,
                            insert: finalMarkdown
                        },
                    });
                } 
                URL.revokeObjectURL(tempUrl); // 释放对象URL
                this.currentObjectURL = null; // 清除当前对象URL
            } catch (error) {
                console.error("替换图片URL失败:", error);
            }
        }
        
        if (uploadCallback) {
            uploadCallback(file, handleUploadSuccess);
        }
    }
    destroy() {
        if (this.currentObjectURL) {
            URL.revokeObjectURL(this.currentObjectURL); // 释放对象URL
        }
    }
}


const createDropImageExtenion = (onDragUpload?: EventExtensionOptions['onDragUpload']) => {
    return ViewPlugin.fromClass(
        class {
            private handler: ImageHandler;
            private onDropOver: (e: DragEvent) => void;
            private onDrop: (e: DragEvent) => void;
            private view: EditorView;
            constructor(view: EditorView) {
                this.view = view;
                this.handler = new ImageHandler();
                this.onDropOver = (e: DragEvent) =>  e.preventDefault();

                this.onDrop = (e: DragEvent) => {
                    e.preventDefault();
                    const file = e.dataTransfer?.files[0];
                    if (file && file.type.startsWith("image/")) {
                        this.handler.handleImageFile(file, view, onDragUpload);
                    }
                };

                this.view.dom.addEventListener('dragover', this.onDropOver);
                this.view.dom.addEventListener('drop', this.onDrop);
            }
            dstroy() {
                this.view.dom.removeEventListener('dragover', this.onDropOver);
                this.view.dom.removeEventListener('drop', this.onDrop);
                this.handler.destroy();
            }
        }
    )
} 

const createPasteImageExtension = (onPasteUpload?: EventExtensionOptions['onPasteUpload']) => {
    return ViewPlugin.fromClass(
        class {
            private handler: ImageHandler;
            private view: EditorView;
            private onPaste: (e: ClipboardEvent) => void;

            constructor(view: EditorView) {
                this.view = view;
                this.handler = new ImageHandler();
                this.onPaste = (e: ClipboardEvent) => {
                    const items = e.clipboardData?.items;
                    if (!items) return;

                    for (const item of items) {
                        if (item.kind === 'file' && item.type.startsWith('image/')) {
                            e.preventDefault(); // 阻止默认粘贴行为
                            const file = item.getAsFile();
                            if (file) {
                                this.handler.handleImageFile(file, view, onPasteUpload);
                                break; // 只处理第一个图片文件
                            }
                        }
                    }
                };

                this.view.dom.addEventListener('paste', this.onPaste);
            }

            destroy() {
                this.view.dom.removeEventListener('paste', this.onPaste);
                this.handler.destroy();
            }
        }
    )
}

export function createEventExtensions(options: EventExtensionOptions): Extension[] {
    if (options.scrollWrapper !== 'editor') {
        return [];
    }
    return [
        options.eventExt,
        createDropImageExtenion(options.onDragUpload),
        createPasteImageExtension(options.onPasteUpload)
    ].filter(Boolean) as Extension[];
}