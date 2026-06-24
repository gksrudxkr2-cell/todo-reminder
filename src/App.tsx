import { useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useTasks } from './features/tasks/hooks/useTasks'
import { useDeadlineNotifier } from './features/notifications/hooks/useDeadlineNotifier'
import { TaskForm } from './features/tasks/components/TaskForm'
import { TaskList } from './features/tasks/components/TaskList'
import { NotificationPanel } from './features/notifications/components/NotificationPanel'
import { CheckinFlow } from './features/checkin/components/CheckinFlow'
import { ReviewView } from './features/review/components/ReviewView'
import { ErrorFallback } from './components/ErrorFallback'
import type { Mood, ExecutionStatus } from './types/task'
import './App.css'

type View = 'tasks' | 'review'

export function App() {
  const { tasks, addTask, toggleDone, deleteTask, updateTask, completeTask } = useTasks()
  useDeadlineNotifier(tasks)

  const [view, setView] = useState<View>('tasks')
  const [checkinTaskId, setCheckinTaskId] = useState<string | null>(null)
  const checkinTask = tasks.find(t => t.id === checkinTaskId) ?? null

  function handleCheckinComplete(mood: Mood, actualAmount: number) {
    if (!checkinTask) return
    const originalTarget = checkinTask.originalTarget ?? checkinTask.targetValue
    const status: ExecutionStatus = actualAmount >= originalTarget ? 'done' : 'reduced'
    completeTask(checkinTask.id, { mood, actualAmount, originalTarget, status })
    setCheckinTaskId(null)
  }

  function handleCheckinSkip(mood: Mood) {
    if (!checkinTask) return
    completeTask(checkinTask.id, {
      mood,
      actualAmount: 0,
      originalTarget: checkinTask.originalTarget ?? checkinTask.targetValue,
      status: 'skipped',
    })
    setCheckinTaskId(null)
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
    <div className="app">
      <header className="app-header">
        <div className="app-header__top">
          <h1>{view === 'tasks' ? '할 일 목록' : '회고'}</h1>
          <NotificationPanel />
        </div>
        <nav className="app-nav">
          <button
            className={`app-nav__tab${view === 'tasks' ? ' app-nav__tab--active' : ''}`}
            onClick={() => setView('tasks')}
          >
            할 일
          </button>
          <button
            className={`app-nav__tab${view === 'review' ? ' app-nav__tab--active' : ''}`}
            onClick={() => setView('review')}
          >
            회고
          </button>
        </nav>
      </header>
      {view === 'tasks' ? (
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
              onStart={setCheckinTaskId}
            />
          </section>
        </main>
      ) : (
        <main className="app-main">
          <ReviewView tasks={tasks} />
        </main>
      )}
      {checkinTask && (
        <CheckinFlow
          task={checkinTask}
          onComplete={handleCheckinComplete}
          onSkip={handleCheckinSkip}
          onDismiss={() => setCheckinTaskId(null)}
        />
      )}
    </div>
    </ErrorBoundary>
  )
}
