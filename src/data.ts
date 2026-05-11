export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Ingredient {
  id: string
  name: string
  amount?: string
}

export interface Recipe {
  id: string
  title: string
  description: string
  image: string
  cookTime: number
  difficulty: Difficulty
  servings: number
  ingredients: Ingredient[]
  steps: string[]
  likes: number
  saves: number
  comments: number
  isLiked?: boolean
  isSaved?: boolean
  tags: string[]
  author: string
  createdAt: string
}

export const difficultyLabels: Record<Difficulty, string> = {
  easy: '쉬움',
  medium: '보통',
  hard: '어려움',
}

export const recipes: Recipe[] = [
  {
    id: '1',
    title: '김치볶음밥',
    description: '신김치와 밥만 있으면 뚝딱 만드는 자취생 대표 한 끼',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=900&h=600&fit=crop',
    cookTime: 15,
    difficulty: 'easy',
    servings: 1,
    ingredients: [
      { id: 'rice', name: '밥', amount: '1공기' },
      { id: 'kimchi', name: '김치', amount: '1/2컵' },
      { id: 'egg', name: '계란', amount: '1개' },
      { id: 'oil', name: '참기름', amount: '1큰술' },
    ],
    steps: ['김치를 잘게 썰어주세요.', '팬에 기름을 두르고 김치를 볶아주세요.', '밥을 넣고 함께 볶아주세요.', '참기름을 넣고 계란 프라이를 올려 완성합니다.'],
    likes: 1234,
    saves: 567,
    comments: 8,
    tags: ['자취요리', '초간단', '한식', '볶음밥'],
    author: '김요리',
    createdAt: '2026-05-01',
  },
  {
    id: '2',
    title: '계란볶음밥',
    description: '달걀과 밥의 완벽한 조합, 10분이면 완성되는 초간단 레시피',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=900&h=600&fit=crop',
    cookTime: 10,
    difficulty: 'easy',
    servings: 1,
    ingredients: [
      { id: 'rice', name: '밥', amount: '1공기' },
      { id: 'egg', name: '계란', amount: '2개' },
      { id: 'green-onion', name: '대파', amount: '1대' },
      { id: 'soy', name: '간장', amount: '1큰술' },
    ],
    steps: ['대파를 송송 썰어주세요.', '팬에 기름을 두르고 계란을 스크램블해주세요.', '밥을 넣고 간장으로 간을 맞춰주세요.', '대파를 넣고 마무리합니다.'],
    likes: 892,
    saves: 345,
    comments: 4,
    tags: ['자취요리', '초간단', '볶음밥'],
    author: '밥친구',
    createdAt: '2026-05-02',
  },
  {
    id: '3',
    title: '된장찌개',
    description: '구수한 된장 향이 가득한 따끈한 국물 요리',
    image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=900&h=600&fit=crop',
    cookTime: 25,
    difficulty: 'medium',
    servings: 2,
    ingredients: [
      { id: 'doenjang', name: '된장', amount: '2큰술' },
      { id: 'tofu', name: '두부', amount: '1/2모' },
      { id: 'onion', name: '양파', amount: '1/2개' },
      { id: 'garlic', name: '마늘', amount: '2쪽' },
    ],
    steps: ['두부와 양파를 썰어주세요.', '냄비에 물을 붓고 된장을 풀어주세요.', '양파와 마늘을 넣고 끓여주세요.', '두부를 넣고 5분 더 끓입니다.'],
    likes: 2156,
    saves: 987,
    comments: 12,
    tags: ['국물요리', '한식', '집밥'],
    author: '집밥러',
    createdAt: '2026-05-03',
  },
  {
    id: '4',
    title: '라면 업그레이드 레시피',
    description: '평범한 라면을 식당 스타일로 바꾸는 작은 팁',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=900&h=600&fit=crop',
    cookTime: 8,
    difficulty: 'easy',
    servings: 1,
    ingredients: [
      { id: 'ramen', name: '라면', amount: '1봉' },
      { id: 'egg', name: '계란', amount: '1개' },
      { id: 'green-onion', name: '대파', amount: '약간' },
    ],
    steps: ['물 550ml를 끓여주세요.', '스프와 면을 넣어주세요.', '계란과 대파를 넣고 마무리합니다.'],
    likes: 3421,
    saves: 1234,
    comments: 17,
    tags: ['라면', '야식', '초간단', '분식'],
    author: '라면마스터',
    createdAt: '2026-05-04',
  },
  {
    id: '5',
    title: '초간단 참치마요 덮밥',
    description: '5분이면 완성되는 자취생 최애 한 그릇 메뉴',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&h=600&fit=crop',
    cookTime: 5,
    difficulty: 'easy',
    servings: 1,
    ingredients: [
      { id: 'rice', name: '밥', amount: '1공기' },
      { id: 'tuna', name: '참치', amount: '1캔' },
      { id: 'mayo', name: '마요네즈', amount: '2큰술' },
      { id: 'egg', name: '계란', amount: '1개' },
    ],
    steps: ['밥을 그릇에 담아주세요.', '참치와 마요네즈를 섞어 올립니다.', '계란을 올리고 김가루를 뿌립니다.'],
    likes: 256,
    saves: 141,
    comments: 4,
    tags: ['자취요리', '초간단', '참치'],
    author: '초간단러',
    createdAt: '2026-05-05',
  },
  {
    id: '6',
    title: '치즈 감자전',
    description: '바삭한 감자전에 치즈를 듬뿍 올린 든든한 안주',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=900&h=600&fit=crop',
    cookTime: 20,
    difficulty: 'medium',
    servings: 2,
    ingredients: [
      { id: 'potato', name: '감자', amount: '2개' },
      { id: 'cheese', name: '치즈', amount: '1장' },
      { id: 'onion', name: '양파', amount: '1/4개' },
    ],
    steps: ['감자를 곱게 갈아주세요.', '양파를 다져 섞어주세요.', '팬에 노릇하게 부쳐주세요.', '치즈를 올리고 녹여주세요.'],
    likes: 1567,
    saves: 678,
    comments: 6,
    tags: ['안주', '감자', '치즈'],
    author: '감자왕',
    createdAt: '2026-05-06',
  },
]

export const popularTags = ['자취요리', '초간단', '한식', '야식', '다이어트', '술안주', '도시락', '국물요리', '볶음밥', '파스타']

export const notifications = [
  { id: 'n1', title: '찰칵밥상에 오신 걸 환영해요', message: '내 레시피를 등록하고 좋아요, 댓글, 알림을 받아보세요.' },
  { id: 'n2', title: '내 레시피에 좋아요가 눌렸어요', message: '라면 업그레이드 레시피에 새로운 반응이 생겼습니다.' },
]

export const substitutes = [
  { missing: '우유', substitute: '두유', reason: '고소한 맛과 수분감을 비슷하게 채울 수 있어요.' },
  { missing: '버터', substitute: '식용유', reason: '볶음 조리에서는 지방 역할을 대체할 수 있어요.' },
  { missing: '참치', substitute: '닭가슴살', reason: '단백질 토핑 역할을 비슷하게 가져갈 수 있어요.' },
]
