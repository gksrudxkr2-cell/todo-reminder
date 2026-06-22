import { useState } from 'react'
import type { Task, Mood } from '../../../types/task'
import { EmotionStep } from './EmotionStep'
import { NegotiationStep } from '../../negotiation/components/NegotiationStep'
import './checkin.css'

type Props = {
  task: Task
  onComplete: (mood: Mood, actualAmount: number) => void
  onSkip: (mood: Mood) => void
  onDismiss: () => void
}

export function CheckinFlow({ task, onComplete, onSkip, onDismiss }: Props) {
  const [mood, setMood] = useState<Mood | null>(null)

  function handleEmotionSelect(selected: Mood) {
    setMood(selected)
  }

  function handleComplete(actualAmount: number) {
    if (!mood) return
    onComplete(mood, actualAmount)
  }

  function handleSkip() {
    if (!mood) return
    onSkip(mood)
  }

  return (
    <div className="checkin-overlay" onClick={onDismiss}>
      <div className="checkin-card" onClick={e => e.stopPropagation()}>
        {!mood ? (
          <EmotionStep taskTitle={task.title} onSelect={handleEmotionSelect} />
        ) : (
          <NegotiationStep
            task={task}
            mood={mood}
            onComplete={handleComplete}
            onSkip={handleSkip}
          />
        )}
      </div>
    </div>
  )
}
