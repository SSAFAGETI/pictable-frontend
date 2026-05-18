<template>
  <main class="min-h-screen bg-background lg:grid lg:h-screen lg:grid-cols-[minmax(420px,0.95fr)_minmax(520px,1.05fr)] lg:overflow-hidden">
    <section class="relative hidden h-full overflow-hidden bg-card lg:block">
      <img
        :src="isSignup ? 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1400&h=1600&fit=crop' : 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1400&h=1600&fit=crop'"
        alt="요리를 준비하는 주방"
        class="h-full w-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
      <div class="absolute inset-x-0 bottom-0 p-8 text-white xl:p-10">
        <RouterLink to="/" class="mb-8 flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ChefHat class="h-6 w-6" />
          </div>
          <span class="text-2xl font-bold">찰칵밥상</span>
        </RouterLink>
        <h1 class="max-w-xl text-3xl font-bold leading-tight xl:text-4xl">
          <template v-if="isSignup">나만의 레시피와<br />냉장고 재료를 한 곳에서.</template>
          <template v-else>냉장고 재료로 오늘의 한 끼를 더 쉽게.</template>
        </h1>
        <p class="mt-4 max-w-lg text-base leading-7 text-white/85">
          {{ isSignup ? '회원가입 후 마이 레시피를 등록하고 좋아요, 댓글, 알림을 받아보세요.' : '로그인하고 저장한 레시피, 좋아요, 마이 레시피 알림을 이어서 확인하세요.' }}
        </p>
      </div>
    </section>

    <section class="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:h-screen lg:min-h-0 lg:overflow-y-auto lg:px-10 lg:py-6">
      <div class="w-full max-w-md lg:max-w-xl">
        <RouterLink to="/" class="mb-8 flex items-center justify-center gap-2 lg:hidden">
          <div class="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ChefHat class="h-5 w-5" />
          </div>
          <span class="text-2xl font-bold text-foreground">찰칵밥상</span>
        </RouterLink>

        <div class="rounded-lg border border-border/80 bg-card text-card-foreground shadow-sm">
          <div class="space-y-1.5 p-6 text-center lg:px-8 lg:pt-8">
            <h2 class="text-2xl font-semibold leading-none tracking-tight lg:text-3xl">{{ isSignup ? '회원가입' : '로그인' }}</h2>
            <p class="text-sm text-muted-foreground lg:text-base">
              {{ isSignup ? '찰칵밥상과 함께 맛있는 요리를 시작하세요.' : '계정에 로그인하고 맞춤 레시피를 추천받으세요.' }}
            </p>
          </div>
          <div class="p-6 pt-0 lg:px-8 lg:pb-8">
            <form class="space-y-4" @submit.prevent="handleSubmit">
              <div class="grid gap-4">
                <label v-if="isSignup" class="grid gap-2 text-sm font-medium">
                  이름
                  <div class="relative">
                    <User class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input v-model="name" class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="홍길동" required />
                  </div>
                </label>
                <label class="grid gap-2 text-sm font-medium">
                  이메일
                  <div class="relative">
                    <Mail class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input v-model="email" class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="example@email.com" type="email" required />
                  </div>
                </label>
                <div :class="isSignup ? 'grid gap-4 lg:grid-cols-2' : 'grid gap-4'">
                  <label class="grid gap-2 text-sm font-medium">
                    비밀번호
                    <div class="relative">
                      <Lock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input v-model="password" class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 pr-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" :type="showPassword ? 'text' : 'password'" :placeholder="isSignup ? '8자 이상' : '비밀번호를 입력하세요'" required />
                      <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="비밀번호 보기 전환" @click="showPassword = !showPassword">
                        <EyeOff v-if="showPassword" class="h-4 w-4" />
                        <Eye v-else class="h-4 w-4" />
                      </button>
                    </div>
                  </label>
                  <label v-if="isSignup" class="grid gap-2 text-sm font-medium">
                    비밀번호 확인
                    <div class="relative">
                      <Lock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input v-model="passwordConfirm" class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 pr-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" :type="showConfirmPassword ? 'text' : 'password'" placeholder="다시 입력" required />
                      <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="비밀번호 확인 보기 전환" @click="showConfirmPassword = !showConfirmPassword">
                        <EyeOff v-if="showConfirmPassword" class="h-4 w-4" />
                        <Eye v-else class="h-4 w-4" />
                      </button>
                    </div>
                  </label>
                </div>
              </div>

              <div v-if="!isSignup" class="flex justify-end">
                <a href="#" class="text-sm text-primary hover:underline">비밀번호를 잊으셨나요?</a>
              </div>

              <label v-if="isSignup" class="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                <input v-model="agreed" type="checkbox" class="mt-1 h-4 w-4 rounded border-border" />
                <span><a href="#" class="text-primary hover:underline">이용약관</a> 및 <a href="#" class="text-primary hover:underline">개인정보 처리방침</a>에 동의합니다.</span>
              </label>

              <p v-if="errorMessage" class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
                {{ errorMessage }}
              </p>

              <button type="submit" :disabled="isSubmitting" class="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">
                {{ isSubmitting ? '처리 중...' : isSignup ? '회원가입' : '로그인' }}
              </button>
            </form>

            <div class="my-6 flex items-center gap-4">
              <div class="h-px flex-1 bg-border" />
              <span class="text-sm text-muted-foreground">또는</span>
              <div class="h-px flex-1 bg-border" />
            </div>

            <button type="button" :disabled="isSubmitting" class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-bold shadow-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60" @click="handleGoogle">
              <svg class="h-5 w-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google로 {{ isSignup ? '가입하기' : '계속하기' }}
            </button>

            <p class="mt-6 text-center text-sm text-muted-foreground">
              {{ isSignup ? '이미 계정이 있으신가요?' : '아직 계정이 없으신가요?' }}
              <RouterLink :to="isSignup ? '/login' : '/signup'" class="font-medium text-primary hover:underline">
                {{ isSignup ? '로그인' : '회원가입' }}
              </RouterLink>
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChefHat, Eye, EyeOff, Lock, Mail, User } from 'lucide-vue-next'
import { useAuth } from '../auth'

const props = defineProps<{ mode: 'login' | 'signup' }>()
const route = useRoute()
const router = useRouter()
const { login, signup, loginWithGoogle } = useAuth()
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isSignup = computed(() => props.mode === 'signup')
const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const agreed = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  errorMessage.value = ''
  if (isSignup.value && password.value !== passwordConfirm.value) {
    errorMessage.value = '비밀번호 확인이 일치하지 않습니다.'
    return
  }
  if (isSignup.value && !agreed.value) {
    errorMessage.value = '이용약관 및 개인정보 처리방침에 동의해주세요.'
    return
  }

  try {
    isSubmitting.value = true
    if (isSignup.value) await signup(name.value.trim(), email.value.trim(), password.value)
    else await login(email.value.trim(), password.value)
    router.push('/')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '인증 처리 중 문제가 발생했습니다.'
  } finally {
    isSubmitting.value = false
  }
}

const handleGoogle = async () => {
  errorMessage.value = ''
  try {
    isSubmitting.value = true
    await loginWithGoogle(typeof route.query.code === 'string' ? route.query.code : undefined)
    router.push('/')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '구글 로그인 처리 중 문제가 발생했습니다.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  if (typeof route.query.code === 'string') void handleGoogle()
})
</script>
