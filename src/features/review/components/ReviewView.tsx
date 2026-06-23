import type { Task } from '../../../types/task'
import { useReview } from '../hooks/useReview'
import { formatPeriodLabel } from '../lib/reviewUtils'
import { ReviewSummary } from './ReviewSummary'
import { MoodDistribution } from './MoodDistribution'
import { ReviewList } from './ReviewList'
import './review.css'

type Props = { tasks: Task[] }

export function ReviewView({ tasks }: Props) {
  const { mode, switchMode, anchor, navigate, stats } = useReview(tasks)

  return (
    <div className="review">
      <div className="review-tabs">
        <button
          className={`review-tab${mode === 'week' ? ' review-tab--active' : ''}`}
          onClick={() => switchMode('week')}
        >
          주간
        </button>
        <button
          className={`review-tab${mode === 'month' ? ' review-tab--active' : ''}`}
          onClick={() => switchMode('month')}
        >
          월간
        </button>
      </div>

      <div className="review-nav">
        <button className="review-nav__btn" onClick={() => navigate(-1)}>‹</button>
        <span className="review-nav__label">{formatPeriodLabel(anchor, mode)}</span>
        <button className="review-nav__btn" onClick={() => navigate(1)}>›</button>
      </div>

      <ReviewSummary stats={stats} />
      <MoodDistribution stats={stats} />
      <ReviewList tasks={stats.tasks} />
    </div>
  )
}
