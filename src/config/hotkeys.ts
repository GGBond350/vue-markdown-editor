import { keymap } from "@codemirror/view";


export class Hotkey {
    static readonly HEADINGS = {
        FIRST: new Hotkey("mod+1", "Heading-1"),
        SECOND: new Hotkey("mod+2", "Heading-2"),
        THIRD: new Hotkey("mod+3", "Heading-3"),
        FOURTH: new Hotkey("mod+4", "Heading-4"),
        FIFTH: new Hotkey("mod+5", "Heading-5"),
        SIXTH: new Hotkey("mod+6", "Heading-6"),
    } as const;

    static readonly BOLD = new Hotkey("mod+b", "Bold"); // **Bold**
    static readonly ITALIC = new Hotkey("mod+i", "Italic"); // *Italic*
    static readonly UNDERLINE = new Hotkey("mod+u", "Underline"); // --Underline--
    static readonly DELETE = new Hotkey("mod+shift+x", "Delete"); // ~~Delete~~
    static readonly BLOCKQUOTE = new Hotkey("mod+shift+9", "Blockquote"); // > Blockquote
    static readonly UNORDERED_LIST = new Hotkey("mod+shift+8", "ul"); // - Unordered List
    static readonly ORDERED_LIST = new Hotkey("mod+shift+7", "ol"); // 1. Ordered List
    static readonly INLINE_CODE = new Hotkey("mod+`", "InlineCode"); // `Inline Code`
    static readonly CODE_BLOCK = new Hotkey("mod+shift+c", "Code"); // ```Code Block```
    static readonly LINK = new Hotkey("mod+k", "Link"); // [Link](url)
    static readonly TABLE = new Hotkey("mod+shift+t", "Table"); // | Table |
    //! 为避免冲突，此处使用cm的history插件，不手动实现undo和redo功能
    static readonly UNDO = new Hotkey("mod+z", "undo"); // undo
    static readonly REDO = new Hotkey("mod+shift+z", "redo"); // redo
    static readonly FULL_SCREEN = new Hotkey("mod+alt+f", "fullscreen"); // fullscreen

    // Actions
    static readonly SAVE = new Hotkey("mod+s", "Save");

    constructor(
        public readonly command: string,
        public readonly description: string,
        public readonly handler?: () => void
    ) {
        Hotkey.validateCommand(command);
    }

    public static readonly isMac = (() => {
        if ("userAgentData" in navigator) {
            return (navigator as any).userAgentData?.platform === "macOS";
        }
        return /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
    })();

    private static readonly keyMap: Record<string, string> = {
        mod: Hotkey.isMac ? "⌘" : "Ctrl",
        shift: "⇧",
        alt: Hotkey.isMac ? "⌥" : "Alt",
        ctrl: Hotkey.isMac ? "⌃" : "Ctrl",
    } as const;


    public get formatCommand() : string {
        return this.command.split("+").map(
            key => Hotkey.keyMap[key as keyof typeof Hotkey.keyMap] || 
            key[0].toUpperCase() + key.slice(1).toLowerCase()
        ).join(" + ");
    }
    // 调整为 CodeMirror 支持的快捷键形式
    public get codeMirrorCommand(): string {
        return this.command
        .split("+")
        .map((key) => {
            if (key === "mod") return "Mod";
            if (key === "shift") return "Shift";
            if (key === "alt") return "Alt";
            if (key === "ctrl") return "Ctrl";
            return key.charAt(0).toLowerCase() + key.slice(1);
        })
        .join("-");
    }

    // 添加修饰键验证机制
  //! 如果后续添加单键支持要修改这里，否则不生效
    private static validateCommand(command: string) {
        const validModifiers = ["mod", "shift", "alt", "ctrl"];
        const parts = command.split("+");

        if (!parts.some((part) => validModifiers.includes(part))) {
        throw new Error(`This is must!: ${command}`);
        }
    }

    public toConfig(){
        return {
            command: this.codeMirrorCommand,
            description: this.description,
            handler: this.handler
        }
    }
    
}