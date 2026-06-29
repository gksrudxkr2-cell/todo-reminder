import { useState } from 'react'
import type { Task } from '../../../types/task'

type Props = {
  onAdd: (task: Task) => void
}

export function TaskForm({ onAdd }: Props) {
  const [title, setTitle] = useState('')
  const [targetType, setTargetType] = useState<Task['targetType']>('count')
  const [targetValue, setTargetValue] = useState('1')
  const [deadline, setDeadline] = useState('')

  function handleAdd() {
    if (!title.trim()) return
    onAdd({
      id: crypto.randomUUID(),
      title: title.trim(),
      targetType,
      targetValue: Math.max(1, Number(targetValue) || 1),
      deadline: deadline || null,
      done: false,
      createdAt: new Date().toISOString(),
    })
    setTitle('')
    setTargetValue('1')
    setDeadline('')
  }

  return (
    <form className="task-form" onSubmit={e => { e.preventDefault(); handleAdd() }}>
      <input
        className="task-form__title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="할 일 이름"
      />
      <div className="task-form__row">
        <span className="task-form__label">목표량</span>
        <select
          value={targetType}
          onChange={e => setTargetType(e.target.value as Task['targetType'])}
        >
          <option value="count">횟수</option>
          <option value="duration">분(min)</option>
        </select>
        <input
          type="number"
          className="task-form__number"
          value={targetValue}
          min={1}
          onChange={e => setTargetValue(e.target.value)}
          onBlur={() => setTargetValue(v => String(Math.max(1, Number(v) || 1)))}
        />
      </div>
      <div className="task-form__row">
        <span className="task-form__label">마감</span>
        <input
          type="datetime-local"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
        />
      </div>
      <button type="submit" className="btn-primary">
        + 추가
      </button>
    </form>
  )
}
