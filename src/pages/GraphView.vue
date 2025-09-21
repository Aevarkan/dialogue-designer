<script setup lang="ts">
import { computed } from 'vue'
import { useVueFlow, VueFlow } from '@vue-flow/core';
import { MessageSquareText } from 'lucide-vue-next';
import { useSceneStore } from '../stores/scenes';

const sceneStore = useSceneStore();

// these are our nodes
const nodes = computed(() => 
    sceneStore.getAllScenes().map((scene, index) => ({
        id: scene.uuid,
        type: 'default',
        data: { label: scene.id },
        position: { x: 100 * index, y: 100 * index },
    }))
);

// const edges = computed(() => {
//   const edgeArray = [];
//   sceneStore.getAllScenes().forEach((scene) => {
//     scene.commands.forEach((cmd, i) => {
//       if (cmd.navigationTargetId) {
//         edgeArray.push({
//           id: `e-${scene.id}-cmd-${i}-${cmd.navigationTargetId}`,
//           source: `${scene.id}-cmd-${i}`,
//           target: cmd.navigationTargetId,
//           type: 'smoothstep',
//         });
//       }
//     });
//   });
//   return e;
// });

const { onNodeClick, onEdgeClick } = useVueFlow();

// Node click event handler
onNodeClick(({ event, node }) => {
    const selectedScene = sceneStore.getScene(node.id)
    if (selectedScene) {
        sceneStore.selectScene(selectedScene)
    }
});

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
            <VueFlow :nodes="nodes" :edges="edges" @node-click="handleNodeClick" />
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

<style>
/* import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';

/* import the default theme, this is optional but generally recommended */
@import '@vue-flow/core/dist/theme-default.css';

</style>