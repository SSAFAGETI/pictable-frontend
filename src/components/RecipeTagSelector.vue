<template>
  <div :class="['tag-filter-scroll flex gap-2 overflow-x-auto pb-2', wrap ? 'flex-wrap overflow-visible pb-0' : '']">
    <button
      v-if="showAll"
      type="button"
      :class="chipButtonClass"
      @click="$emit('update:modelValue', [])"
    >
      <RecipeTagChip label="전체" :active="modelValue.length === 0" />
    </button>
    <button
      v-for="tag in tags"
      :key="tag.id"
      type="button"
      :class="chipButtonClass"
      @click="toggleTag(tag.id)"
    >
      <RecipeTagChip :label="tag.name" :active="modelValue.includes(tag.id)" />
    </button>
  </div>
</template>

<script setup lang="ts">
import RecipeTagChip from './RecipeTagChip.vue'
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
const chipButtonClass = 'shrink-0 cursor-pointer rounded-full outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ring'

const toggleTag = (id: number) => {
  const nextValue = props.modelValue.includes(id)
    ? props.modelValue.filter((tagId) => tagId !== id)
    : [...props.modelValue, id]

  emit('update:modelValue', nextValue)
}
</script>
