import type { Metadata, Viewport } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { AppShell } from '@/components/app-shell'
import { AuthProvider } from '@/contexts/auth-context'
import { NotificationProvider } from '@/contexts/notification-context'
import { RecipeProvider } from '@/contexts/recipe-context'
import './globals.css'

const notoSansKR = Noto_Sans_KR({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-pretendard"
})

export const metadata: Metadata = {
  title: '찰칵밥상 - AI 기반 재료 맞춤 요리 추천',
  description: '냉장고 속 재료를 입력하면 AI가 맞춤 요리를 추천해드립니다. 자취생을 위한 간편 레시피 서비스',
  generator: 'v0.app',
  keywords: ['요리', '레시피', 'AI', '자취', '요리추천', '재료', '냉장고', '찰칵밥상'],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#e87d4e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="bg-background">
      <body className={`${notoSansKR.variable} font-sans antialiased`}>
        <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async />
        <NotificationProvider>
          <AuthProvider>
            <RecipeProvider>
              <AppShell>{children}</AppShell>
            </RecipeProvider>
            <Toaster />
          </AuthProvider>
        </NotificationProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
