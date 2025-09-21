import { defineStore } from 'pinia';
import { reactive, readonly } from 'vue';
import { Scene } from '../scripts/scene';

export const useSceneStore = defineStore('scene', () => {
    const _scenes = reactive<Scene[]>([]);
    // const _langFiles = reactive<LangFile[]>([]);

    function getAllScenes() {
        return _scenes;
    }

    /**
     * Gets a unique scene name.
     * @param name The scene name to check.
     */
    function getUniqueId(name: string): string {
        const checkId = name
        let uniqueId = checkId
        let i = 2
        while (_scenes.find(scene => scene.id == uniqueId) && i < 200) {
			uniqueId = `${checkId}_${i}`;
			i++;
		}
        return uniqueId
    }

    /**
     * Gets the current scene if it exists, or the last scene in the array.
     * @param scene 
     */
    function getLastExistingScene(scene: Scene): Scene | null {
        const index = _scenes.indexOf(scene);
        if (index === -1 || _scenes.length === 0) {
            return null
        }
        return _scenes[Math.min(index, _scenes.length - 1)]
    }

    function addScene(scene: Scene) {
        _scenes.push(scene);
    }

    function removeScene(scene: Scene) {
        const index = _scenes.indexOf(scene);
        if (index > -1) _scenes.splice(index, 1);
    }

    return { getUniqueId, getAllScenes, getLastExistingScene, addScene, removeScene };
});