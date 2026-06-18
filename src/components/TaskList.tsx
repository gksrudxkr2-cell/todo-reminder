import type { Task, TaskPatch } from '../types/task'
import { TaskItem } from './TaskItem'

type Props = {
  tasks: Task[]
  onToggleDone: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, patch: TaskPatch) => void
}

export function TaskList({ tasks, onToggleDone, onDelete, onUpdate }: Props) {
  if (tasks.length === 0) {
    return <p className="task-list__empty">아직 할 일이 없어요. 추가해보세요!</p>
  }

  return (
    <ul className="task-list">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleDone={onToggleDone}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </ul>
  )
}
