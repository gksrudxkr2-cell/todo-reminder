import { describe, it, expect } from 'vitest'
import {
  getNegotiatedTarget,
  formatAmount,
  getNegotiationMessage,
  getInputConfig,
} from '../negotiationUtils'

describe('getNegotiatedTarget — count', () => {
  it('부담돼요: 10% ceil', () => {
    expect(getNegotiatedTarget('count', 50, 'burdened')).toBe(5)
  })
  it('부담돼요: 최소 1회', () => {
    expect(getNegotiatedTarget('count', 1, 'burdened')).toBe(1)
    expect(getNegotiatedTarget('count', 3, 'burdened')).toBe(1) // ceil(0.3) = 1
  })
  it('부담돼요: ceil 올림', () => {
    expect(getNegotiatedTarget('count', 7, 'burdened')).toBe(1) // ceil(0.7) = 1
    expect(getNegotiatedTarget('count', 15, 'burdened')).toBe(2) // ceil(1.5) = 2
  })
  it('지쳤어요: 50% ceil', () => {
    expect(getNegotiatedTarget('count', 10, 'tired')).toBe(5)
    expect(getNegotiatedTarget('count', 3, 'tired')).toBe(2) // ceil(1.5) = 2
  })
  it('그냥 그래요: 원래 값', () => {
    expect(getNegotiatedTarget('count', 30, 'neutral')).toBe(30)
  })
  it('할 만해요: 원래 값', () => {
    expect(getNegotiatedTarget('count', 30, 'ready')).toBe(30)
  })
})

describe('getNegotiatedTarget — duration', () => {
  it('부담돼요: 10%, 분수 유지', () => {
    expect(getNegotiatedTarget('duration', 60, 'burdened')).toBeCloseTo(6)
    expect(getNegotiatedTarget('duration', 1, 'burdened')).toBeCloseTo(0.1) // 6초
  })
  it('부담돼요: floor 없음', () => {
    expect(getNegotiatedTarget('duration', 3, 'burdened')).toBeCloseTo(0.3)
  })
  it('지쳤어요: 50%', () => {
    expect(getNegotiatedTarget('duration', 30, 'tired')).toBeCloseTo(15)
  })
  it('그냥 그래요: 원래 값', () => {
    expect(getNegotiatedTarget('duration', 45, 'neutral')).toBe(45)
  })
  it('할 만해요: 원래 값', () => {
    expect(getNegotiatedTarget('duration', 20, 'ready')).toBe(20)
  })
})

describe('formatAmount', () => {
  it('count: n회', () => {
    expect(formatAmount('count', 1)).toBe('1회')
    expect(formatAmount('count', 50)).toBe('50회')
  })
  it('duration: 1분 이상 — 분', () => {
    expect(formatAmount('duration', 1)).toBe('1분')
    expect(formatAmount('duration', 30)).toBe('30분')
  })
  it('duration: 분+초 혼합', () => {
    expect(formatAmount('duration', 1.5)).toBe('1분 30초')
  })
  it('duration: 1분 미만 — 초', () => {
    expect(formatAmount('duration', 0.1)).toBe('6초')
    expect(formatAmount('duration', 0.5)).toBe('30초')
  })
  it('duration: 정확히 0초 경계 (1분)', () => {
    expect(formatAmount('duration', 1)).toBe('1분')
  })
})

describe('getNegotiationMessage', () => {
  it('부담돼요: 원본·축소 목표 포함, 버거울 언급', () => {
    const msg = getNegotiationMessage('burdened', 'count', 50, 5)
    expect(msg).toContain('50회')
    expect(msg).toContain('5회')
    expect(msg).toContain('버거울')
  })
  it('부담돼요: 은/는 파티클 — 분(은)', () => {
    const msg = getNegotiationMessage('burdened', 'duration', 30, 3)
    expect(msg).toContain('30분은')
  })
  it('부담돼요: 은/는 파티클 — 회(는)', () => {
    const msg = getNegotiationMessage('burdened', 'count', 50, 5)
    expect(msg).toContain('50회는')
  })
  it('지쳤어요: 원본·축소 목표 포함', () => {
    const msg = getNegotiationMessage('tired', 'duration', 30, 15)
    expect(msg).toContain('30분')
    expect(msg).toContain('15분')
  })
  it('그냥 그래요: 충분히 언급', () => {
    const msg = getNegotiationMessage('neutral', 'count', 10, 10)
    expect(msg).toContain('충분히')
    expect(msg).toContain('10회')
  })
  it('할 만해요: 완주 언급', () => {
    const msg = getNegotiationMessage('ready', 'count', 20, 20)
    expect(msg).toContain('완주')
    expect(msg).toContain('20회')
  })
})

describe('getInputConfig', () => {
  it('count: unit=회, 변환 없음', () => {
    const c = getInputConfig('count', 10)
    expect(c.unit).toBe('회')
    expect(c.toStored(5)).toBe(5)
    expect(c.fromStored(5)).toBe(5)
  })
  it('duration >= 1분: unit=분, 변환 없음', () => {
    const c = getInputConfig('duration', 30)
    expect(c.unit).toBe('분')
    expect(c.toStored(30)).toBe(30)
    expect(c.fromStored(30)).toBe(30)
  })
  it('duration < 1분: unit=초, 분↔초 변환', () => {
    const c = getInputConfig('duration', 0.1)
    expect(c.unit).toBe('초')
    expect(c.fromStored(0.1)).toBe(6)
    expect(c.toStored(6)).toBeCloseTo(0.1)
  })
  it('duration 경계: 정확히 1분은 분 단위', () => {
    const c = getInputConfig('duration', 1)
    expect(c.unit).toBe('분')
  })
})
