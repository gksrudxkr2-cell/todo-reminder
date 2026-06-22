import type { Mood } from '../../../types/task'

type TargetType = 'count' | 'duration'

export function getNegotiatedTarget(
  targetType: TargetType,
  targetValue: number,
  mood: Mood
): number {
  if (mood === 'neutral' || mood === 'ready') return targetValue

  const ratio = mood === 'burdened' ? 0.1 : 0.5

  if (targetType === 'count') {
    return Math.max(1, Math.ceil(targetValue * ratio))
  }
  return targetValue * ratio
}

export function formatAmount(targetType: TargetType, amount: number): string {
  if (targetType === 'count') return `${amount}회`

  const totalSeconds = Math.round(amount * 60)
  if (totalSeconds < 60) return `${totalSeconds}초`
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (seconds === 0) return `${minutes}분`
  return `${minutes}분 ${seconds}초`
}

function eunNeun(text: string): '은' | '는' {
  const code = text.charCodeAt(text.length - 1)
  if (code >= 0xac00 && code <= 0xd7a3) {
    return (code - 0xac00) % 28 === 0 ? '는' : '은'
  }
  return '은'
}

export function getNegotiationMessage(
  mood: Mood,
  targetType: TargetType,
  originalValue: number,
  negotiatedValue: number
): string {
  const orig = formatAmount(targetType, originalValue)
  const neg = formatAmount(targetType, negotiatedValue)

  switch (mood) {
    case 'burdened':
      return `${orig}${eunNeun(orig)} 버거울 수 있어요.\n${neg}만 해볼까요?`
    case 'tired':
      return `${orig}${eunNeun(orig)} 많을 수 있어요.\n${neg}부터 시작해볼까요?`
    case 'neutral':
      return `지금 상태로도 충분히 할 수 있어요!\n${orig} 해봐요.`
    case 'ready':
      return `좋아요! 오늘은 ${orig} 완주해봐요 💪`
  }
}

export type InputConfig = {
  unit: '초' | '분' | '회'
  toStored: (displayValue: number) => number
  fromStored: (storedValue: number) => number
}

export function getInputConfig(targetType: TargetType, negotiatedValue: number): InputConfig {
  if (targetType === 'count') {
    return { unit: '회', toStored: v => v, fromStored: v => v }
  }
  if (negotiatedValue < 1) {
    return {
      unit: '초',
      toStored: v => v / 60,
      fromStored: v => Math.round(v * 60),
    }
  }
  return { unit: '분', toStored: v => v, fromStored: v => v }
}
