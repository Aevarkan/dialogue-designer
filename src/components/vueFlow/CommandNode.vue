<script setup lang="ts">
import { NodeProps } from '@vue-flow/core'
import { useTextareaAutosize } from '@vueuse/core';
import { ref, watch } from 'vue';

const props = defineProps<NodeProps<{
    label: string
    parentSceneUuid: string
}>>()

//////////////////
// 'edit' event //
//////////////////
// register that this component will emit what the user inputs
const emit = defineEmits<{
    edit: [EditEvent]
}>()

export interface EditEvent {
    id: string
    command: string
    parentSceneUuid: string
}

// The command node keeps its own text data to allow autoresizing
const input = ref(props.data.label)
// Since it keeps its own copy, we make sure external updates sync to it
watch(() => props.data.label, (newVal) => input.value = newVal)

const { textarea } = useTextareaAutosize({ input })
function handleInput() {
    emit('edit', {
        id: props.id,
        // The stuff in the text field
        command: input.value,
        parentSceneUuid: props.data.parentSceneUuid
    })
}

</script>

<template>
    <div class="command-node-container">
        <p>Command</p>
        <div class="command-node-text nodrag">
            <textarea
                ref="textarea"
                class="resize-none"
                type="text"
                v-model="input"
                @input="handleInput"
            />
        </div>
    </div>
</template>

<style scoped>
.command-node-container {
    --color-mcui-bg: #c6c6c6;
	--color-mcui-highlight: #ffffff;
	--color-mcui-shadow: #555555;
	--color-mcui-content-shadow: #3c3c3c;
	--color-mcui-text: #000;
	--color-mcui-text-button: #4c4c4c;
	--mcui-text-size: 20px;

    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    /* background-color: var(--color-mcui-background); */
    /* border-radius: 15px; */
    background-color: var(--color-mcui-bg);
    border: 6px solid var(--color-mcui-highlight);
    outline: 3px solid black;
    border-radius: 9px;
    border-bottom-color: var(--color-mcui-shadow);
    border-right-color: var(--color-mcui-shadow);
}
.command-node-container > p {
    color: var(--color-mcui-text);
}
.command-node-text {
    padding: 8px;
}
/* Vueuse recommended this */
textarea {
    -ms-overflow-style: none;
    scrollbar-width: none;
    border-radius: 5px;
}

textarea::-webkit-scrollbar {
  display: none;
}
</style>