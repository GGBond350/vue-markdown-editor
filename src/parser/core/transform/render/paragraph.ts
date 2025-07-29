import type { Tokens } from "@/types/parser/token";
import { astToHtml } from "..";
import { prefix } from "@/common/contant";

export const renderParagraph = (node: Tokens) => {
    return `<p class="${prefix}-paragraph" data-line="${node.position.start.line}">${node.children?.map(astToHtml).join("")}</p>`;
}