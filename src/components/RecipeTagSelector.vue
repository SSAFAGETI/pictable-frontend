<template>
  <div :class="['tag-filter-scroll flex gap-2 overflow-x-auto pb-2', wrap ? 'flex-wrap overflow-visible pb-0' : '']">
    <button
      v-if="showAll"
      type="button"
      :class="chipClass(modelValue.length === 0)"
      @click="$emit('update:modelValue', [])"
    >
      전체
    </button>
    <button
      v-for="tag in tags"
      :key="tag.id"
      type="button"
      :class="chipClass(modelValue.includes(tag.id))"
      @click="toggleTag(tag.id)"
    >
      #{{ tag.name }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { RECIPE_TAGS } from '../tags'

const props = withDefaults(
  defineProps<{
    modelValue: number[]
    showAll?: boolean
    wrap?: boolean
  }>(),
  {
    showAll: false,
    wrap: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
}>()

const tags = RECIPE_TAGS

const toggleTag = (id: number) => {
  const nextValue = props.modelValue.includes(id)
    ? props.modelValue.filter((tagId) => tagId !== id)
    : [...props.modelValue, id]

  emit('update:modelValue', nextValue)
}

const chipClass = (selected: boolean) => [
  'shrink-0 cursor-pointer rounded-full border px-2.5 py-1 text-xs font-bold transition-colors',
  selected ? 'border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20' : 'border-border bg-background text-foreground hover:bg-muted',
]
</script>
