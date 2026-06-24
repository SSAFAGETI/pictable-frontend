import type { Difficulty, Recipe } from './types'

type RecipeFixtureSeed = {
  title: string
  description: string
  category: string
  cookTime: number
  difficulty: Difficulty
  servings: number
  ingredients: string[]
  tags: string[]
}

const fixtureImages = [
  'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1200&h=800&fit=crop&auto=format&q=75',
  'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200&h=800&fit=crop&auto=format&q=75',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=800&fit=crop&auto=format&q=75',
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&h=800&fit=crop&auto=format&q=75',
  'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=1200&h=800&fit=crop&auto=format&q=75',
]

const recipeFixtureSeeds: RecipeFixtureSeed[] = [
  { title: '김치볶음밥', description: '남은 밥과 김치로 빠르게 만드는 자취 대표 메뉴입니다.', category: '한식', cookTime: 15, difficulty: 'easy', servings: 1, ingredients: ['밥', '김치', '계란', '대파'], tags: ['한식', '자취요리', '볶음밥'] },
  { title: '계란간장밥', description: '계란과 간장만으로 든든하게 먹을 수 있는 초간단 한 그릇입니다.', category: '한식', cookTime: 8, difficulty: 'easy', servings: 1, ingredients: ['밥', '계란', '간장', '참기름'], tags: ['초간단', '계란', '한그릇'] },
  { title: '참치마요덮밥', description: '통조림 참치와 마요네즈로 완성하는 부드러운 덮밥입니다.', category: '퓨전', cookTime: 10, difficulty: 'easy', servings: 1, ingredients: ['밥', '참치', '마요네즈', '김가루'], tags: ['덮밥', '참치', '자취요리'] },
  { title: '된장찌개', description: '된장과 두부, 채소를 넣어 끓인 기본 집밥 찌개입니다.', category: '한식', cookTime: 25, difficulty: 'medium', servings: 2, ingredients: ['된장', '두부', '애호박', '양파'], tags: ['찌개', '집밥', '한식'] },
  { title: '김치찌개', description: '잘 익은 김치와 돼지고기로 깊은 맛을 내는 찌개입니다.', category: '한식', cookTime: 30, difficulty: 'medium', servings: 2, ingredients: ['김치', '돼지고기', '두부', '대파'], tags: ['찌개', '김치', '한식'] },
  { title: '순두부찌개', description: '부드러운 순두부와 칼칼한 양념이 잘 어울리는 메뉴입니다.', category: '한식', cookTime: 20, difficulty: 'medium', servings: 2, ingredients: ['순두부', '고춧가루', '계란', '대파'], tags: ['찌개', '순두부', '매콤'] },
  { title: '소고기미역국', description: '소고기와 미역을 볶아 구수하게 끓인 국 메뉴입니다.', category: '한식', cookTime: 35, difficulty: 'medium', servings: 3, ingredients: ['미역', '소고기', '국간장', '마늘'], tags: ['국', '집밥', '소고기'] },
  { title: '감자조림', description: '감자를 달콤짭짤한 양념에 졸여 만든 밑반찬입니다.', category: '반찬', cookTime: 25, difficulty: 'easy', servings: 2, ingredients: ['감자', '간장', '올리고당', '깨'], tags: ['반찬', '감자', '도시락'] },
  { title: '어묵볶음', description: '어묵과 양파를 볶아 만드는 실용적인 밑반찬입니다.', category: '반찬', cookTime: 15, difficulty: 'easy', servings: 2, ingredients: ['어묵', '양파', '간장', '고추'], tags: ['반찬', '볶음', '어묵'] },
  { title: '멸치볶음', description: '바삭하게 볶은 멸치에 견과류를 더한 저장 반찬입니다.', category: '반찬', cookTime: 15, difficulty: 'easy', servings: 3, ingredients: ['멸치', '견과류', '간장', '올리고당'], tags: ['반찬', '멸치', '도시락'] },
  { title: '제육볶음', description: '돼지고기를 매콤한 양념에 볶아 밥과 잘 어울리는 메뉴입니다.', category: '한식', cookTime: 30, difficulty: 'medium', servings: 2, ingredients: ['돼지고기', '고추장', '양파', '대파'], tags: ['고기', '매콤', '한식'] },
  { title: '닭갈비', description: '닭고기와 채소를 고추장 양념에 볶아낸 든든한 메뉴입니다.', category: '한식', cookTime: 35, difficulty: 'medium', servings: 2, ingredients: ['닭고기', '양배추', '고추장', '떡'], tags: ['닭고기', '매콤', '볶음'] },
  { title: '불고기', description: '간장 양념에 재운 소고기를 부드럽게 볶아낸 메뉴입니다.', category: '한식', cookTime: 30, difficulty: 'medium', servings: 2, ingredients: ['소고기', '간장', '양파', '배'], tags: ['소고기', '한식', '메인'] },
  { title: '돼지고기숙주볶음', description: '숙주의 아삭함과 돼지고기의 고소함을 살린 빠른 볶음입니다.', category: '퓨전', cookTime: 18, difficulty: 'easy', servings: 2, ingredients: ['돼지고기', '숙주', '굴소스', '마늘'], tags: ['볶음', '숙주', '자취요리'] },
  { title: '오징어볶음', description: '오징어와 채소를 매콤하게 볶아 밥반찬으로 좋은 메뉴입니다.', category: '한식', cookTime: 25, difficulty: 'medium', servings: 2, ingredients: ['오징어', '양파', '고추장', '대파'], tags: ['해산물', '매콤', '볶음'] },
  { title: '새우볶음밥', description: '새우와 채소를 넣어 고슬고슬하게 볶아낸 볶음밥입니다.', category: '중식', cookTime: 18, difficulty: 'easy', servings: 1, ingredients: ['밥', '새우', '계란', '대파'], tags: ['볶음밥', '새우', '중식'] },
  { title: '마파두부덮밥', description: '두부와 매콤한 소스를 밥 위에 올린 든든한 덮밥입니다.', category: '중식', cookTime: 25, difficulty: 'medium', servings: 2, ingredients: ['두부', '다진 돼지고기', '두반장', '밥'], tags: ['중식', '덮밥', '매콤'] },
  { title: '토마토달걀볶음', description: '토마토와 달걀을 부드럽게 볶아낸 가벼운 반찬입니다.', category: '중식', cookTime: 12, difficulty: 'easy', servings: 1, ingredients: ['토마토', '계란', '대파', '소금'], tags: ['계란', '토마토', '초간단'] },
  { title: '카레라이스', description: '감자와 당근, 고기를 넣어 끓인 기본 카레입니다.', category: '일식', cookTime: 35, difficulty: 'easy', servings: 3, ingredients: ['카레가루', '감자', '당근', '돼지고기'], tags: ['카레', '한그릇', '일식'] },
  { title: '하이라이스', description: '부드러운 데미글라스 풍미를 살린 밥 메뉴입니다.', category: '양식', cookTime: 35, difficulty: 'medium', servings: 3, ingredients: ['하이라이스소스', '양파', '소고기', '밥'], tags: ['한그릇', '양식', '소고기'] },
  { title: '오므라이스', description: '볶음밥을 계란으로 감싸 케첩 소스를 곁들인 메뉴입니다.', category: '일식', cookTime: 25, difficulty: 'medium', servings: 1, ingredients: ['밥', '계란', '양파', '케첩'], tags: ['계란', '볶음밥', '일식'] },
  { title: '돈가스덮밥', description: '돈가스와 계란을 달큰한 소스에 졸여 밥에 올린 메뉴입니다.', category: '일식', cookTime: 25, difficulty: 'medium', servings: 1, ingredients: ['돈가스', '계란', '양파', '밥'], tags: ['덮밥', '일식', '돈가스'] },
  { title: '김치우동', description: '김치의 칼칼함을 더한 따뜻한 우동 한 그릇입니다.', category: '일식', cookTime: 15, difficulty: 'easy', servings: 1, ingredients: ['우동면', '김치', '대파', '어묵'], tags: ['면요리', '김치', '우동'] },
  { title: '라면업그레이드', description: '기본 라면에 계란과 파를 더해 간단히 완성도를 높인 메뉴입니다.', category: '분식', cookTime: 8, difficulty: 'easy', servings: 1, ingredients: ['라면', '계란', '대파', '고추'], tags: ['라면', '초간단', '분식'] },
  { title: '비빔국수', description: '매콤새콤한 양념장에 소면을 비벼 먹는 면 요리입니다.', category: '분식', cookTime: 15, difficulty: 'easy', servings: 1, ingredients: ['소면', '고추장', '오이', '김치'], tags: ['면요리', '매콤', '분식'] },
  { title: '잔치국수', description: '멸치육수와 고명을 올린 따뜻하고 담백한 국수입니다.', category: '분식', cookTime: 25, difficulty: 'medium', servings: 2, ingredients: ['소면', '멸치육수', '애호박', '계란'], tags: ['면요리', '국수', '담백'] },
  { title: '떡볶이', description: '떡과 어묵을 매콤달콤한 양념에 끓인 분식 메뉴입니다.', category: '분식', cookTime: 20, difficulty: 'easy', servings: 2, ingredients: ['떡', '어묵', '고추장', '대파'], tags: ['분식', '매콤', '떡'] },
  { title: '로제떡볶이', description: '크림과 고추장을 섞어 부드럽고 매콤하게 만든 떡볶이입니다.', category: '분식', cookTime: 25, difficulty: 'medium', servings: 2, ingredients: ['떡', '생크림', '고추장', '소시지'], tags: ['분식', '로제', '떡'] },
  { title: '김밥', description: '밥과 다양한 속재료를 김에 말아낸 도시락 메뉴입니다.', category: '분식', cookTime: 35, difficulty: 'hard', servings: 2, ingredients: ['김', '밥', '단무지', '계란'], tags: ['분식', '도시락', '김밥'] },
  { title: '유부초밥', description: '양념한 밥을 유부에 넣어 간단히 만드는 도시락 메뉴입니다.', category: '일식', cookTime: 15, difficulty: 'easy', servings: 2, ingredients: ['유부', '밥', '식초', '깨'], tags: ['도시락', '일식', '초간단'] },
  { title: '알리오올리오', description: '마늘과 올리브오일로 깔끔하게 만드는 기본 파스타입니다.', category: '양식', cookTime: 20, difficulty: 'medium', servings: 1, ingredients: ['스파게티면', '마늘', '올리브오일', '페페론치노'], tags: ['파스타', '양식', '마늘'] },
  { title: '토마토파스타', description: '토마토소스와 면으로 만드는 클래식 파스타입니다.', category: '양식', cookTime: 25, difficulty: 'easy', servings: 1, ingredients: ['스파게티면', '토마토소스', '양파', '마늘'], tags: ['파스타', '토마토', '양식'] },
  { title: '크림파스타', description: '우유와 크림으로 부드럽게 만든 고소한 파스타입니다.', category: '양식', cookTime: 25, difficulty: 'medium', servings: 1, ingredients: ['스파게티면', '우유', '생크림', '베이컨'], tags: ['파스타', '크림', '양식'] },
  { title: '베이컨볶음우동', description: '우동면과 베이컨을 간장 소스에 볶아낸 간단 메뉴입니다.', category: '퓨전', cookTime: 18, difficulty: 'easy', servings: 1, ingredients: ['우동면', '베이컨', '양파', '간장'], tags: ['우동', '볶음', '퓨전'] },
  { title: '닭가슴살샐러드', description: '닭가슴살과 채소로 가볍게 먹는 단백질 샐러드입니다.', category: '샐러드', cookTime: 15, difficulty: 'easy', servings: 1, ingredients: ['닭가슴살', '양상추', '토마토', '드레싱'], tags: ['샐러드', '단백질', '가벼운식사'] },
  { title: '두부샐러드', description: '두부와 신선한 채소를 곁들인 담백한 샐러드입니다.', category: '샐러드', cookTime: 12, difficulty: 'easy', servings: 1, ingredients: ['두부', '양상추', '오이', '참깨드레싱'], tags: ['샐러드', '두부', '채식'] },
  { title: '감자샐러드', description: '삶은 감자와 마요네즈를 섞어 부드럽게 만든 샐러드입니다.', category: '샐러드', cookTime: 25, difficulty: 'easy', servings: 2, ingredients: ['감자', '마요네즈', '오이', '계란'], tags: ['샐러드', '감자', '반찬'] },
  { title: '프렌치토스트', description: '식빵을 계란물에 적셔 구운 달콤한 브런치입니다.', category: '브런치', cookTime: 15, difficulty: 'easy', servings: 1, ingredients: ['식빵', '계란', '우유', '설탕'], tags: ['브런치', '빵', '계란'] },
  { title: '에그마요샌드위치', description: '삶은 계란과 마요네즈를 넣은 간단한 샌드위치입니다.', category: '브런치', cookTime: 18, difficulty: 'easy', servings: 1, ingredients: ['식빵', '계란', '마요네즈', '양상추'], tags: ['샌드위치', '브런치', '계란'] },
  { title: '참치샌드위치', description: '참치와 채소를 넣어 든든하게 먹는 샌드위치입니다.', category: '브런치', cookTime: 15, difficulty: 'easy', servings: 1, ingredients: ['식빵', '참치', '마요네즈', '오이'], tags: ['샌드위치', '참치', '브런치'] },
  { title: '치즈감자전', description: '감자를 갈아 치즈를 넣고 노릇하게 부친 간식입니다.', category: '간식', cookTime: 25, difficulty: 'medium', servings: 2, ingredients: ['감자', '치즈', '전분', '소금'], tags: ['간식', '감자', '치즈'] },
  { title: '콘치즈', description: '옥수수와 치즈를 녹여 만드는 간단한 안주 메뉴입니다.', category: '간식', cookTime: 12, difficulty: 'easy', servings: 2, ingredients: ['옥수수', '치즈', '마요네즈', '버터'], tags: ['간식', '치즈', '안주'] },
  { title: '소시지야채볶음', description: '소시지와 채소를 케첩 소스에 볶아낸 간단 반찬입니다.', category: '반찬', cookTime: 15, difficulty: 'easy', servings: 2, ingredients: ['소시지', '양파', '파프리카', '케첩'], tags: ['반찬', '소시지', '볶음'] },
  { title: '부대찌개', description: '햄과 소시지, 김치를 넣어 끓이는 든든한 찌개입니다.', category: '한식', cookTime: 30, difficulty: 'medium', servings: 3, ingredients: ['햄', '소시지', '김치', '라면사리'], tags: ['찌개', '햄', '한식'] },
  { title: '콩나물국', description: '콩나물을 시원하게 끓인 해장용 국 메뉴입니다.', category: '한식', cookTime: 18, difficulty: 'easy', servings: 2, ingredients: ['콩나물', '대파', '마늘', '국간장'], tags: ['국', '콩나물', '해장'] },
  { title: '북엇국', description: '북어채와 계란을 넣어 담백하게 끓인 국입니다.', category: '한식', cookTime: 25, difficulty: 'easy', servings: 2, ingredients: ['북어채', '계란', '대파', '무'], tags: ['국', '해장', '한식'] },
  { title: '고등어구이', description: '고등어를 노릇하게 구워 밥반찬으로 먹는 메뉴입니다.', category: '한식', cookTime: 20, difficulty: 'easy', servings: 1, ingredients: ['고등어', '소금', '레몬', '식용유'], tags: ['생선', '구이', '한식'] },
  { title: '연어덮밥', description: '연어와 간장 소스를 밥 위에 올린 신선한 덮밥입니다.', category: '일식', cookTime: 15, difficulty: 'easy', servings: 1, ingredients: ['연어', '밥', '간장', '와사비'], tags: ['덮밥', '연어', '일식'] },
  { title: '치킨마요덮밥', description: '남은 치킨을 활용해 달콤짭짤하게 만든 덮밥입니다.', category: '퓨전', cookTime: 15, difficulty: 'easy', servings: 1, ingredients: ['치킨', '밥', '계란', '마요네즈'], tags: ['덮밥', '치킨', '자취요리'] },
  { title: '버섯리조또', description: '버섯과 우유를 넣어 고소하게 끓인 부드러운 리조또입니다.', category: '양식', cookTime: 30, difficulty: 'medium', servings: 1, ingredients: ['쌀', '버섯', '우유', '치즈'], tags: ['리조또', '버섯', '양식'] },
]

export const recipeFixtures: Recipe[] = recipeFixtureSeeds.map((seed, index) => ({
  id: `fixture-recipe-${String(index + 1).padStart(2, '0')}`,
  title: seed.title,
  description: seed.description,
  image: fixtureImages[index % fixtureImages.length],
  cookTime: seed.cookTime,
  difficulty: seed.difficulty,
  servings: seed.servings,
  ingredients: seed.ingredients.map((name, ingredientIndex) => ({
    id: `fixture-recipe-${index + 1}-ingredient-${ingredientIndex + 1}`,
    name,
    amount: ingredientIndex === 0 ? '주재료' : '적당량',
  })),
  steps: [
    `${seed.title}에 필요한 재료를 손질합니다.`,
    '팬이나 냄비를 예열하고 주재료부터 조리합니다.',
    '간을 맞춘 뒤 그릇에 담아 마무리합니다.',
  ],
  stepImages: [],
  likes: 120 + index * 13,
  saves: 45 + index * 7,
  comments: index % 9,
  isLiked: false,
  isSaved: false,
  tags: seed.tags,
  author: seed.category === '한식' ? '찰칵밥상 집밥팀' : '찰칵밥상 레시피팀',
  authorId: `fixture-author-${(index % 5) + 1}`,
  createdAt: `2026-05-${String((index % 28) + 1).padStart(2, '0')}`,
}))

export const recipeFixtureMeta = {
  source: 'frontend-fixture',
  domain: '찰칵밥상 레시피 추천/커뮤니티',
  count: recipeFixtures.length,
  note: '과제 제출 시 프론트에서 로드 가능한 50개 이상의 서비스 도메인 데이터 증빙용 fixture입니다.',
} as const
