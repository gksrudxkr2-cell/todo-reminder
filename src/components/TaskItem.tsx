import type { Task } from '../types/task'

type Props = {
  task: Task
}

function formatTarget(task: Task): string {
  return task.targetType === 'count'
    ? `${task.targetValue}회`
    : `${task.targetValue}분`
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return '마감 없음'
  return new Date(deadline).toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function TaskItem({ task }: Props) {
  return (
    <li className="task-item">
      <span className="task-item__title">{task.title}</span>
      <span className="task-item__target">{formatTarget(task)}</span>
      <span className="task-item__deadline">{formatDeadline(task.deadline)}</span>
    </li>
  )
}
