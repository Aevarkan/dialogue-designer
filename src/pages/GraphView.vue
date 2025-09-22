<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Edge, useVueFlow, VueFlow } from '@vue-flow/core';
import { MessageSquareText } from 'lucide-vue-next';
import { CLOSE_COMMAND_PREFIX, OPEN_COMMAND_PREFIX, useSceneStore } from '../stores/scenes';
import CommandNode, { EditEvent } from '../components/vueFlow/CommandNode.vue';
import SceneNode from '../components/vueFlow/SceneNode.vue';

const sceneStore = useSceneStore();
const graphStore = useGraphStore();

// Node stuff is here, then edges are below them
const nodes = computed(() => {
    // SCENE NODES
    const sceneNodes = sceneStore.getAllScenes().map((scene, index) => ({
        id: scene.uuid,
        type: 'scene',
        data: {
            label: scene.id,
        },
        class: sceneStore.getSelectedScene().value?.uuid === scene.uuid ? 'selected' : '',
        // position: { x: 100 * index, y: 100 * index },
        position: graphStore.getNodePosition(scene.uuid)
    }))

    // COMMAND NODES
    // Their labels are the commands themselves
    const buttonNodes = sceneStore.getAllScenes().flatMap(scene =>
        scene.buttons.map(button => ({
            id: button.uuid,
            type: 'command',
            data: {
                label: button.commands,
                parentSceneUuid: scene.uuid
            },
            position: graphStore.getNodePosition(button.uuid)
        }))
    )

    const sceneOpenCloseCommands = sceneStore.getAllScenes().flatMap(scene => [
        {
            id: `${CLOSE_COMMAND_PREFIX}-${scene.uuid}`,
            type: 'command',
            data: {
                label: scene.on_close_commands,
                parentSceneUuid: scene.uuid
            },
            position: graphStore.getNodePosition(`${CLOSE_COMMAND_PREFIX}-${scene.uuid}`)
        },
        {
            id: `${OPEN_COMMAND_PREFIX}-${scene.uuid}`,
            type: 'command',
            data: {
                label: scene.on_open_commands,
                parentSceneUuid: scene.uuid
            },
            position: graphStore.getNodePosition(`${OPEN_COMMAND_PREFIX}-${scene.uuid}`)
        }
    ])

    return [...sceneNodes, ...buttonNodes, ...sceneOpenCloseCommands]
});

const edges = computed(() => {
    const edgeArray: Edge[] = []
    sceneStore.getAllScenes().forEach(scene => {
        // Open/close commands are always there
        // I'm sure there's a cleaner way of doing this but I'm too tired
        edgeArray.push({ // onOpen command
            id: `e-onOpen-${scene.uuid}`,
            // onOpen has source and target flipped
            target: scene.uuid,
            source: `${OPEN_COMMAND_PREFIX}-${scene.uuid}`,
            animated: true
            // type: 'smoothstep'
        })
        edgeArray.push({ // onClose command
            id: `e-onClose-${scene.uuid}`,
            source: scene.uuid,
            target: `${CLOSE_COMMAND_PREFIX}-${scene.uuid}`,
            animated: true
            // type: 'smoothstep'
        })

        // and now the buttons
        // navigation buttons are going to be a PAIN
        scene.buttons.forEach(button => {
            edgeArray.push({
                id: `e-${scene.uuid}-${button.uuid}`,
                source: scene.uuid,
                target: button.uuid
            })
        })
        // TODO: Conditional button rendering IF it's a navigation button
    })
    return [...edgeArray]
})

// EVENT HANDLING, INCLUDING NODE STUFF
const { onNodeClick, onEdgeClick, onNodeDragStop, onViewportChangeEnd, setViewport } = useVueFlow();

// Node click event handler
onNodeClick(({ event, node }) => {
    const selectedScene = sceneStore.getScene(node.id)
    if (selectedScene) {
        sceneStore.selectScene(selectedScene)
        console.log("Selected", selectedScene)
    }
});
// have to check if a node is selected separately now
const isSceneSelected = (id: string) => {
    const selected = sceneStore.getSelectedScene()
    return selected?.value?.uuid === id
}


// Handle when the command node text is edited
// This'll store that edit in the global store
function handleEdit(payload: EditEvent) {
    const { command, id, parentSceneUuid } = payload

    sceneStore.setCommand(parentSceneUuid, id, command)
}

// Store locations in pinia
// Node locations
onNodeDragStop(({node}) => {
    const id = node.id
    const position = node.position
    graphStore.setNodePosition(id, position)
})
// Viewport (the graph view itself)
onViewportChangeEnd((newPosition) => {
    graphStore.setViewPosition(newPosition)
})
// Get the old position
onMounted(() => {
    setViewport(graphStore.getViewPosition().value)
})

</script>

<template>
    <div id="graph-wrapper">
        <!-- HEADER -->
        <header>
            <h1>DialogueDesigner</h1>
            <!-- <div class="tool" @click="importFile()">
                <FolderOpen :size="22" />
                Import
            </div> -->
            <div class="tool" @click="openEditorView()">
                <MessageSquareText :size="22"/>
                Editor View
            </div>
            <!-- <div class="tool" @click="newFile()">
                <FilePlus :size="22" />
                New File
            </div>
            <div class="tool export_button" @click="openExportDialog()">
                <Save :size="22" />
                Export
            </div> -->
        </header>

        <!-- GRAPH VIEW -->
        <main id="flow-wrapper">
            <VueFlow
                :nodes="nodes"
                :edges="edges"
                :elements-selectable="false"
            >
                <!-- we define the command node type here -->
                <template #node-command="props">
                    <CommandNode v-bind="props" @edit="handleEdit" />
                </template>

                <!-- and now the scene node -->
                <template #node-scene="props">
                    <SceneNode
                        v-bind="props"
                        :selected="isSceneSelected(props.id)"
                    />
                </template>

                <Background />
            </VueFlow>
        </main>

        <!-- SCENE EDITOR SIDEBAR -->
        <div id="gv-scene-editor">
			<div v-if="simulate_closing" id="closed_dialogue_screen">
				<span>The dialogue has been closed</span>
				<button @click="reopenLastScene()">Reopen</button>
			</div>
			<SceneEditor v-else-if="selectedScene" ref="scene_editor" :scene="selectedScene" @simulate_closing="simulateClosing()"></SceneEditor>
			<div v-else id="closed_dialogue_screen">
				<span>Create or select a scene from the sidebar</span>
			</div>
        </div>
    </div>
    
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAppStateStore } from '../stores/appState';
import SceneEditor from '../components/SceneEditor.vue';
import { Background } from '@vue-flow/background';
import { useGraphStore } from '../stores/graphStore';

const EDITOR_PAGE_ID = "editor"

export default defineComponent({
    name: "GraphView",
    computed: {
        sceneStore() {
            return useSceneStore()
        },
        selectedScene() {
            return useSceneStore().getSelectedScene().value
        },
        stateStore() {
            return useAppStateStore()
        },
        simulate_closing() {
            return this.stateStore.simulateClosing
        }
    },
    methods: {
        openEditorView() {
            this.stateStore.currentPage = EDITOR_PAGE_ID
        },
        simulateClosing() {
			this.stateStore.simulateClosing = true
            // Annoying conditional check that *really* makes sure the scene isn't null
            const currentSceneRef = this.sceneStore.getSelectedScene()
            if (currentSceneRef?.value) {
                const currentScene = currentSceneRef.value
                this.sceneStore.setLastSelectedScene(currentScene)
            }
			setTimeout(() => {
				this.stateStore.simulateClosing = false;
			}, 460);
		},
        // This is ONLY used for the scene editor preview
        reopenLastScene() {
            const lastSelectedScene = this.sceneStore.getLastSelectedScene()?.value
			if (lastSelectedScene) {
                this.stateStore.simulateClosing = false;
				this.sceneStore.selectScene(lastSelectedScene);
			}
		},
    }
})
</script>

<style scoped>
/* HEADER STUFF */
h1 {
	font-size: 22px;
	padding: 0 18px;
	color: var(--color-subtle);
	overflow: hidden;
	flex-shrink: 1;
}

header .tool {
	min-width: 90px;
}
.tool.export_button {
	background-color: var(--color-accent);
	color: black;
	margin-left: auto;
	padding: 0 16px;
	height: 100%;
}
.tool.export_button:hover {
	background-color: var(--color-accent-hover);
}
.tool {
	display: flex;
	align-items: center;
	padding: 2px;
	gap: 5px;
}
ul .tool {
	display: inline-flex;
	width: 40px;
	justify-content: center;
}

/* MAIN WINDOW */
#graph-wrapper {
	height: 100%;
	display: grid;
	grid-template-rows: 40px auto;
    grid-template-columns: 5fr 4fr;
	grid-template-areas: 
		"header header"
		"graph editor";
}
#graph-wrapper > header {
    grid-area: header;
    border-bottom: 1px solid var(--color-border);
	display: flex;
	align-items: center;
	gap: 12px;
}
#graph-wrapper > #flow-wrapper {
    grid-area: graph;
    border-right: 1px solid var(--color-border);
    height: calc(100vh - 40px);
	/* display: flex; */
}

/* THE EDITOR (RIGHT SIDE) */
/* We change the spacing around a bit */
#graph-wrapper > #gv-scene-editor {
    grid-area: editor;
    display: grid;
    grid-template-rows: 5fr 4fr;
    grid-template-areas: 
		"top"
		"bottom";
}
:deep(#scene_editor) {
    grid-area: top;
}
:deep(#properties) {
    grid-area: bottom;
}

/* Styling for when the dialogue 'closes' during previews */
#closed_dialogue_screen {
	text-align: center;
	margin-top: calc(40vh - 50px);
	color: var(--color-subtle);
}
#closed_dialogue_screen button {
	display: block;
	margin: auto;
	margin-top: 12px;
}
</style>

<!-- Vueflow styles need to be global, I don't think there'll be more than one graph view -->
<style>
/* import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';

/* import the default theme, this is optional but generally recommended */
@import '@vue-flow/core/dist/theme-default.css';

.vue-flow__node.selected {
    background:#56916c;
    /* box-shadow:0 0 0 2px #2563eb; */
}

.vue-flow__node:active {
    background:#2980b9;
    /* box-shadow:0 0 0 2px #2563eb; */
}

</style>