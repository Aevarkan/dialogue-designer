import { defineStore } from 'pinia';
import { Project } from '../scripts/project';

export const useAppStateStore = defineStore('appState', {
    state: () => ({
        currentPage: "start",
        mainTab: "scene",
        mobilePage: 'sidebar',
        saved: false,
        simulateClosing: false,
        project: Project,
        renamingScene: false,
    }),
});
