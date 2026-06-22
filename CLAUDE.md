# todo-reminder

## 언어 규칙

- **모든 응답과 설명은 한국어로 한다.**

## 앱 비전

단순 할 일 체크리스트가 아닌 **행동 변화를 유도하는 실행 습관 앱**이다.

### 핵심 개념

- 할 일(Task)에는 **목표량**(횟수 또는 시간)과 **마감일**을 설정할 수 있다.
- 마감이 다가올수록 앱이 사용자의 **감정 상태**를 먼저 묻는다 ("지금 어떤 상태예요?").
- 감정·상황을 바탕으로 **목표량을 줄여서라도 실행**하도록 유도한다 (예: "오늘은 10분만 해볼까요?").
- "나중에"·"건너뛰기" 대신 **축소된 버전의 완료**를 선택지로 제시해 습관 연속성을 지킨다.
- 장기적으로 **주간·월간 회고 뷰**를 통해 실행 패턴과 감정 추이를 보여준다.

### 데이터 설계 원칙

데이터 구조를 설계할 때 아래 필드를 처음부터 염두에 두어야 한다.

```ts
// Task — 핵심 엔티티
type Task = {
  id: string;
  title: string;
  targetType: 'count' | 'duration';  // 목표 단위
  targetValue: number;               // 횟수 또는 분(min)
  deadline: string | null;           // ISO 날짜
  recurrence: RecurrenceRule | null; // 반복 규칙 (주간·월간 회고용)
  createdAt: string;
};

// Execution — 실행 기록 (회고·통계의 원천)
type Execution = {
  id: string;
  taskId: string;
  scheduledDate: string;
  actualValue: number;               // 실제 수행량 (목표보다 작을 수 있음)
  emotion: EmotionLevel | null;      // 실행 전 감정 ('low' | 'medium' | 'high')
  reducedFrom: number | null;        // 목표량을 줄인 경우 원래 목표값
  completedAt: string | null;
  skipped: boolean;
};
```

- `skipped: true` 레코드는 남기되 UI에서 "건너뜀"으로 표시한다 (삭제 금지 — 회고 데이터).
- 주간·월간 회고는 `Execution` 레코드를 집계해 렌더링하므로 스키마 변경 시 하위 호환을 유지한다.

---

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
