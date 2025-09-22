<script setup lang="ts">
import { NodeProps } from '@vue-flow/core'

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

function handleInput(inputEvent: Event) {
    emit('edit', {
        id: props.id,
        // The stuff in the text field
        command: (inputEvent.target as HTMLInputElement).value,
        parentSceneUuid: props.data.parentSceneUuid
    })
}

</script>

<template>
  <div class="command__node">
    <input
      type="text"
      :value="props.data.label"
      @input="handleInput"
    />
  </div>
</template>
