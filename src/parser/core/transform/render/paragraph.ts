import type { Tokens } from "@/types/parser/token";
import { astToHtml } from "..";

export const renderParagraph = (node: Tokens) => {
    return `<p data-line="${node.position.start.line}">${node.children?.map(astToHtml).join("")}</p>`;
}