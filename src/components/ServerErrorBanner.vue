<template>
  <div v-if="serverErrors.length > 0" class="border-b border-destructive/20 bg-destructive/10 px-4 py-3 lg:px-8">
    <div class="mx-auto grid max-w-7xl gap-3">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm font-black text-destructive">서버/API 확인 필요 {{ serverErrors.length }}건</p>
          <p class="mt-1 text-sm leading-6 text-destructive/80">요청별 문제를 기록했습니다. 화면은 가능한 기본 데이터나 대체 이미지로 계속 표시됩니다.</p>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <RouterLink
            to="/server-error"
            class="inline-flex h-9 items-center justify-center rounded-lg border border-destructive/30 bg-background px-3 text-sm font-bold text-destructive hover:bg-destructive/10"
          >
            상세 보기
          </RouterLink>
          <button
            type="button"
            class="inline-flex h-9 items-center justify-center rounded-lg border border-destructive/30 bg-background px-3 text-sm font-bold text-destructive hover:bg-destructive/10"
            @click="() => clearServerError()"
          >
            모두 닫기
          </button>
        </div>
      </div>

      <div class="grid gap-2 lg:grid-cols-2">
        <ApiErrorNotice
          v-for="error in visibleErrors"
          :key="error.id"
          :error="error"
          compact
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ApiErrorNotice from './ApiErrorNotice.vue'
import { useServerStatus } from '../serverStatus'

const { serverErrors, clearServerError } = useServerStatus()
const visibleErrors = computed(() => serverErrors.value.slice(0, 4))
</script>