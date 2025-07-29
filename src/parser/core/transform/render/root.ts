import type { Tokens } from "@/types/parser/token";
import { astToHtml } from "..";

export const renderRoot = (node: Tokens) => node.children!.map(astToHtml).join("");