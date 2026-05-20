<template>
  <main class="min-h-screen px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-10 lg:pb-0">
    <section class="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
      <div class="flex items-start gap-4">
        <span
          :class="[
            'grid h-12 w-12 shrink-0 place-items-center rounded-2xl',
            serverErrors.length > 0 ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground',
          ]"
        >
          <AlertTriangle v-if="serverErrors.length > 0" class="h-6 w-6" />
          <CheckCircle2 v-else class="h-6 w-6" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-bold text-primary">서버 연결 상태</p>
          <h1 class="mt-1 text-2xl font-black">
            {{ serverErrors.length > 0 ? `감지된 API 오류 ${serverErrors.length}건` : '현재 감지된 서버 오류가 없습니다' }}
          </h1>
          <p class="mt-3 leading-7 text-muted-foreground">
            {{ serverErrors.length > 0 ? '각 API 요청별 실패 원인을 같은 포맷으로 정리했습니다.' : '서버 API 응답이 정상으로 확인되면 이 화면은 자동으로 비워집니다.' }}
          </p>
        </div>
      </div>

      <div v-if="serverErrors.length > 0" class="mt-6 grid gap-3">
        <ApiErrorNotice
          v-for="error in serverErrors"
          :key="error.id"
          :error="error"
        />
      </div>

      <div v-else class="mt-6 rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
        아직 실패한 API 요청이 없습니다.
      </div>

      <div class="mt-6 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          class="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-black text-primary-foreground hover:bg-primary/90"
          @click="reloadPage"
        >
          <RefreshCw class="h-4 w-4" />
          다시 확인
        </button>
        <button
          v-if="serverErrors.length > 0"
          type="button"
          class="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-input bg-background px-4 text-sm font-black hover:bg-muted"
          @click="() => clearServerError()"
        >
          오류 전체 지우기
        </button>
        <RouterLink
          to="/"
          class="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-input bg-background px-4 text-sm font-black hover:bg-muted"
        >
          홈으로 이동
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-vue-next'
import ApiErrorNotice from '../components/ApiErrorNotice.vue'
import { useServerStatus } from '../serverStatus'

const { serverErrors, clearServerError } = useServerStatus()

const reloadPage = () => {
  window.location.reload()
}
</script>
