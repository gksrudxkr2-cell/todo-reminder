import { useState, useEffect } from 'react'
import type { Task, TaskPatch } from '../../../types/task'
import { getAllTasks, putTask, deleteTaskById } from '../../../lib/db'
import { sortTasks } from '../../../lib/taskUtils'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    getAllTasks().then(loaded => setTasks(sortTasks(loaded)))
  }, [])

  function addTask(task: Task) {
    putTask(task)
    setTasks(prev => sortTasks([task, ...prev]))
  }

  function toggleDone(id: string) {
    setTasks(prev => {
      const target = prev.find(t => t.id === id)
      if (!target) return prev
      const updated = { ...target, done: !target.done }
      putTask(updated)
      return sortTasks(prev.map(t => t.id === id ? updated : t))
    })
  }

  function deleteTask(id: string) {
    deleteTaskById(id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  function updateTask(id: string, patch: TaskPatch) {
    setTasks(prev => {
      const target = prev.find(t => t.id === id)
      if (!target) return prev
      const updated = { ...target, ...patch }
      putTask(updated)
      return sortTasks(prev.map(t => t.id === id ? updated : t))
    })
  }

  return { tasks, addTask, toggleDone, deleteTask, updateTask }
}
