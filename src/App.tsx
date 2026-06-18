import { useState, useEffect } from 'react'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import type { Task, TaskPatch } from './types/task'
import { getAllTasks, putTask, deleteTaskById } from './lib/db'
import { sortTasks } from './lib/taskUtils'
import './App.css'

export function App() {
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>할 일 목록</h1>
      </header>
      <main className="app-main">
        <section className="app-section">
          <h2>새 할 일</h2>
          <TaskForm onAdd={addTask} />
        </section>
        <section className="app-section">
          <h2>목록 ({tasks.length})</h2>
          <TaskList
            tasks={tasks}
            onToggleDone={toggleDone}
            onDelete={deleteTask}
            onUpdate={updateTask}
          />
        </section>
      </main>
    </div>
  )
}
