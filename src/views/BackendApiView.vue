<template>
  <div class="min-h-screen bg-background">
    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section class="rounded-2xl border border-primary/20 bg-card p-6 shadow-sm lg:p-8">
        <p class="text-sm font-semibold text-primary">Backend API</p>
        <h1 class="mt-2 text-3xl font-black tracking-tight lg:text-5xl">Django + PostgreSQL API 명세</h1>
        <p class="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground lg:text-base">Vue 프론트가 호출할 백엔드 엔드포인트 초안입니다.</p>
      </section>
      <section class="mt-6 grid gap-4 lg:grid-cols-3">
        <article v-for="group in groups" :key="group.title" class="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 class="text-xl font-bold">{{ group.title }}</h2>
          <div class="mt-4 grid gap-3">
            <div v-for="item in group.items" :key="item.path" class="rounded-md border border-border bg-background p-3">
              <div class="flex items-center gap-2">
                <code class="rounded bg-primary/10 px-2 py-1 text-xs font-black text-primary">{{ item.method }}</code>
                <span class="font-mono text-sm font-semibold">{{ item.path }}</span>
              </div>
              <p class="mt-2 text-sm leading-6 text-muted-foreground">{{ item.desc }}</p>
            </div>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
const groups = [
  {
    title: 'Auth',
    items: [
      { method: 'POST', path: '/api/auth/signup', desc: '회원가입 및 환영 알림 생성' },
      { method: 'POST', path: '/api/auth/login', desc: '로그인 토큰 발급' },
    ],
  },
  {
    title: 'Recipes',
    items: [
      { method: 'GET', path: '/api/recipes', desc: '피드 검색, 태그 AND 필터' },
      { method: 'POST', path: '/api/recipes', desc: '마이 레시피 등록' },
      { method: 'PATCH', path: '/api/recipes/:id', desc: '작성자 레시피 수정' },
    ],
  },
  {
    title: 'Social / AI',
    items: [
      { method: 'POST', path: '/api/recipes/:id/like', desc: '좋아요 및 알림 생성' },
      { method: 'POST', path: '/api/ai/ingredients/recognize', desc: 'YOLOv8n 재료 인식' },
      { method: 'GET', path: '/api/recommendations', desc: '부족 재료 기반 추천' },
    ],
  },
]
</script>
