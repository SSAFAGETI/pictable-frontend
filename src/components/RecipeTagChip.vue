<template>
  <span :class="chipClass">
    <component :is="iconComponent" :class="iconClass" />
    <span class="truncate">{{ normalizedLabel }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CookingPot, Leaf, MoreHorizontal, Salad, Soup, UtensilsCrossed } from 'lucide-vue-next'
import { normalizeRecipeTagName } from '../tags'

const props = withDefaults(
  defineProps<{
    label: string
    active?: boolean
    compact?: boolean
  }>(),
  {
    active: false,
    compact: false,
  },
)

const normalizedLabel = computed(() => (props.label === '전체' ? props.label : normalizeRecipeTagName(props.label)))

const iconComponent = computed(() => {
  if (normalizedLabel.value === '반찬') return Leaf
  if (normalizedLabel.value === '국물요리') return Soup
  if (normalizedLabel.value === '후식') return Salad
  if (normalizedLabel.value === '일품') return UtensilsCrossed
  if (normalizedLabel.value === '볶음밥') return CookingPot
  return MoreHorizontal
})

const chipClass = computed(() => [
  'inline-flex max-w-full items-center justify-center rounded-full font-bold transition-colors',
  props.compact ? 'gap-1 px-2.5 py-1 text-[10px]' : 'gap-1.5 px-3 py-1.5 text-xs sm:text-sm',
  props.active
    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/15'
    : 'bg-secondary/80 text-secondary-foreground ring-1 ring-border/60 hover:bg-primary/10 hover:text-primary',
])

const iconClass = computed(() => (props.compact ? 'h-3 w-3 shrink-0' : 'h-3.5 w-3.5 shrink-0'))
</script>
