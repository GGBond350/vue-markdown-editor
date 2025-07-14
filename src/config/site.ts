import type { SitebarItem } from "@/types/site";
import GithubIcon from "@/assets/images/github-fill.svg?component";
import GiteeIcon from "@/assets/images/gitee.svg?component";

export const defaultSiteConfig: SitebarItem[] = [

    {
        name: "GitHub",
        description: "GitHub is a code hosting platform for version control and collaboration.",
        component: GithubIcon,
        url: "https://github.com/GGBond350/vue-markdown-editor"
    },
    {
        name: "Gitee",
        description: "Gitee is a Chinese code hosting platform.",
        component: GiteeIcon,
        url: "https://gitee.com/"
    }
]
