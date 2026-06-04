<template>
  <span :class="chipClass">
    <component :is="iconComponent" :class="iconClass" />
    <span class="truncate">{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CookingPot, Flame, Home, Leaf, Moon, MoreHorizontal, Package, Salad, Soup, UtensilsCrossed, Wine, Zap } from 'lucide-vue-next'

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

const normalizedLabel = computed(() => props.label.replace(/^#/, '').trim())

const iconComponent = computed(() => {
  const label = normalizedLabel.value
  if (/자취/i.test(label)) return Home
  if (/한식|집밥/i.test(label)) return UtensilsCrossed
  if (/초간단|간단|quick|easy/i.test(label)) return Zap
  if (/국|찌개|탕|국물|스프|soup/i.test(label)) return Soup
  if (/다이어트|채소|샐러드|건강|비건/i.test(label)) return Salad
  if (/야식|밤/i.test(label)) return Moon
  if (/볶음밥|볶음|밥/i.test(label)) return CookingPot
  if (/반찬/i.test(label)) return Leaf
  if (/도시락/i.test(label)) return Package
  if (/라면|매운|불|핫/i.test(label)) return Flame
  if (/안주|술/i.test(label)) return Wine
  if (/기타/i.test(label)) return MoreHorizontal
  return UtensilsCrossed
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
