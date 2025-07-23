import type { ParseFnParams, Tokens } from "@/types/parser/token";
import { parseInlineElements } from "../inline";

export const parseHeading = ({ trimmedLine, index, currentOffset, root, resetCurrentStatus }: ParseFnParams) => {

    for (let d = 1; d <= 6; d++) {
        const headingPrefix = '#'.repeat(d) + ' ';
        if (trimmedLine.startsWith(headingPrefix)) {
            const text = trimmedLine.slice(headingPrefix.length);
            const children = parseInlineElements(text, index, currentOffset);
            const headingToken = {
                type: 'heading',
                depth: d,
                children,
                position: {
                    start: {
                        line: index + 1,
                        column: 1,
                        offset: currentOffset
                    },
                    end: {
                        line: index + 1,
                        column: d + 2 + text.length,
                        offset: currentOffset + d + 1 + text.length
                    }
                }
            } as Tokens;
            root.children.push(headingToken);
            resetCurrentStatus();
            return true; // 成功解析标题
        }
    }
}