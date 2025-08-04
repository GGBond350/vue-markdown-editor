import { BaseToolbarType, type ToolbarType } from "@/types/editor/toolbar";

export type ToolbarTemplateValue = {
    content: string; // 模板内容
    selection: {
        start: number; // 光标起始位置
        end: number; // 光标结束位置
    }
}
export type ToolbarTemplateType = Partial<Record<ToolbarType, ToolbarTemplateValue>>;

export const toolbarTemplate: ToolbarTemplateType = {
    "heading-1": {
        content: "# ",
        selection: {
            start: 2,
            end: 2
        }
    },

    "heading-2": {
        content: "## ",
        selection: {
            start: 3,
            end: 3
        }
    },
    "heading-3": {
        content: "### ",
        selection: {
            start: 4,
            end: 4
        }
    },
    "heading-4": {
        content: "#### ",
        selection: {
            start: 5,
            end: 5
        }
    },
    "heading-5": {
        content: "##### ",
        selection: {
            start: 6,
            end: 6
        }
    },
    "heading-6": {
        content: "###### ",
        selection: {
            start: 7,
            end: 7
        }
    },
    "bold": {
        content: "****",
        selection: {
            start: 2,
            end: 2
        }
    },
    italic: {
        content: `__`,
        selection: {
            start: 1,
            end: 1,
        },
    },
    underline: {
        content: `----`,
        selection: {
            start: 2,
            end: 2,
        },
    },
    delete: {
        content: `~~~~`,
        selection: {
            start: 2,
            end: 2,
        },
    },
  blockquote: {
    content: `> `,
    selection: {
      start: 2,
      end: 2,
    },
  },
  ul: {
    content: `- `,
    selection: {
      start: 2,
      end: 2,
    },
  },
  ol: {
    content: `1. `,
    selection: {
      start: 3,
      end: 3,
    },
  },
  "inline-code": {
    content: "``",
    selection: {
      start: 1,
      end: 1,
    },
  },
  code: {
    content: "```\n\n```",
    selection: {
      start: 3,
      end: 3,
    },
  },
  "image-link": {
    content: `![](URL)`,
    selection: {
      start: 4,
      end: 7,
    },
  },
  link: {
    content: `[]()`,
    selection: {
      start: 1,
      end: 1,
    },
  },
  table: {
    content: `|  表头  |  表头  |\n| -----  | -----  |\n| 单元格 | 单元格 |`,
    selection: {
      start: 3,
      end: 5,
    },
  },
}

export const getToolbarTemplate = (type: ToolbarType, payload?: any): ToolbarTemplateValue => {
    if (type ===   BaseToolbarType.IMAGE_LINK) {
			 if (typeof payload === 'object' && payload.url) {
        return {
					content: `![${payload.alt || ''}](${payload.url})`,
					selection: {
						start: 4,
						end: 7,
					}
				}
      }
			return {
				content: `![alt](URL)`,
				selection: {
					start: 4,
					end: 7,
				},
			};
		} else{
			return toolbarTemplate[type] as ToolbarTemplateValue;
		}
}
