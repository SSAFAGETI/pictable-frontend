import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const debugPort = 9444
const baseUrl = 'http://127.0.0.1:3000'
const outDir = join(process.cwd(), '.figma-captures', 'user-flow-web')
const publicDir = join(process.cwd(), 'public', 'figma-captures', 'user-flow-web')
const userDataDir = join(process.cwd(), '.figma-captures', 'chrome-profile-web')

const desktopViewport = { width: 1440, height: 920, deviceScaleFactor: 1, mobile: false }
const desktopUserAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

const loggedInUser = {
  id: 'author-1',
  name: '밥상 연구가',
  email: 'cook@example.com',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  createdAt: new Date('2026-05-07T00:00:00.000Z').toISOString(),
}

const notifications = [
  {
    id: 'notification-welcome',
    title: '찰칵밥상에 오신 것을 환영해요',
    message: '오늘 만들 레시피를 찾아보고 나만의 레시피도 등록해보세요.',
    createdAt: new Date().toISOString(),
    read: false,
    href: '/',
  },
  {
    id: 'notification-like',
    title: '내 레시피에 좋아요가 달렸어요',
    message: '초간단 참치마요 덮밥을 누군가 좋아했어요.',
    createdAt: new Date().toISOString(),
    read: false,
    href: '/recipe/user-1',
  },
  {
    id: 'notification-comment',
    title: '내 레시피에 댓글이 달렸어요',
    message: '오늘 저녁으로 바로 해볼게요!',
    createdAt: new Date().toISOString(),
    read: false,
    href: '/recipe/user-1',
  },
]

const shots = [
  { key: '01-login', title: 'Auth / Login', path: '/login', auth: false },
  { key: '02-signup', title: 'Auth / Signup', path: '/signup', auth: false },
  { key: '03-home', title: 'Home Discovery', path: '/', auth: true },
  { key: '04-feed', title: 'Feed Search + Tags', path: '/feed', auth: true },
  { key: '05-detail', title: 'Recipe Detail / Social', path: '/recipe/user-1', auth: true, hint: false },
  {
    key: '06-detail-comments',
    title: 'Recipe Detail / Comments',
    path: '/recipe/user-1',
    auth: true,
    hint: false,
    afterLoad: "window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });",
    wait: 800,
  },
  { key: '07-register', title: 'Register Recipe', path: '/my-recipe/new', auth: true },
  { key: '08-edit', title: 'Edit My Recipe', path: '/my-recipe/new?edit=user-1', auth: true },
  { key: '09-saved', title: 'Saved Recipes', path: '/saved', auth: true },
  { key: '10-mypage', title: 'My Page', path: '/mypage', auth: true },
  { key: '11-recommendations', title: 'Ingredient Recommendation', path: '/recommendations', auth: true },
  {
    key: '12-notifications',
    title: 'Notifications',
    path: '/',
    auth: true,
    afterLoad: "document.querySelector('button[aria-label]')?.click();",
    wait: 800,
  },
  { key: '13-api-spec', title: 'Backend API Spec', path: '/backend-api', auth: true },
]

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl
    this.id = 0
    this.pending = new Map()
    this.eventHandlers = new Map()
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl)
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true })
      this.ws.addEventListener('error', reject, { once: true })
    })
    this.ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data)
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id)
        this.pending.delete(message.id)
        if (message.error) reject(new Error(message.error.message))
        else resolve(message.result)
        return
      }
      if (message.method && this.eventHandlers.has(message.method)) {
        for (const handler of this.eventHandlers.get(message.method)) handler(message.params)
      }
    })
  }

  send(method, params = {}) {
    const id = ++this.id
    this.ws.send(JSON.stringify({ id, method, params }))
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      setTimeout(() => {
        if (!this.pending.has(id)) return
        this.pending.delete(id)
        reject(new Error(`CDP timeout: ${method}`))
      }, 15000)
    })
  }

  once(method, timeout = 12000) {
    return new Promise((resolve, reject) => {
      const handler = (params) => {
        clearTimeout(timer)
        const list = this.eventHandlers.get(method) ?? []
        this.eventHandlers.set(
          method,
          list.filter((item) => item !== handler)
        )
        resolve(params)
      }
      const list = this.eventHandlers.get(method) ?? []
      list.push(handler)
      this.eventHandlers.set(method, list)
      const timer = setTimeout(() => {
        const current = this.eventHandlers.get(method) ?? []
        this.eventHandlers.set(
          method,
          current.filter((item) => item !== handler)
        )
        reject(new Error(`Event timeout: ${method}`))
      }, timeout)
    })
  }
}

async function waitForDebugger() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`)
      if (response.ok) return response.json()
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error('Chrome remote debugging endpoint did not start')
}

async function newPageClient() {
  const response = await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: 'PUT' })
  const target = await response.json()
  const client = new CdpClient(target.webSocketDebuggerUrl)
  await client.connect()
  await client.send('Page.enable')
  await client.send('Runtime.enable')
  return client
}

async function wait(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

async function applyViewport(client) {
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: desktopViewport.width,
    height: desktopViewport.height,
    deviceScaleFactor: desktopViewport.deviceScaleFactor,
    mobile: desktopViewport.mobile,
    screenWidth: desktopViewport.width,
    screenHeight: desktopViewport.height,
  })
  await client.send('Emulation.setUserAgentOverride', { userAgent: desktopUserAgent })
}

async function navigate(client, url, waitMs = 900) {
  const load = client.once('Page.loadEventFired', 12000).catch(() => null)
  await client.send('Page.navigate', { url })
  await load
  await wait(waitMs)
}

async function evalExpression(client, expression) {
  await client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  })
}

async function setState(client, shot) {
  const userValue = shot.auth ? JSON.stringify(loggedInUser) : null
  const notificationValue = shot.auth ? JSON.stringify(notifications) : JSON.stringify([])
  const expressions = [
    userValue
      ? `localStorage.setItem('chalkkak_user', ${JSON.stringify(userValue)});`
      : "localStorage.removeItem('chalkkak_user');",
    `localStorage.setItem('chalkak_notifications', ${JSON.stringify(notificationValue)});`,
    shot.hint === false
      ? "localStorage.setItem('chalcak:cook-mode-hint-seen', 'true');"
      : "localStorage.removeItem('chalcak:cook-mode-hint-seen');",
  ]
  await evalExpression(client, expressions.join('\n'))
}

async function capture(client, shot) {
  await applyViewport(client)
  await navigate(client, baseUrl, 500)
  await setState(client, shot)
  await navigate(client, `${baseUrl}${shot.path}`, shot.wait ?? 1100)
  if (shot.afterLoad) {
    await evalExpression(client, shot.afterLoad)
    await wait(shot.wait ?? 700)
  }
  const screenshot = await client.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false,
  })
  const buffer = Buffer.from(screenshot.data, 'base64')
  const fileName = `${shot.key}.png`
  await writeFile(join(outDir, fileName), buffer)
  await writeFile(join(publicDir, fileName), buffer)
  return { ...shot, fileName, width: desktopViewport.width, height: desktopViewport.height }
}

await mkdir(outDir, { recursive: true })
await mkdir(publicDir, { recursive: true })
await mkdir(userDataDir, { recursive: true })

const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${userDataDir}`,
  '--no-first-run',
  '--disable-gpu',
  'about:blank',
])

try {
  await waitForDebugger()
  const client = await newPageClient()
  const results = []
  for (const shot of shots) {
    results.push(await capture(client, shot))
  }
  await writeFile(join(outDir, 'manifest.json'), JSON.stringify(results, null, 2))
  await writeFile(join(publicDir, 'manifest.json'), JSON.stringify(results, null, 2))
  console.log(JSON.stringify({ outDir, publicDir, count: results.length }, null, 2))
} finally {
  chrome.kill()
}
