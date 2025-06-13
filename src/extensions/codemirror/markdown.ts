import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { languages } from "@codemirror/language-data"
import { type Extension } from "@codemirror/state";

export const createMarkdownExtensions = (): Extension => {
  return markdown({
    base: markdownLanguage,
    codeLanguages: languages
  })
}
