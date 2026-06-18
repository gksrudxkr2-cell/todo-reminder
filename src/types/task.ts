export type Task = {
  id: string
  title: string
  targetType: 'count' | 'duration'
  targetValue: number
  deadline: string | null
  done: boolean
  createdAt: string
}

export type TaskPatch = Partial<Pick<Task, 'title' | 'targetType' | 'targetValue' | 'deadline'>>
