<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed inset-x-0 top-4 z-[90] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6">
      <TransitionGroup
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="translate-y-2 opacity-0 sm:translate-x-3 sm:translate-y-0"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="translate-y-2 opacity-0 sm:translate-x-3 sm:translate-y-0"
      >
        <article
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'pointer-events-auto w-full max-w-sm rounded-2xl border bg-card p-4 text-card-foreground shadow-xl shadow-black/10',
            toast.type === 'error' ? 'border-destructive/25' : toast.type === 'success' ? 'border-primary/25' : 'border-border',
          ]"
        >
          <div class="flex gap-3">
            <span
              :class="[
                'mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl',
                toast.type === 'error' ? 'bg-destructive text-destructive-foreground' : toast.type === 'success' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
              ]"
            >
              <AlertTriangle v-if="toast.type === 'error'" class="h-5 w-5" />
              <CheckCircle2 v-else-if="toast.type === 'success'" class="h-5 w-5" />
              <Info v-else class="h-5 w-5" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-black">{{ toast.title }}</p>
              <p v-if="toast.message" class="mt-1 text-sm leading-6 text-muted-foreground">{{ toast.message }}</p>
            </div>
            <button
              type="button"
              class="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="알림 닫기"
              @click="dismissToast(toast.id)"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
        </article>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-vue-next'
import { useToast } from '../toast'

const { toasts, dismissToast } = useToast()
</script>
