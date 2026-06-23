import type { ReviewStats } from '../lib/reviewUtils'
import { getEncouragementMessage } from '../lib/reviewUtils'

type Props = { stats: ReviewStats }

export function ReviewSummary({ stats }: Props) {
  const { total, done, reduced, skipped, executionRate } = stats
  const message = getEncouragementMessage(stats)

  return (
    <div className="review-summary">
      <div className="review-summary__cards">
        <div className="review-summary__card review-summary__card--done">
          <span className="review-summary__count">{done}</span>
          <span className="review-summary__label">완료</span>
        </div>
        <div className="review-summary__card review-summary__card--reduced">
          <span className="review-summary__count">{reduced}</span>
          <span className="review-summary__label">축소완료</span>
        </div>
        <div className="review-summary__card review-summary__card--skipped">
          <span className="review-summary__count">{skipped}</span>
          <span className="review-summary__label">건너뜀</span>
        </div>
      </div>
      {total > 0 && (
        <div className="review-summary__rate-row">
          <span className="review-summary__rate">{executionRate}%</span>
          {message && <span className="review-summary__encouragement">{message}</span>}
        </div>
      )}
    </div>
  )
}
