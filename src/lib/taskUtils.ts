import type { Task } from '../types/task'

export function isOverdue(task: Task, now = new Date()): boolean {
  return !task.done && !!task.deadline && new Date(task.deadline) < now
}

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    if (!a.deadline && !b.deadline) return 0
    if (!a.deadline) return 1
    if (!b.deadline) return -1
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  })
}
