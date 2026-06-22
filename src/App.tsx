import { useTasks } from './features/tasks/hooks/useTasks'
import { useDeadlineNotifier } from './features/notifications/hooks/useDeadlineNotifier'
import { TaskForm } from './features/tasks/components/TaskForm'
import { TaskList } from './features/tasks/components/TaskList'
import { NotificationPanel } from './features/notifications/components/NotificationPanel'
import './App.css'

export function App() {
  const { tasks, addTask, toggleDone, deleteTask, updateTask } = useTasks()
  useDeadlineNotifier(tasks)

  return (
    <div className="app">
      <header className="app-header">
        <h1>할 일 목록</h1>
        <NotificationPanel />
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
