export type Mood = 'burdened' | 'tired' | 'neutral' | 'ready'
export type ExecutionStatus = 'done' | 'reduced' | 'skipped'

export type Task = {
  id: string
  title: string
  targetType: 'count' | 'duration'
  targetValue: number
  deadline: string | null
  done: boolean
  createdAt: string
  mood?: Mood
  originalTarget?: number
  actualAmount?: number
  status?: ExecutionStatus
}

export type TaskPatch = Partial<Pick<Task, 'title' | 'targetType' | 'targetValue' | 'deadline'>>
