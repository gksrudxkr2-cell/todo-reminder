import { useState } from 'react'
import type { Mood, Task, TaskPatch } from '../../../types/task'
import { isOverdue } from '../../../lib/taskUtils'

type Props = {
  task: Task
  onToggleDone: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, patch: TaskPatch) => void
  onStart: (id: string) => void
}

const MOOD_LABEL: Record<Mood, string> = {
  burdened: '😫 무거움',
  tired: '😴 피곤함',
  neutral: '😐 보통',
  ready: '💪 준비됨',
}

function unit(task: Task): string {
  return task.targetType === 'count' ? '회' : '분'
}

function formatTarget(task: Task): string {
  return `${task.targetValue}${unit(task)}`
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return '마감 없음'
  return new Date(deadline).toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function TaskItem({ task, onToggleDone, onDelete, onUpdate, onStart }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editTargetType, setEditTargetType] = useState<Task['targetType']>(task.targetType)
  const [editTargetValue, setEditTargetValue] = useState(task.targetValue)
  const [editDeadline, setEditDeadline] = useState(task.deadline ?? '')

  function startEdit() {
    setEditTitle(task.title)
    setEditTargetType(task.targetType)
    setEditTargetValue(task.targetValue)
    setEditDeadline(task.deadline ?? '')
    setIsEditing(true)
  }

  function saveEdit() {
    if (!editTitle.trim()) return
    onUpdate(task.id, {
      title: editTitle.trim(),
      targetType: editTargetType,
      targetValue: editTargetValue,
      deadline: editDeadline || null,
    })
    setIsEditing(false)
  }

  function cancelEdit() {
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <li className="task-item task-item--editing">
        <input
          className="task-item__edit-title"
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') saveEdit()
            if (e.key === 'Escape') cancelEdit()
          }}
          autoFocus
        />
        <div className="task-item__edit-row">
          <select
            value={editTargetType}
            onChange={e => setEditTargetType(e.target.value as Task['targetType'])}
          >
            <option value="count">횟수</option>
            <option value="duration">분(min)</option>
          </select>
          <input
            type="number"
            className="task-form__number"
            value={editTargetValue}
            min={1}
            onChange={e => setEditTargetValue(Math.max(1, Number(e.target.value)))}
          />
          <input
            type="datetime-local"
            value={editDeadline}
            onChange={e => setEditDeadline(e.target.value)}
          />
        </div>
        <div className="task-item__edit-actions">
          <button className="btn-primary btn-sm" onClick={saveEdit}>저장</button>
          <button className="btn-secondary btn-sm" onClick={cancelEdit}>취소</button>
        </div>
      </li>
    )
  }

  const overdue = isOverdue(task)

  if (task.status === 'reduced') {
    const u = unit(task)
    return (
      <li className="task-item task-item--reduced" onDoubleClick={startEdit}>
        <div className="task-item__row">
          <input
            type="checkbox"
            className="task-item__checkbox"
            checked={task.done}
            onChange={() => onToggleDone(task.id)}
            onDoubleClick={e => e.stopPropagation()}
          />
          <span className="task-item__title task-item__title--done">{task.title}</span>
          <span className="task-item__reduced-badge">축소 완료</span>
          <button
            className="task-item__delete"
            onClick={() => onDelete(task.id)}
            onDoubleClick={e => e.stopPropagation()}
            title="삭제"
          >
            ✕
          </button>
        </div>
        <div className="task-item__reduced-detail">
          <span>원래 {task.originalTarget}{u} → 완료 {task.actualAmount}{u}</span>
          {task.mood && (
            <span className="task-item__reduced-mood">{MOOD_LABEL[task.mood]}</span>
          )}
        </div>
      </li>
    )
  }

  return (
    <li
      className={`task-item${task.done ? ' task-item--done' : ''}${overdue ? ' task-item--overdue' : ''}`}
      onDoubleClick={startEdit}
    >
      <input
        type="checkbox"
        className="task-item__checkbox"
        checked={task.done}
        onChange={() => onToggleDone(task.id)}
        onDoubleClick={e => e.stopPropagation()}
      />
      <span className="task-item__title">{task.title}</span>
      <span className="task-item__target">{formatTarget(task)}</span>
      <span className="task-item__deadline">{formatDeadline(task.deadline)}</span>
      {!task.done && (
        <button
          className="task-item__start"
          onClick={e => { e.stopPropagation(); onStart(task.id) }}
          onDoubleClick={e => e.stopPropagation()}
        >
          시작하기
        </button>
      )}
      <button
        className="task-item__delete"
        onClick={() => onDelete(task.id)}
        onDoubleClick={e => e.stopPropagation()}
        title="삭제"
      >
        ✕
      </button>
    </li>
  )
}
