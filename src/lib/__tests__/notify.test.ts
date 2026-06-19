import { describe, it, expect } from 'vitest';
import { getTasksToNotify, NOTIFY_WINDOW_BEFORE_MS, NOTIFY_WINDOW_AFTER_MS } from '../notify';
import type { Task } from '../../types/task';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: '테스트',
    targetType: 'count',
    targetValue: 1,
    deadline: null,
    done: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const NOW = new Date('2025-06-19T12:00:00.000Z');
const nowMs = NOW.getTime();

const IMMINENT   = new Date(nowMs + 15 * 60 * 1000).toISOString();       // 15분 후
const JUST_PASSED = new Date(nowMs - 10 * 60 * 1000).toISOString();      // 10분 전
const LONG_PAST  = new Date(nowMs - NOTIFY_WINDOW_AFTER_MS - 1).toISOString(); // 창 밖(과거)
const FAR_FUTURE = new Date(nowMs + NOTIFY_WINDOW_BEFORE_MS + 1).toISOString(); // 창 밖(미래)

describe('getTasksToNotify', () => {
  it('마감이 없는 할 일은 제외한다', () => {
    expect(getTasksToNotify([makeTask({ deadline: null })], new Set(), NOW)).toHaveLength(0);
  });

  it('완료된 할 일은 제외한다', () => {
    expect(getTasksToNotify([makeTask({ deadline: IMMINENT, done: true })], new Set(), NOW)).toHaveLength(0);
  });

  it('이미 알림을 보낸 할 일은 제외한다', () => {
    const task = makeTask({ id: 'a', deadline: IMMINENT });
    expect(getTasksToNotify([task], new Set(['a']), NOW)).toHaveLength(0);
  });

  it('마감 30분 이내 임박한 미완료 할 일을 반환한다', () => {
    const task = makeTask({ deadline: IMMINENT });
    const result = getTasksToNotify([task], new Set(), NOW);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(task.id);
  });

  it('방금 마감이 지난 미완료 할 일을 반환한다', () => {
    expect(getTasksToNotify([makeTask({ deadline: JUST_PASSED })], new Set(), NOW)).toHaveLength(1);
  });

  it('마감이 지난 지 1시간을 초과한 할 일은 제외한다', () => {
    expect(getTasksToNotify([makeTask({ deadline: LONG_PAST })], new Set(), NOW)).toHaveLength(0);
  });

  it('마감이 30분보다 많이 남은 할 일은 제외한다', () => {
    expect(getTasksToNotify([makeTask({ deadline: FAR_FUTURE })], new Set(), NOW)).toHaveLength(0);
  });

  it('창 경계값: now + 30분 정각은 포함한다', () => {
    const boundary = new Date(nowMs + NOTIFY_WINDOW_BEFORE_MS).toISOString();
    expect(getTasksToNotify([makeTask({ deadline: boundary })], new Set(), NOW)).toHaveLength(1);
  });

  it('창 경계값: now - 1시간 정각은 포함한다', () => {
    const boundary = new Date(nowMs - NOTIFY_WINDOW_AFTER_MS).toISOString();
    expect(getTasksToNotify([makeTask({ deadline: boundary })], new Set(), NOW)).toHaveLength(1);
  });

  it('여러 할 일 중 조건에 맞는 것만 반환한다', () => {
    const tasks = [
      makeTask({ id: 'a', deadline: IMMINENT }),
      makeTask({ id: 'b', deadline: LONG_PAST }),
      makeTask({ id: 'c', deadline: FAR_FUTURE }),
      makeTask({ id: 'd', deadline: JUST_PASSED }),
      makeTask({ id: 'e', deadline: IMMINENT, done: true }),
    ];
    const result = getTasksToNotify(tasks, new Set(), NOW);
    expect(result.map(t => t.id)).toEqual(['a', 'd']);
  });

  it('알림 보낸 ID를 추가하면 다음 호출에서 제외된다', () => {
    const task = makeTask({ id: 'x', deadline: IMMINENT });
    const notifiedIds = new Set<string>();

    const first = getTasksToNotify([task], notifiedIds, NOW);
    expect(first).toHaveLength(1);

    notifiedIds.add('x');
    const second = getTasksToNotify([task], notifiedIds, NOW);
    expect(second).toHaveLength(0);
  });
});
