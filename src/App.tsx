import { useState } from 'react'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import type { Task } from './types/task'
import './App.css'

export function App() {
  const [tasks, setTasks] = useState<Task[]>([])

  function addTask(task: Task) {
    setTasks(prev => [task, ...prev])
  }

  function toggleDone(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  function deleteTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  function updateTask(id: string, patch: Partial<Pick<Task, 'title' | 'targetType' | 'targetValue' | 'deadline'>>) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t))
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
