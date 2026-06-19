import type { Task } from '../types/task';

export type NotifyPermission = 'default' | 'granted' | 'denied' | 'unsupported';

export const NOTIFY_WINDOW_BEFORE_MS = 30 * 60 * 1000; // 마감 30분 이내
export const NOTIFY_WINDOW_AFTER_MS  = 60 * 60 * 1000; // 마감 후 1시간 이내

export function getPermission(): NotifyPermission {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export async function requestPermission(): Promise<NotifyPermission> {
  if (!('Notification' in window)) return 'unsupported';
  const result = await Notification.requestPermission();
  return result;
}

export function sendTestNotification(): void {
  if (Notification.permission !== 'granted') return;
  new Notification('테스트 알림', {
    body: '알림이 정상적으로 작동하고 있어요!',
    icon: '/favicon.ico',
  });
}

export function getTasksToNotify(
  tasks: Task[],
  notifiedIds: ReadonlySet<string>,
  now: Date = new Date(),
): Task[] {
  const nowMs = now.getTime();
  return tasks.filter(task => {
    if (task.done) return false;
    if (!task.deadline) return false;
    if (notifiedIds.has(task.id)) return false;
    const deadlineMs = new Date(task.deadline).getTime();
    return (
      deadlineMs <= nowMs + NOTIFY_WINDOW_BEFORE_MS &&
      deadlineMs >= nowMs - NOTIFY_WINDOW_AFTER_MS
    );
  });
}

export function sendDeadlineNotification(task: Task): void {
  if (Notification.permission !== 'granted') return;
  const isOverdue = new Date(task.deadline!).getTime() <= Date.now();
  new Notification(isOverdue ? `❗ ${task.title}` : `⏰ ${task.title}`, {
    body: isOverdue
      ? '마감이 지났어요. 지금 바로 시작해볼까요?'
      : '마감이 30분 이내예요!',
    icon: '/favicon.ico',
  });
}
