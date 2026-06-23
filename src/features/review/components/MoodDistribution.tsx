import type { Mood } from '../../../types/task'
import type { ReviewStats } from '../lib/reviewUtils'

type Props = { stats: ReviewStats }

const MOOD_CONFIG: { key: Mood; emoji: string; label: string }[] = [
  { key: 'burdened', emoji: '😫', label: '무거움' },
  { key: 'tired', emoji: '😴', label: '피곤함' },
  { key: 'neutral', emoji: '😐', label: '보통' },
  { key: 'ready', emoji: '💪', label: '준비됨' },
]

export function MoodDistribution({ stats }: Props) {
  const hasMood = Object.values(stats.moodCounts).some(v => v > 0)
  if (!hasMood) return null

  return (
    <div className="mood-dist">
      <p className="mood-dist__label">실행 전 감정</p>
      <div className="mood-dist__grid">
        {MOOD_CONFIG.map(({ key, emoji, label }) => (
          <div key={key} className="mood-dist__item">
            <span className="mood-dist__emoji">{emoji}</span>
            <span className="mood-dist__count">{stats.moodCounts[key]}</span>
            <span className="mood-dist__name">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
