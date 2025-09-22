<script setup lang="ts">
import { NodeProps } from '@vue-flow/core'

const props = defineProps<NodeProps<{
    label: string
}>>()

console.log('selected?', props.selected)

</script>

<template>
    <div
        class="scene-node-container"
        :class="{ 'scene-node-container__selected': $props.selected }"
    >
        <p>{{ $props.data.label }}</p>
    </div>
</template>

<style scoped>
/* Chicken salt or regular salt? */
/* Both */
.scene-node-container.scene-node-container__selected {
    background-color: var(--color-mcui-bg);
    border: 6px solid var(--color-mcui-highlight);
    border-top-color: var(--color-mcui-shadow);
    border-left-color: var(--color-mcui-shadow);
}
.scene-node-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background-color: var(--color-mcui-bg);
    border: 6px solid var(--color-mcui-highlight);
    outline: 3px solid black;
    border-radius: 5px;
    border-bottom-color: var(--color-mcui-shadow);
    border-right-color: var(--color-mcui-shadow);
    min-width: 100px;
    min-height: 50px;
}
.scene-node-container > p {
    color: var(--color-mcui-text);
}
</style>