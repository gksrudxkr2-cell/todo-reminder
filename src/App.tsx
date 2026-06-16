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
          <TaskList tasks={tasks} />
        </section>
      </main>
    </div>
  )
}
