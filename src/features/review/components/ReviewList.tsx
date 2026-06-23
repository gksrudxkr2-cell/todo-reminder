import type { Mood, Task } from '../../../types/task'

type Props = { tasks: Task[] }

const MOOD_LABEL: Record<Mood, string> = {
  burdened: '😫 무거움',
  tired: '😴 피곤함',
  neutral: '😐 보통',
  ready: '💪 준비됨',
}

function formatUnit(task: Task): string {
  return task.targetType === 'count' ? '회' : '분'
}

export function ReviewList({ tasks }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="review-empty">
        <p className="review-empty__main">이 기간엔 기록이 없어요</p>
        <p className="review-empty__sub">언제든 시작할 수 있어요 — 오늘부터도 괜찮아요</p>
      </div>
    )
  }

  return (
    <ul className="review-list">
      {tasks.map(task => {
        const u = formatUnit(task)
        return (
          <li key={task.id} className={`review-item review-item--${task.status ?? 'done'}`}>
            <div className="review-item__row">
              <span className="review-item__icon">
                {task.status === 'done' ? '✅' : task.status === 'reduced' ? '🔸' : '⬜'}
              </span>
              <span className="review-item__title">{task.title}</span>
              {task.status === 'done' && (
                <span className="review-item__detail">
                  {task.actualAmount ?? task.targetValue}{u}
                </span>
              )}
              {task.status === 'reduced' && (
                <span className="review-item__detail">
                  원래 {task.originalTarget}{u} → 완료 {task.actualAmount}{u}
                </span>
              )}
              {task.status === 'skipped' && task.mood && (
                <span className="review-item__mood">{MOOD_LABEL[task.mood]}</span>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
