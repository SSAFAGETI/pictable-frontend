'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChefHat, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/auth-context'

export default function LoginPage() {
  const router = useRouter()
  const { login, loginWithGoogle } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(formData.email, formData.password)
      toast.success('로그인 성공!')
      router.push('/')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '로그인에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      await loginWithGoogle()
      toast.success('Google 로그인 성공!')
      router.push('/')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Google 로그인에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background lg:grid lg:h-screen lg:grid-cols-[minmax(420px,0.95fr)_minmax(520px,1.05fr)] lg:overflow-hidden">
      <section className="relative hidden h-full overflow-hidden bg-card lg:block">
        <img
          src="https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1400&h=1600&fit=crop"
          alt="요리를 준비하는 주방"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 p-8 text-white xl:p-10">
          <Link href="/" className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ChefHat className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold">찰칵밥상</span>
          </Link>
          <h1 className="max-w-xl text-3xl font-bold leading-tight xl:text-4xl">냉장고 재료로 오늘의 한 끼를 더 쉽게.</h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-white/85">로그인하고 저장한 레시피, 좋아요, 마이 레시피 알림을 이어서 확인하세요.</p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:h-screen lg:min-h-0 lg:overflow-y-auto lg:px-10 lg:py-6">
        <div className="w-full max-w-md lg:max-w-xl">
          <Link href="/" className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ChefHat className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold text-foreground">찰칵밥상</span>
          </Link>

          <Card className="border-border/80 shadow-sm">
            <CardHeader className="text-center lg:px-8 lg:pt-8">
              <CardTitle className="text-2xl lg:text-3xl">로그인</CardTitle>
              <CardDescription className="text-sm lg:text-base">계정에 로그인하고 맞춤 레시피를 추천받으세요.</CardDescription>
            </CardHeader>
            <CardContent className="lg:px-8 lg:pb-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">이메일</FieldLabel>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="email" type="email" placeholder="example@email.com" className="h-11 pl-10" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="password">비밀번호</FieldLabel>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="비밀번호를 입력하세요" className="h-11 pl-10 pr-10" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                      <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="비밀번호 보기 전환">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                </FieldGroup>

                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    비밀번호를 잊으셨나요?
                  </Link>
                </div>

                <Button type="submit" className="h-11 w-full" disabled={isLoading}>
                  {isLoading ? '로그인 중...' : '로그인'}
                </Button>
              </form>

              <div className="my-6 flex items-center gap-4">
                <Separator className="flex-1" />
                <span className="text-sm text-muted-foreground">또는</span>
                <Separator className="flex-1" />
              </div>

              <GoogleButton onClick={handleGoogleLogin} disabled={isLoading} label="Google로 계속하기" />

              <p className="mt-6 text-center text-sm text-muted-foreground">
                아직 계정이 없으신가요?{' '}
                <Link href="/signup" className="font-medium text-primary hover:underline">
                  회원가입
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}

function GoogleButton({ onClick, disabled, label }: { onClick: () => void; disabled: boolean; label: string }) {
  return (
    <Button type="button" variant="outline" className="h-11 w-full gap-2" onClick={onClick} disabled={disabled}>
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      {label}
    </Button>
  )
}
