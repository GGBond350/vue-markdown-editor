import { prefix } from "@/common/contant";
import type { Tokens } from "@/types/parser/token";
import { astToHtml } from "..";

export const renderTable = (node: Tokens) => {
  return `<table class="${prefix}-table" data-line="${node.position.start.line}">${node.children?.map(astToHtml).join("")}</table>`;
};
