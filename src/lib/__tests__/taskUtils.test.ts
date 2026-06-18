import { describe, it, expect } from 'vitest'
import { isOverdue, sortTasks } from '../taskUtils'
import type { Task } from '../../types/task'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'test-id',
    title: '테스트',
    targetType: 'count',
    targetValue: 1,
    deadline: null,
    done: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

const PAST = '2020-01-01T00:00:00.000Z'
const FUTURE = '2099-01-01T00:00:00.000Z'

describe('isOverdue', () => {
  it('마감이 없으면 false', () => {
    expect(isOverdue(makeTask({ deadline: null }))).toBe(false)
  })

  it('완료된 할 일은 마감이 지나도 false', () => {
    expect(isOverdue(makeTask({ done: true, deadline: PAST }))).toBe(false)
  })

  it('마감이 미래이면 false', () => {
    expect(isOverdue(makeTask({ deadline: FUTURE }))).toBe(false)
  })

  it('마감이 과거이고 미완료이면 true', () => {
    expect(isOverdue(makeTask({ deadline: PAST }))).toBe(true)
  })

  it('now 파라미터로 기준 시각을 지정할 수 있다', () => {
    const deadline = '2025-06-01T00:00:00.000Z'
    const beforeDeadline = new Date('2025-05-31T00:00:00.000Z')
    const afterDeadline = new Date('2025-06-02T00:00:00.000Z')
    expect(isOverdue(makeTask({ deadline }), beforeDeadline)).toBe(false)
    expect(isOverdue(makeTask({ deadline }), afterDeadline)).toBe(true)
  })
})

describe('sortTasks', () => {
  it('완료된 할 일은 미완료 할 일보다 뒤에 온다', () => {
    const done = makeTask({ id: 'done', done: true, deadline: PAST })
    const undone = makeTask({ id: 'undone', done: false, deadline: FUTURE })
    const [first, second] = sortTasks([done, undone])
    expect(first.id).toBe('undone')
    expect(second.id).toBe('done')
  })

  it('마감이 있는 할 일은 마감 오름차순으로 정렬된다', () => {
    const later = makeTask({ id: 'later', deadline: '2025-12-31T00:00:00.000Z' })
    const sooner = makeTask({ id: 'sooner', deadline: '2025-01-01T00:00:00.000Z' })
    const [first, second] = sortTasks([later, sooner])
    expect(first.id).toBe('sooner')
    expect(second.id).toBe('later')
  })

  it('마감이 없는 할 일은 마감 있는 할 일보다 뒤에 온다', () => {
    const noDeadline = makeTask({ id: 'none', deadline: null })
    const hasDeadline = makeTask({ id: 'has', deadline: FUTURE })
    const [first, second] = sortTasks([noDeadline, hasDeadline])
    expect(first.id).toBe('has')
    expect(second.id).toBe('none')
  })

  it('둘 다 마감이 없으면 순서가 유지된다', () => {
    const a = makeTask({ id: 'a', deadline: null })
    const b = makeTask({ id: 'b', deadline: null })
    const result = sortTasks([a, b])
    expect(result.map(t => t.id)).toEqual(['a', 'b'])
  })

  it('원본 배열을 변경하지 않는다', () => {
    const tasks = [
      makeTask({ id: 'done', done: true }),
      makeTask({ id: 'undone', done: false }),
    ]
    const original = [...tasks]
    sortTasks(tasks)
    expect(tasks.map(t => t.id)).toEqual(original.map(t => t.id))
  })
})
