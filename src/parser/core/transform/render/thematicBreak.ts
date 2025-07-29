import { prefix } from "@/common/contant";
import type { Tokens } from "@/types/parser/token";

export const renderThematicBreak = (node: Tokens) => {
    return `<hr class="${prefix}-hr" data-line="${node.position.start.line}" />`;
}