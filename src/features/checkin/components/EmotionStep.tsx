import type { Mood } from '../../../types/task'

type Props = {
  taskTitle: string
  onSelect: (mood: Mood) => void
}

const EMOTIONS: Array<{ mood: Mood; emoji: string; label: string }> = [
  { mood: 'burdened', emoji: '😣', label: '부담돼요' },
  { mood: 'tired',    emoji: '😴', label: '지쳤어요' },
  { mood: 'neutral',  emoji: '😐', label: '그냥 그래요' },
  { mood: 'ready',    emoji: '💪', label: '할 만해요' },
]

export function EmotionStep({ taskTitle, onSelect }: Props) {
  return (
    <>
      <div className="checkin-header">
        <p className="checkin-task-title">{taskTitle}</p>
        <p className="checkin-question">지금 어떤 상태예요?</p>
      </div>
      <div className="emotion-grid">
        {EMOTIONS.map(({ mood, emoji, label }) => (
          <button
            key={mood}
            className="emotion-btn"
            onClick={() => onSelect(mood)}
          >
            <span className="emotion-btn__emoji">{emoji}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </>
  )
}
