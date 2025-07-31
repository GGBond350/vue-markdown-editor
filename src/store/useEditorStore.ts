import { EditorView } from "codemirror";
import { defineStore } from "pinia";
import { ref, shallowRef} from "vue";

const STORAGE_KEY = 'vue-markdown-editor-content';
const SYNC_SCROLL_STATUS_KEY = 'sync_scroll_status';

export const useEditorStore = defineStore('editor', () => {
	const content = ref<string>(localStorage.getItem(STORAGE_KEY) || '');

	const editorView = ref<EditorView | null>(null);
	const editorContainer = shallowRef<HTMLElement | null>(null);

	const previewView = ref<HTMLElement | null>(null);

	const currentScrollContainer = shallowRef<'editor' | 'preview' | null>(null);

	const imageMap = new Map<string, string>();

	const addImage = (id: string, base64: string) => {
		imageMap.set(id, base64);
	}

	const getImage = (id: string): string | undefined => {
		return imageMap.get(id);
	}

	const removeImage = (id: string) => {
		if (imageMap.has(id)) {
			imageMap.delete(id);
		}
	}

	const clearUnusedImages = (content: string) => {
		const usedImageIds = new Set<string>();
		const regex = /📷 ([^)]+)/g;
		let match;
		while ((match = regex.exec(content)) !== null) { 
			usedImageIds.add(match[1]);
		}
		// 删除未使用的图片
		for (const [id] of imageMap) {
			if (!usedImageIds.has(id)) {
				imageMap.delete(id);
			}
		}
	}

	// 跟图片清理相关
	let debounceCleanupTimer: number | null = null;
	let periodicCleanupTimer: number | null = null;

	const debounceCleanup = (content: string) => {
		if (debounceCleanupTimer) clearTimeout(debounceCleanupTimer);
		debounceCleanupTimer = setTimeout(() => {
			clearUnusedImages(content);
		}, 3000);
	}

	const startPeriodicCleanup = () => {
		if (periodicCleanupTimer) clearInterval(periodicCleanupTimer);
		periodicCleanupTimer = setInterval(() => {
			clearUnusedImages(content.value);
		}, 10 * 60 * 1000); // 每10分钟清理一次
	}

	// 停止定期清理
	const stopPeriodicCleanup = () => {
		if (periodicCleanupTimer) {
			clearInterval(periodicCleanupTimer);
			periodicCleanupTimer = null;
		}
		if (debounceCleanupTimer) {
			clearTimeout(debounceCleanupTimer);
			debounceCleanupTimer = null;
		}
	};

	const isSyncScroll = ref<boolean>(
		(() => {
			const savedStatus = localStorage.getItem(SYNC_SCROLL_STATUS_KEY);
			return savedStatus !== null ? savedStatus === 'true' : true;
		})()
	);

	const charCount = ref<number>(0);
	const lineCount = ref<number>(0);
	const cursorRow = ref<number>(0);
	const cursorCol = ref<number>(0);

	const setContent = (newContent: string, isPersistent: boolean = true) => {
		content.value = newContent;
		if (isPersistent) {
			localStorage.setItem(STORAGE_KEY, newContent);
		}
	}
	const setEditorView = (view: EditorView | null) => {
		editorView.value = view;
	}

	const setPreviewView = (view: HTMLElement | null) => {
		previewView.value = view;
	}

	const setCurrentScrollContainer = (container: 'editor' | 'preview' | null) => {
    	currentScrollContainer.value = container;
  	}
	const toggleSyncScroll = () => {
		isSyncScroll.value = !isSyncScroll.value;
		localStorage.setItem(SYNC_SCROLL_STATUS_KEY, String(isSyncScroll.value));
	}

	// 更新统计信息
	const updateStats = (stats: {
		charCount: number;
		lineCount: number;
		cursorRow: number;
		cursorCol: number;
	}) => {
		charCount.value = stats.charCount;
		lineCount.value = stats.lineCount;
		cursorRow.value = stats.cursorRow;
		cursorCol.value = stats.cursorCol;
	}

	return {
		content,
		editorView,
		previewView,
		charCount,
		lineCount,
		cursorRow,
		cursorCol,
		editorContainer,
		currentScrollContainer,
		isSyncScroll,
		setContent,
		setEditorView,
		setPreviewView,
		updateStats,
		setCurrentScrollContainer,
		toggleSyncScroll,
		addImage,
		getImage,
		removeImage,
		clearUnusedImages,
		debounceCleanup,
		startPeriodicCleanup,
		stopPeriodicCleanup
	}
})