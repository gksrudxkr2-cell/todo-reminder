import { useState, useEffect } from 'react'
import type { Task, TaskPatch, Mood, ExecutionStatus } from '../../../types/task'
import { getAllTasks, putTask, deleteTaskById } from '../../../lib/db'
import { sortTasks } from '../../../lib/taskUtils'

type ExecutionResult = {
  mood: Mood
  actualAmount: number
  originalTarget: number
  status: ExecutionStatus
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  // G-1: render 중 re-throw → 상위 ErrorBoundary가 처리
  if (loadError) throw loadError

  useEffect(() => {
    getAllTasks()
      .then(loaded => setTasks(sortTasks(loaded)))
      .catch(err => setLoadError(err instanceof Error ? err : new Error(String(err))))
  }, [])

  function addTask(task: Task) {
    setTasks(prev => sortTasks([task, ...prev]))
    putTask(task).catch(() => {
      setTasks(prev => prev.filter(t => t.id !== task.id))
      setSaveError('할 일을 저장하지 못했습니다. 다시 시도해 주세요.')
    })
  }

  function toggleDone(id: string) {
    const target = tasks.find(t => t.id === id)
    if (!target) return
    const updated = { ...target, done: !target.done }
    setTasks(prev => sortTasks(prev.map(t => t.id === id ? updated : t)))
    putTask(updated).catch(() => {
      setTasks(prev => sortTasks(prev.map(t => t.id === id ? target : t)))
      setSaveError('저장에 실패했습니다. 변경 사항이 유지되지 않을 수 있습니다.')
    })
  }

  function deleteTask(id: string) {
    const target = tasks.find(t => t.id === id)
    setTasks(prev => prev.filter(t => t.id !== id))
    deleteTaskById(id).catch(() => {
      if (target) setTasks(prev => sortTasks([target, ...prev]))
      setSaveError('삭제에 실패했습니다. 다시 시도해 주세요.')
    })
  }

  function updateTask(id: string, patch: TaskPatch) {
    const target = tasks.find(t => t.id === id)
    if (!target) return
    const updated = { ...target, ...patch }
    setTasks(prev => sortTasks(prev.map(t => t.id === id ? updated : t)))
    putTask(updated).catch(() => {
      setTasks(prev => sortTasks(prev.map(t => t.id === id ? target : t)))
      setSaveError('저장에 실패했습니다. 변경 사항이 유지되지 않을 수 있습니다.')
    })
  }

  function completeTask(id: string, result: ExecutionResult) {
    const target = tasks.find(t => t.id === id)
    if (!target) return
    const done = result.status !== 'skipped'
    const updated: Task = {
      ...target,
      done,
      completedAt: new Date().toISOString(),
      mood: result.mood,
      actualAmount: result.actualAmount,
      originalTarget: result.originalTarget,
      status: result.status,
    }
    setTasks(prev => sortTasks(prev.map(t => t.id === id ? updated : t)))
    putTask(updated).catch(() => {
      setTasks(prev => sortTasks(prev.map(t => t.id === id ? target : t)))
      setSaveError('저장에 실패했습니다. 변경 사항이 유지되지 않을 수 있습니다.')
    })
  }

  return {
    tasks,
    addTask,
    toggleDone,
    deleteTask,
    updateTask,
    completeTask,
    saveError,
    clearSaveError: () => setSaveError(null),
  }
}
