import { describe, it, expect } from 'vitest'
import {
  getWeekRange,
  getMonthRange,
  navigateAnchor,
  formatPeriodLabel,
  filterTasksByPeriod,
  aggregateTasks,
  getEncouragementMessage,
} from '../reviewUtils'
import type { ReviewStats } from '../reviewUtils'
import type { Task } from '../../../../types/task'

function d(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day)
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'test',
    title: '테스트',
    targetType: 'count',
    targetValue: 10,
    deadline: null,
    done: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeStats(overrides: Partial<ReviewStats>): ReviewStats {
  return {
    total: 0,
    done: 0,
    reduced: 0,
    skipped: 0,
    executionRate: 0,
    moodCounts: { burdened: 0, tired: 0, neutral: 0, ready: 0 },
    tasks: [],
    ...overrides,
  }
}

// 2025-06-16 = 월요일, 2025-06-18 = 수요일, 2025-06-22 = 일요일
describe('getWeekRange', () => {
  it('수요일이면 해당 주 월요일~일요일 범위를 반환한다', () => {
    const { start, end } = getWeekRange(d(2025, 6, 18))
    expect(start.getDate()).toBe(16)
    expect(start.getMonth()).toBe(5)
    expect(end.getDate()).toBe(22)
    expect(end.getMonth()).toBe(5)
  })

  it('월요일이면 그 날이 start가 된다', () => {
    const { start } = getWeekRange(d(2025, 6, 16))
    expect(start.getDate()).toBe(16)
  })

  it('일요일이면 6일 전 월요일이 start가 된다', () => {
    const { start } = getWeekRange(d(2025, 6, 22))
    expect(start.getDate()).toBe(16)
  })

  it('start는 00:00:00.000이다', () => {
    const { start } = getWeekRange(d(2025, 6, 18))
    expect(start.getHours()).toBe(0)
    expect(start.getMinutes()).toBe(0)
    expect(start.getMilliseconds()).toBe(0)
  })

  it('end는 23:59:59.999이다', () => {
    const { end } = getWeekRange(d(2025, 6, 18))
    expect(end.getHours()).toBe(23)
    expect(end.getMinutes()).toBe(59)
    expect(end.getSeconds()).toBe(59)
    expect(end.getMilliseconds()).toBe(999)
  })

  it('월을 넘어가는 주도 올바르게 처리한다', () => {
    // 2025-06-30 (월) ~ 2025-07-06 (일)
    const { start, end } = getWeekRange(d(2025, 7, 3))
    expect(start.getMonth()).toBe(5) // 6월
    expect(start.getDate()).toBe(30)
    expect(end.getMonth()).toBe(6) // 7월
    expect(end.getDate()).toBe(6)
  })
})

describe('getMonthRange', () => {
  it('6월이면 1일~30일 범위를 반환한다', () => {
    const { start, end } = getMonthRange(d(2025, 6, 15))
    expect(start.getDate()).toBe(1)
    expect(end.getDate()).toBe(30)
  })

  it('1월이면 1일~31일 범위를 반환한다', () => {
    const { start, end } = getMonthRange(d(2025, 1, 10))
    expect(start.getDate()).toBe(1)
    expect(end.getDate()).toBe(31)
  })

  it('윤년 2월이면 29일이 end가 된다', () => {
    const { end } = getMonthRange(d(2024, 2, 1))
    expect(end.getDate()).toBe(29)
  })

  it('평년 2월이면 28일이 end가 된다', () => {
    const { end } = getMonthRange(d(2025, 2, 1))
    expect(end.getDate()).toBe(28)
  })

  it('start는 00:00:00.000이다', () => {
    const { start } = getMonthRange(d(2025, 6, 15))
    expect(start.getHours()).toBe(0)
    expect(start.getMilliseconds()).toBe(0)
  })

  it('end는 23:59:59.999이다', () => {
    const { end } = getMonthRange(d(2025, 6, 15))
    expect(end.getHours()).toBe(23)
    expect(end.getSeconds()).toBe(59)
    expect(end.getMilliseconds()).toBe(999)
  })
})

describe('navigateAnchor', () => {
  it('week 모드에서 +1은 7일 후다', () => {
    const result = navigateAnchor(d(2025, 6, 18), 'week', 1)
    expect(result.getDate()).toBe(25)
  })

  it('week 모드에서 -1은 7일 전이다', () => {
    const result = navigateAnchor(d(2025, 6, 18), 'week', -1)
    expect(result.getDate()).toBe(11)
  })

  it('month 모드에서 +1은 다음 달이다', () => {
    const result = navigateAnchor(d(2025, 6, 18), 'month', 1)
    expect(result.getMonth()).toBe(6) // 7월
  })

  it('month 모드에서 -1은 이전 달이다', () => {
    const result = navigateAnchor(d(2025, 6, 18), 'month', -1)
    expect(result.getMonth()).toBe(4) // 5월
  })

  it('12월에서 +1 month면 다음 해 1월이 된다', () => {
    const result = navigateAnchor(d(2025, 12, 15), 'month', 1)
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(0) // 1월
  })

  it('원본 Date 객체를 변경하지 않는다', () => {
    const anchor = d(2025, 6, 18)
    navigateAnchor(anchor, 'week', 1)
    expect(anchor.getDate()).toBe(18)
  })
})

describe('formatPeriodLabel', () => {
  it('month 모드는 "YYYY년 M월" 형식으로 반환한다', () => {
    expect(formatPeriodLabel(d(2025, 6, 18), 'month')).toBe('2025년 6월')
  })

  it('week 모드는 "YYYY년 M월 N주차" 형식으로 반환한다', () => {
    // 2025-06-18(수) → 월요일 6/16 → 3주차 (ceil(16/7)=3)
    expect(formatPeriodLabel(d(2025, 6, 18), 'week')).toBe('2025년 6월 3주차')
  })

  it('월의 첫 주는 1주차다', () => {
    // 2025-06-02(월) → 1주차 (ceil(2/7)=1)
    expect(formatPeriodLabel(d(2025, 6, 2), 'week')).toBe('2025년 6월 1주차')
  })

  it('월의 마지막 주 날짜도 올바른 주차를 반환한다', () => {
    // 2025-06-23(월) → 4주차 (ceil(23/7)=4)
    expect(formatPeriodLabel(d(2025, 6, 23), 'week')).toBe('2025년 6월 4주차')
  })
})

describe('filterTasksByPeriod', () => {
  const inWeek = new Date(2025, 5, 18, 12, 0, 0).toISOString() // 6/18 정오
  const beforeWeek = new Date(2025, 5, 15, 12, 0, 0).toISOString() // 6/15 (주 전)
  const afterWeek = new Date(2025, 5, 23, 12, 0, 0).toISOString() // 6/23 (다음 주)

  it('completedAt이 기간 내이면 포함된다', () => {
    const tasks = [makeTask({ id: 'a', completedAt: inWeek })]
    const result = filterTasksByPeriod(tasks, d(2025, 6, 18), 'week')
    expect(result).toHaveLength(1)
  })

  it('completedAt이 기간 밖이면 제외된다', () => {
    const tasks = [
      makeTask({ id: 'before', completedAt: beforeWeek }),
      makeTask({ id: 'after', completedAt: afterWeek }),
    ]
    const result = filterTasksByPeriod(tasks, d(2025, 6, 18), 'week')
    expect(result).toHaveLength(0)
  })

  it('completedAt이 없으면 제외된다', () => {
    const tasks = [makeTask({ id: 'no-date', completedAt: undefined })]
    const result = filterTasksByPeriod(tasks, d(2025, 6, 18), 'week')
    expect(result).toHaveLength(0)
  })

  it('month 모드는 해당 월 전체를 포함한다', () => {
    const earlyJune = new Date(2025, 5, 1, 12, 0, 0).toISOString()
    const lateJune = new Date(2025, 5, 30, 12, 0, 0).toISOString()
    const tasks = [
      makeTask({ id: 'early', completedAt: earlyJune }),
      makeTask({ id: 'late', completedAt: lateJune }),
    ]
    const result = filterTasksByPeriod(tasks, d(2025, 6, 15), 'month')
    expect(result).toHaveLength(2)
  })
})

describe('aggregateTasks', () => {
  it('빈 배열이면 모두 0이다', () => {
    const stats = aggregateTasks([])
    expect(stats.total).toBe(0)
    expect(stats.done).toBe(0)
    expect(stats.reduced).toBe(0)
    expect(stats.skipped).toBe(0)
    expect(stats.executionRate).toBe(0)
  })

  it('상태별 개수를 올바르게 집계한다', () => {
    const tasks = [
      makeTask({ id: '1', status: 'done' }),
      makeTask({ id: '2', status: 'done' }),
      makeTask({ id: '3', status: 'reduced' }),
      makeTask({ id: '4', status: 'skipped' }),
    ]
    const stats = aggregateTasks(tasks)
    expect(stats.total).toBe(4)
    expect(stats.done).toBe(2)
    expect(stats.reduced).toBe(1)
    expect(stats.skipped).toBe(1)
  })

  it('실행률은 (완료+축소완료)/전체 × 100이다', () => {
    const tasks = [
      makeTask({ id: '1', status: 'done' }),
      makeTask({ id: '2', status: 'reduced' }),
      makeTask({ id: '3', status: 'skipped' }),
      makeTask({ id: '4', status: 'skipped' }),
    ]
    const stats = aggregateTasks(tasks)
    expect(stats.executionRate).toBe(50)
  })

  it('전부 완료이면 실행률이 100이다', () => {
    const tasks = [
      makeTask({ id: '1', status: 'done' }),
      makeTask({ id: '2', status: 'done' }),
    ]
    expect(aggregateTasks(tasks).executionRate).toBe(100)
  })

  it('감정 횟수를 올바르게 집계한다', () => {
    const tasks = [
      makeTask({ id: '1', mood: 'ready' }),
      makeTask({ id: '2', mood: 'ready' }),
      makeTask({ id: '3', mood: 'tired' }),
    ]
    const { moodCounts } = aggregateTasks(tasks)
    expect(moodCounts.ready).toBe(2)
    expect(moodCounts.tired).toBe(1)
    expect(moodCounts.burdened).toBe(0)
    expect(moodCounts.neutral).toBe(0)
  })

  it('mood가 없는 태스크는 감정 집계에서 무시된다', () => {
    const tasks = [makeTask({ id: '1', mood: undefined })]
    const { moodCounts } = aggregateTasks(tasks)
    const total = Object.values(moodCounts).reduce((a, b) => a + b, 0)
    expect(total).toBe(0)
  })
})

describe('getEncouragementMessage', () => {
  it('기록이 없으면 빈 문자열을 반환한다', () => {
    expect(getEncouragementMessage(makeStats({ total: 0 }))).toBe('')
  })

  it('전부 완료(축소 없음)이면 완주 메시지를 반환한다', () => {
    const msg = getEncouragementMessage(makeStats({ total: 2, done: 2, executionRate: 100 }))
    expect(msg).toBe('모든 목표를 완주했어요!')
  })

  it('실행률 100%에 축소완료가 있으면 별도 메시지를 반환한다', () => {
    const msg = getEncouragementMessage(makeStats({ total: 2, reduced: 2, executionRate: 100 }))
    expect(msg).toBe('힘든 날에도 줄여서라도 해냈어요!')
  })

  it('축소완료만 있고 건너뜀 없으면 축소 격려 메시지를 반환한다', () => {
    const msg = getEncouragementMessage(makeStats({ total: 2, reduced: 2, skipped: 0, executionRate: 100 }))
    expect(msg).toContain('줄여서')
  })

  it('전부 건너뜀이면 쉬어갔다는 메시지를 반환한다', () => {
    const msg = getEncouragementMessage(makeStats({ total: 2, skipped: 2, executionRate: 0 }))
    expect(msg).toContain('쉬어')
  })

  it('실행률 80% 이상이면 긍정적인 메시지를 반환한다', () => {
    const msg = getEncouragementMessage(makeStats({ total: 5, done: 4, executionRate: 80 }))
    expect(msg.length).toBeGreaterThan(0)
  })

  it('빈 문자열이 아닌 경우 항상 문자열을 반환한다', () => {
    const cases = [20, 50, 80, 100]
    for (const rate of cases) {
      const msg = getEncouragementMessage(makeStats({ total: 10, executionRate: rate }))
      expect(typeof msg).toBe('string')
    }
  })
})
