import type { Task } from '../types/task'
import { TaskItem } from './TaskItem'

type Props = {
  tasks: Task[]
}

export function TaskList({ tasks }: Props) {
  if (tasks.length === 0) {
    return <p className="task-list__empty">아직 할 일이 없어요. 추가해보세요!</p>
  }

  return (
    <ul className="task-list">
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  )
}
