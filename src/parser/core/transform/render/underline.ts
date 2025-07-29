import type { Tokens } from "@/types/parser/token";
import { astToHtml } from "..";

export const renderUnderline = (node: Tokens) => {
    return `<u>${node.children?.map(astToHtml).join("")}</u>`
}