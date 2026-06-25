import { useState } from 'react'
import type { Task, Mood } from '../../../types/task'
import {
  getNegotiatedTarget,
  getNegotiationMessage,
  getInputConfig,
} from '../lib/negotiationUtils'

type Props = {
  task: Task
  mood: Mood | null
  onComplete: (actualAmount: number) => void
  onSkip: () => void
}

export function NegotiationStep({ task, mood, onComplete, onSkip }: Props) {
  const negotiatedTarget = mood != null
    ? getNegotiatedTarget(task.targetType, task.targetValue, mood)
    : 0
  const inputConfig = getInputConfig(task.targetType, negotiatedTarget)

  const [inputValue, setInputValue] = useState(() => inputConfig.fromStored(negotiatedTarget))

  if (!mood) return null

  const message = getNegotiationMessage(mood, task.targetType, task.targetValue, negotiatedTarget)

  function handleComplete() {
    onComplete(inputConfig.toStored(Math.max(0, inputValue)))
  }

  return (
    <>
      <p className="negotiation-message">{message}</p>
      <div className="negotiation-amount">
        <span className="negotiation-amount__label">실제로 한 양</span>
        <div className="negotiation-amount__input-row">
          <input
            type="number"
            className="negotiation-amount__input"
            value={inputValue}
            min={0}
            onChange={e => setInputValue(Number(e.target.value))}
          />
          <span className="negotiation-amount__unit">{inputConfig.unit}</span>
        </div>
      </div>
      <div className="negotiation-actions">
        <button className="btn-secondary btn-sm" onClick={onSkip}>건너뛰기</button>
        <button className="btn-primary" onClick={handleComplete}>완료</button>
      </div>
    </>
  )
}
