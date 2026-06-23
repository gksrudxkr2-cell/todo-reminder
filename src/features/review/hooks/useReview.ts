import { useState, useMemo } from 'react'
import type { Task } from '../../../types/task'
import type { ReviewMode, ReviewStats } from '../lib/reviewUtils'
import { filterTasksByPeriod, aggregateTasks, navigateAnchor } from '../lib/reviewUtils'

export function useReview(tasks: Task[]) {
  const [mode, setMode] = useState<ReviewMode>('week')
  const [anchor, setAnchor] = useState(() => new Date())

  const periodTasks = useMemo(
    () => filterTasksByPeriod(tasks, anchor, mode),
    [tasks, anchor, mode]
  )

  const stats: ReviewStats = useMemo(() => aggregateTasks(periodTasks), [periodTasks])

  function navigate(direction: 1 | -1) {
    setAnchor(prev => navigateAnchor(prev, mode, direction))
  }

  function switchMode(next: ReviewMode) {
    setMode(next)
    setAnchor(new Date())
  }

  return { mode, switchMode, anchor, navigate, stats }
}
