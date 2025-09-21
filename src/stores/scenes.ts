import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import { Scene } from '../scripts/scene';

export const useSceneStore = defineStore('scene', () => {
    const _scenes = reactive<Scene[]>([]);
    const _selectedScene = ref<Scene | null>(null);
    const _lastSelectedScene = ref<Scene | null>(null);

    /**
     * Gets a scene by its uuid.
     * @param uuid The uuid of the scene.
     * @returns The scene.
     */
    function getScene(uuid: string): Scene | null {
        const scene = _scenes.find(scene => scene.uuid === uuid)
        return scene || null
    }

    function getLastSelectedScene() {
        return _lastSelectedScene
    }
    function setLastSelectedScene(scene: Scene) {
        _lastSelectedScene.value = scene
    }
    /**
     * Selects a new scene, making the currently selected scene the last selected scene.
     * @param scene The scene to select.
     */
    function selectScene(scene: Scene) {
        _selectedScene.value = scene
    }
    /**
     * Gets the currently selected scene.
     * @returns Scene.
     */
    function getSelectedScene() {
        return _selectedScene
    }

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
			uniqueId = `scene_${i}`;
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
        if (_scenes.length === 0) {
            return null
        }
        // Return the max, the index of the highest existing scene
        // console.log(_scenes[Math.max(index, _scenes.length - 1)])
        return _scenes[Math.max(index, _scenes.length - 1)]
    }

    function addScene(scene: Scene) {
        _scenes.push(scene);
    }

    function removeScene(scene: Scene) {
        const index = _scenes.indexOf(scene);
        if (index > -1) _scenes.splice(index, 1);
    }

    return { getUniqueId, getAllScenes, getLastExistingScene, addScene, removeScene, getLastSelectedScene, getSelectedScene, selectScene, setLastSelectedScene, getScene };
});