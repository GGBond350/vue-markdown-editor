import { prefix } from "@/common/contant";
import type { Tokens } from "@/types/parser/token";
import { useEditorStore } from "@/store/useEditorStore";
export const renderImage = (node: Tokens) => {
	const { url, alt} = node;
	if (url?.startsWith('📷 ')) {
		const imageId = url.replace('📷 ', ''); // 去掉前缀 "📷 " 
		const { getImage } = useEditorStore();
		const base64Image = getImage(imageId);

		if (base64Image) {
			return `<img src="${base64Image}" alt="${alt || ''}" class="${prefix}-image" title="${node.title || ''}"/>`;
		}
	}
	
	return `<img src=${node.url} alt="${node.alt || ''}" class="${prefix}-image" title="${node.title || ''}"/>`;
}