import type { Component } from "vue";
export enum SiteType {
    GITHUB = 'github',
    GITEE = 'gitee'
}

export type SitebarItem = {
    name: string;
    description: string;
    component?: Component;
    url: string;
}