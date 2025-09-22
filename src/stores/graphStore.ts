import { ViewportTransform, XYPosition } from "@vue-flow/core"
import { defineStore } from "pinia"
import { ref } from "vue"

export const useGraphStore = defineStore('graph', () => {
    const _nodePositions = ref<Record<string, XYPosition>>({})
    // Starts at the origin
    const viewportTransform = ref<ViewportTransform>({ x: 0, y: 0, zoom: 1})

    function getViewPosition() {
        return viewportTransform
    }
    function setViewPosition(position: ViewportTransform) {
        viewportTransform.value = position
    }

    /**
     * Stores a node's position
     * @param uuid 
     * @param position 
     */
    function setNodePosition(uuid: string, position: XYPosition) {
        _nodePositions.value[uuid] = position
    }

    /**
     * Gets a node's position, returning the origin if none was found.
     * @param uuid 
     * @returns 
     */
    function getNodePosition(uuid: string) {
        let position = _nodePositions.value[uuid]
        if (!position) {
            position = { x: 0, y: 0 }
        }
        return position
    }

    return { setNodePosition, getNodePosition, setViewPosition, getViewPosition }
})
