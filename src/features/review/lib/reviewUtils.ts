import type { Mood, Task } from '../../../types/task'

export type ReviewMode = 'week' | 'month'

export type ReviewStats = {
  total: number
  done: number
  reduced: number
  skipped: number
  executionRate: number
  moodCounts: Record<Mood, number>
  tasks: Task[]
}

export function getWeekRange(anchor: Date): { start: Date; end: Date } {
  const start = new Date(anchor)
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export function getMonthRange(anchor: Date): { start: Date; end: Date } {
  const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1, 0, 0, 0, 0)
  const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

export function navigateAnchor(anchor: Date, mode: ReviewMode, direction: 1 | -1): Date {
  const next = new Date(anchor)
  if (mode === 'week') {
    next.setDate(next.getDate() + direction * 7)
  } else {
    next.setMonth(next.getMonth() + direction)
  }
  return next
}

export function formatPeriodLabel(anchor: Date, mode: ReviewMode): string {
  if (mode === 'month') {
    return anchor.toLocaleString('ko-KR', { year: 'numeric', month: 'long' })
  }
  const { start } = getWeekRange(anchor)
  const year = start.getFullYear()
  const month = start.getMonth() + 1
  const weekNum = Math.ceil(start.getDate() / 7)
  return `${year}년 ${month}월 ${weekNum}주차`
}

export function filterTasksByPeriod(tasks: Task[], anchor: Date, mode: ReviewMode): Task[] {
  const { start, end } = mode === 'week' ? getWeekRange(anchor) : getMonthRange(anchor)
  return tasks.filter(t => {
    if (!t.completedAt) return false
    const d = new Date(t.completedAt)
    return d >= start && d <= end
  })
}

const MOODS: Mood[] = ['burdened', 'tired', 'neutral', 'ready']

export function aggregateTasks(tasks: Task[]): ReviewStats {
  const done = tasks.filter(t => t.status === 'done').length
  const reduced = tasks.filter(t => t.status === 'reduced').length
  const skipped = tasks.filter(t => t.status === 'skipped').length
  const total = tasks.length
  const executionRate = total === 0 ? 0 : Math.round(((done + reduced) / total) * 100)

  const moodCounts = Object.fromEntries(MOODS.map(m => [m, 0])) as Record<Mood, number>
  for (const t of tasks) {
    if (t.mood) moodCounts[t.mood]++
  }

  return { total, done, reduced, skipped, executionRate, moodCounts, tasks }
}

export function getEncouragementMessage(stats: ReviewStats): string {
  if (stats.total === 0) return ''
  if (stats.executionRate === 100 && stats.reduced === 0) return '모든 목표를 완주했어요!'
  if (stats.executionRate === 100) return '힘든 날에도 줄여서라도 해냈어요!'
  if (stats.reduced > 0 && stats.skipped === 0) return '힘든 날에도 줄여서 해냈어요'
  if (stats.reduced > 0 && stats.skipped > 0) return '힘든 날엔 줄이거나 쉬어가면서 해냈어요'
  if (stats.done === stats.total) return '완료한 것들이 쌓이고 있어요'
  if (stats.skipped === stats.total) return '이번엔 쉬어갔어요. 돌아올 때 또 함께해요'
  if (stats.executionRate >= 80) return '아주 잘 해내고 있어요'
  if (stats.executionRate >= 50) return '꾸준히 해나가고 있어요'
  return '한 걸음씩도 충분해요'
}
