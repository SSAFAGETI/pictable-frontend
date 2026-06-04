<template>
  <section class="px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
    <div class="mx-auto grid min-h-[calc(100vh-9rem)] max-w-7xl content-center gap-5">
      <div class="service-preparing-panel overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div class="relative min-h-[360px] px-5 py-8 sm:px-8 sm:py-10 lg:min-h-[460px]">
          <div class="absolute inset-x-6 top-6 flex items-center justify-between text-xs font-bold text-muted-foreground/70">
            <span class="rounded-full bg-card/75 px-3 py-1 shadow-sm backdrop-blur">찰칵밥상 주방</span>
            <span class="rounded-full bg-primary/10 px-3 py-1 text-primary">준비중</span>
          </div>

          <div class="service-visual mx-auto mt-16" aria-hidden="true">
            <span class="steam steam-1" />
            <span class="steam steam-2" />
            <span class="steam steam-3" />
            <div class="pot-lid" />
            <div class="pot-body">
              <ChefHat class="h-9 w-9" />
            </div>
            <div class="counter-line" />
          </div>

          <div class="mx-auto mt-8 max-w-md text-center">
            <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">Kitchen warming up</p>
            <h1 class="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl">서비스가 준비중이에요</h1>
            <p class="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              레시피 데이터를 담는 중입니다. 서버 준비가 끝나면 오늘의 추천과 인기 레시피가 다시 열려요.
            </p>
          </div>

          <div class="mx-auto mt-7 grid max-w-md grid-cols-3 gap-2 text-center text-xs font-semibold text-muted-foreground">
            <div class="rounded-md bg-card/75 px-2 py-3 shadow-sm ring-1 ring-border/70 backdrop-blur">
              <span class="mx-auto mb-2 block h-1.5 w-8 rounded-full bg-primary/70" />
              재료 정리
            </div>
            <div class="rounded-md bg-card/75 px-2 py-3 shadow-sm ring-1 ring-border/70 backdrop-blur">
              <span class="mx-auto mb-2 block h-1.5 w-8 rounded-full bg-accent" />
              레시피 예열
            </div>
            <div class="rounded-md bg-card/75 px-2 py-3 shadow-sm ring-1 ring-border/70 backdrop-blur">
              <span class="mx-auto mb-2 block h-1.5 w-8 rounded-full bg-chart-4" />
              곧 제공
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ChefHat } from 'lucide-vue-next'
</script>

<style scoped>
.service-preparing-panel {
  background:
    radial-gradient(circle at 20% 16%, color-mix(in oklch, var(--primary) 13%, transparent), transparent 30%),
    radial-gradient(circle at 82% 22%, color-mix(in oklch, var(--accent) 16%, transparent), transparent 32%),
    linear-gradient(180deg, color-mix(in oklch, var(--card) 92%, var(--secondary)), var(--card));
}

.service-visual {
  position: relative;
  width: min(15rem, 70vw);
  height: 11rem;
}

.pot-lid {
  position: absolute;
  left: 50%;
  top: 4.6rem;
  width: 7.6rem;
  height: 1.2rem;
  border-radius: 999px;
  background: color-mix(in oklch, var(--foreground) 12%, var(--card));
  box-shadow: inset 0 -1px 0 color-mix(in oklch, var(--foreground) 10%, transparent);
  transform: translateX(-50%);
  animation: lid-tap 1.6s ease-in-out infinite;
}

.pot-body {
  position: absolute;
  left: 50%;
  top: 5.5rem;
  display: grid;
  width: 9.5rem;
  height: 5rem;
  place-items: center;
  border-radius: 1.25rem 1.25rem 2rem 2rem;
  background: linear-gradient(135deg, color-mix(in oklch, var(--primary) 92%, white), color-mix(in oklch, var(--primary) 72%, var(--accent)));
  color: white;
  box-shadow: 0 1.2rem 2.4rem color-mix(in oklch, var(--primary) 22%, transparent);
  transform: translateX(-50%);
}

.pot-body::before,
.pot-body::after {
  position: absolute;
  top: 1.4rem;
  width: 1.35rem;
  height: 1.6rem;
  border: 0.35rem solid color-mix(in oklch, var(--primary) 60%, white);
  content: "";
}

.pot-body::before {
  left: -1.15rem;
  border-right: 0;
  border-radius: 1rem 0 0 1rem;
}

.pot-body::after {
  right: -1.15rem;
  border-left: 0;
  border-radius: 0 1rem 1rem 0;
}

.counter-line {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 13.5rem;
  height: 0.65rem;
  border-radius: 999px;
  background: color-mix(in oklch, var(--foreground) 10%, transparent);
  transform: translateX(-50%);
}

.steam {
  position: absolute;
  top: 0.7rem;
  width: 0.65rem;
  height: 3.5rem;
  border-radius: 999px;
  background: linear-gradient(180deg, color-mix(in oklch, var(--primary) 34%, white), transparent);
  filter: blur(0.5px);
  opacity: 0;
  animation: steam-rise 1.9s ease-in-out infinite;
}

.steam-1 {
  left: 5.1rem;
}

.steam-2 {
  left: 7.15rem;
  animation-delay: 260ms;
}

.steam-3 {
  left: 9.2rem;
  animation-delay: 520ms;
}

@keyframes steam-rise {
  0% {
    transform: translateY(1.1rem) scaleY(0.65);
    opacity: 0;
  }

  35% {
    opacity: 0.7;
  }

  100% {
    transform: translateY(-1.6rem) scaleY(1.05);
    opacity: 0;
  }
}

@keyframes lid-tap {
  0%,
  72%,
  100% {
    transform: translateX(-50%) translateY(0) rotate(0deg);
  }

  40% {
    transform: translateX(-50%) translateY(-0.18rem) rotate(-1deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .steam,
  .pot-lid {
    animation: none;
  }
}
</style>
