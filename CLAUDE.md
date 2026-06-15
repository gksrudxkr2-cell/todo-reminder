# todo-reminder

## 스택

- **React 19** + **TypeScript** + **Vite**
- ESLint (vite 기본 설정 기반)

## 폴더 구조

```
todo-reminder/
├── public/          # 정적 에셋 (favicon 등)
├── src/
│   ├── assets/      # 이미지·아이콘 등 번들 에셋
│   ├── components/  # 재사용 UI 컴포넌트
│   ├── hooks/       # 커스텀 훅 (use로 시작)
│   ├── lib/         # 유틸·DB 레이어 (db.ts 등)
│   ├── types/       # 공유 TypeScript 타입 정의
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── vite.config.ts
└── tsconfig.app.json
```

> `components/`, `hooks/`, `lib/`, `types/` 디렉터리는 필요할 때 생성한다.

## 코딩 컨벤션

- **함수형 컴포넌트만 사용** — 클래스 컴포넌트 금지
- **named export만 사용** — `export default` 금지

  ```ts
  // good
  export function TodoItem({ todo }: Props) { ... }

  // bad
  export default function TodoItem() { ... }
  ```

- 파일명은 컴포넌트는 `PascalCase.tsx`, 훅·유틸은 `camelCase.ts`
- props 타입은 파일 상단에 `type Props = { ... }` 로 인라인 선언
- `any` 사용 금지 — `unknown` 또는 명시적 타입으로 대체
- 불필요한 주석 금지 — 코드 자체가 의도를 드러내도록 작성

## 금지사항

| 금지 | 대신 사용 |
|------|-----------|
| `localStorage` | **IndexedDB** (`src/lib/db.ts` 레이어를 통해 접근) |
| `sessionStorage` | 동일 — IndexedDB 또는 React 상태(in-memory) |
| `export default` | named export |
| 클래스 컴포넌트 | 함수형 컴포넌트 |

IndexedDB는 `src/lib/db.ts` 에 래퍼를 두고, 컴포넌트에서 직접 `idb` API를 호출하지 않는다.

## 명령어

```bash
npm run dev      # 개발 서버 (기본 http://localhost:5173)
npm run build    # 프로덕션 빌드 → dist/
npm run preview  # 빌드 결과물 로컬 미리보기
npm run lint     # ESLint 검사
```
