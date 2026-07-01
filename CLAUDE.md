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

## 작업 규칙

### 브라우저 확인

브라우저 확인이 필요할 때는 `npm run dev`로 개발 서버를 띄우고 localhost 주소(`http://localhost:5173`)만 알려준다.
Playwright·curl 등 자동화 도구로 브라우저 동작을 확인하지 않는다 — 브라우저 확인은 사용자가 직접 한다.

### 기능 완성의 정의

기능은 **브라우저에서 끝까지 동작할 때** 완성으로 본다.
데이터 저장뿐 아니라 화면 표시까지 연결되어야 완성이다 — 저장만 되고 UI에 반영되지 않으면 미완성이다.

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

---

## v2 로드맵

### v2 목표

**알림 완성 + 습관 앱 골격(반복·그룹)**

### v2에서 다룰 기능 (6개)

| 번호 | 기능 | 설명 |
|------|------|------|
| ⑧A | 알림 상태 표시 | 알림 허용/거부 상태를 UI에 표시 |
| ⑧B | 알림 ON·OFF | 태스크별 알림 켜기/끄기 |
| ⑤ | 알림 방식 개선 | 알림 트리거·타이밍 UX 개선 |
| ③ | 도발 모드 | 사용자 자극용 메시지 모드 |
| ④ | 반복 + 달력 | RecurrenceRule 구현 + 달력 뷰 |
| ② | 그룹화·머지 | 태스크 그룹핑 및 병합 |

### v3 이월

- ⑥ 디자인 리프레시
- ① 커뮤니티

### 핵심 관문

- **IndexedDB 스키마 마이그레이션** — ② 그룹화와 ④ 반복 기능이 공통으로 스키마 변경을 필요로 함. 두 기능 착수 전에 마이그레이션 전략을 먼저 설계한다.

### v2 작업 원칙

1. **계획 먼저** — 기능 착수 전 설계 확인 후 진행
2. **커밋 전 브라우저 확인** — UI 변경은 반드시 브라우저에서 눈으로 확인
3. **배포 전 `npm run build`** — 빌드 오류 없이 통과해야 배포 가능
4. **작게 쪼개 커밋** — 기능 단위로 잘게 나눠 커밋
5. **곁길 새면 Esc** — 범위 밖 작업이 생기면 즉시 멈추고 확인
