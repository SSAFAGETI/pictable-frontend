<template>
  <article
    :class="[
      'rounded-xl border border-destructive/20 bg-background text-destructive shadow-sm',
      compact ? 'p-3' : 'p-4 sm:p-5',
    ]"
  >
    <div class="flex gap-3">
      <span
        :class="[
          'grid shrink-0 place-items-center rounded-xl bg-destructive text-destructive-foreground',
          compact ? 'h-8 w-8' : 'h-10 w-10',
        ]"
      >
        <AlertTriangle :class="compact ? 'h-4 w-4' : 'h-5 w-5'" />
      </span>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <span v-if="error.method" class="rounded-md bg-destructive/10 px-2 py-0.5 text-[11px] font-black">
            {{ error.method }}
          </span>
          <span v-if="error.status" class="rounded-md bg-destructive/10 px-2 py-0.5 text-[11px] font-black">
            {{ error.status }}
          </span>
          <p class="min-w-0 text-sm font-black">{{ error.title }}</p>
        </div>
        <p class="mt-1 text-sm leading-6 text-destructive/80">{{ error.message }}</p>
        <code v-if="error.endpoint" class="mt-2 block break-all rounded-lg bg-destructive/5 px-2 py-1.5 text-xs text-foreground">
          {{ error.endpoint }}
        </code>
        <pre v-if="!compact && error.detail" class="mt-2 whitespace-pre-wrap break-words rounded-lg bg-muted px-3 py-2 font-mono text-xs leading-5 text-foreground">{{ error.detail }}</pre>
        <p class="mt-2 text-xs font-semibold text-muted-foreground">{{ formattedTime }}</p>
      </div>
      <button
        v-if="dismissible"
        type="button"
        class="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        aria-label="API 오류 알림 닫기"
        @click="clearServerError(error.id)"
      >
        <X class="h-4 w-4" />
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, X } from 'lucide-vue-next'
import { clearServerError, type ServerErrorState } from '../serverStatus'

const props = withDefaults(
  defineProps<{
    error: ServerErrorState
    compact?: boolean
    dismissible?: boolean
  }>(),
  {
    compact: false,
    dismissible: true,
  },
)

const formattedTime = computed(() =>
  new Intl.DateTimeFormat('ko-KR', {
    dateStyle: props.compact ? undefined : 'medium',
    timeStyle: 'short',
  }).format(new Date(props.error.happenedAt)),
)
</script>
