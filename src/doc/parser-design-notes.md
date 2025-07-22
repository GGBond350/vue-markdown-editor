# 解析器核心类型设计文档

本文档旨在详细解释 `mini-markdown-ast-parser` 中核心类型的设计理念与用途，特别是 `ParseFnParams` 对象。

## `ParseFnParams` 设计理念

`ParseFnParams` 被设计成一个**独立的、包含所有上下文的对象**，而不是让每个解析函数（如 `parseHeading`）接收一长串零散的参数。这遵循了**“参数对象模式” (Parameter Object Pattern)**，主要有以下优点：

1.  **封装与内聚性**: 将所有与“单行解析任务”相关的数据和状态封装在了一起，提高了代码的内聚性。
2.  **接口的稳定性与可扩展性**: 当需要为所有解析函数添加新的上下文信息时，只需修改 `ParseFnParams` 的类型定义，而无需修改每个解析函数的签名。
3.  **代码的简洁性与可读性**: 避免了过长的函数参数列表，使函数调用和定义都更加简洁。

## `ParseFnParams` 属性详解

`ParseFnParams` 里的属性可以分为三大类：**行信息**、**全局上下文**和**状态机**。

---

### 第一类：行信息 (Line Information)

这类信息描述了当前正在被处理的**这一行文本本身**。

*   **`line: string`**
    *   **作用**: 当前行的**原始、完整**的字符串内容，包含前后的空格。
    *   **用途**: 用于精确计算 `offset` 和 `column`。

*   **`trimmedLine: string`**
    *   **作用**: `line.trim()` 的结果，即移除了前后空格的行内容。
    *   **用途**: **绝大多数的解析逻辑都应该基于 `trimmedLine`**，以简化匹配逻辑。

*   **`lines: string[]`**
    *   **作用**: 整个 Markdown 文档按行分割后的**完整字符串数组**。
    *   **用途**: 用于需要“向前看”或“向后看”的场景（如解析表格）。

*   **`index: number`**
    *   **作用**: 当前行在 `lines` 数组中的索引（行号，从 0 开始）。
    *   **用途**: 用于在 `lines` 数组中定位和生成 `position` 信息。

*   **`currentOffset: number`**
    *   **作用**: 当前行**起始字符**在整个文档中的绝对偏移量。
    *   **用途**: 作为计算当前行内所有 Token 的 `position.offset` 的基准值。

---

### 第二类：全局上下文 (Global Context)

这类信息代表了整个解析过程中的**全局对象**。

*   **`root: RootTokens`**
    *   **作用**: 整个文档的**AST 根节点**。
    *   **用途**: 当一个解析函数成功解析出一个块级节点后，会将这个新节点 `push` 到 `root.children` 数组中。

*   **`resetCurrentStatus: () => void`**
    *   **作用**: 一个函数，调用它会将 `tokenizer` 中的 `currentStatus` 对象**重置为初始状态**。
    *   **用途**: 当一个独立的块级元素（如标题、代码块）结束时，必须调用此函数，以终结上一个上下文。

---

### 第三类：状态机 (State Machine)

`currentStatus` 对象是解析器的核心**状态机**，它负责在处理逐行文本时，跟踪那些需要**跨越多行**才能确定其完整形态的复杂块级元素的解析过程。

*   **`depth: number | null`**
    *   **作者意图**: 根据 `tokenizer.ts` 中的注释，此属性用于**记录或追踪 `heading` (标题) 的层级**。
    *   **实际使用**: 尽管这是作者的意图，但在 `react-markdown-editor` 的 `heading.ts` 实现中，该状态并未被实际使用。标题的解析是无状态的，其层级在单行内即可确定并直接写入最终的 AST 节点。因此，在当前实现中，这更像一个**保留字段**。

*   **`currentBlockquote: Tokens | null`**
    *   **作用**: 指向当前正在构建的 `blockquote` (引用) AST 节点。
    *   **解释**: 用于将多个连续的、以 `>` 开头的行聚合到同一个引用块节点中，实现跨行引用的解析。

*   **`inCodeBlock: boolean`**
    *   **作用**: 标记当前是否处于一个围栏代码块 (```) 的内部。
    *   **解释**: 控制解析器将所有后续行都视为纯文本代码，直到遇到结束的 ```。

*   **`codeBlockLang: string`**, **`codeBlockValue: string`**, **`codeBlockStartOffset: number`**, **`codeBlockStartLine: number`**
    *   **作用**: 当 `inCodeBlock` 为 `true` 时，分别用于暂存代码块的语言、累积的代码内容以及起始位置信息。

*   **`currentList: Tokens | null`**
    *   **作用**: 指向当前正在构建的 `list` (列表) AST 节点。
    *   **解释**: 用于将多个连续的列表项 (`listItem`) 聚合到同一个列表节点下。

*   **`currentListItem: Tokens | null`**
    *   **作用**: 指向当前正在构建的 `listItem` (列表项) AST 节点。
    *   **解释**: 用于处理单个列表项可能包含多行内容（如缩进段落）的情况。

*   **`currentIndent: number`**
    *   **作用**: 记录当前列表项的基准缩进量（即行首空格数）。
    *   **解释**: 这是判断一个新行是属于当前列表项的延续、一个新的平级列表项，还是一个嵌套列表项的关键依据。

*   **`listStack: Tokens[]`**
    *   **作用**: 一个**栈**结构，用于精确处理**嵌套列表**的层级关系。
    *   **解释**: 当进入更深一层的列表时，将外层列表节点压入栈中；退出时则弹出，以恢复到上一层的上下文。

*   **`currentTable: Tokens | null`**
    *   **作用**: 指向当前正在构建的 `table` (表格) AST 节点。
    *   **解释**: 用于将表头、分隔符和内容行关联到同一个表格节点下。

*   **`inHtmlBlock: boolean`**, **`htmlBlockTag: string | null`**, **`htmlContent: string`**
    *   **作用**: 用于处理跨行的原始 HTML 块。
    *   **解释**: 类似于代码块的状态管理，`inHtmlBlock` 标记进入/退出，`htmlBlockTag` 存储起始标签，`htmlContent` 累积内容。
