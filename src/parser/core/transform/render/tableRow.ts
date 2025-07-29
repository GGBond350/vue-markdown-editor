import { prefix } from "@/common/contant";
import type { Tokens } from "@/types/parser/token";
import { astToHtml } from "..";

export const renderTableRow = (node: Tokens) => {
  return `<tr class="${prefix}-tr">${node.children?.map(astToHtml).join("")}</tr>`;
};
