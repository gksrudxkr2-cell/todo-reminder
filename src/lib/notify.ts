import type { Task } from '../types/task';

export type NotifyPermission = 'default' | 'granted' | 'denied' | 'unsupported';

async function showNotification(title: string, options: NotificationOptions): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, options);
    return;
  }
  new Notification(title, options);
}

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

export async function sendTestNotification(): Promise<void> {
  if (Notification.permission !== 'granted') return;
  await showNotification('테스트 알림', {
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

export async function sendDeadlineNotification(task: Task): Promise<void> {
  if (Notification.permission !== 'granted') return;
  const isOverdue = new Date(task.deadline!).getTime() <= Date.now();
  await showNotification(isOverdue ? `❗ ${task.title}` : `⏰ ${task.title}`, {
    body: isOverdue
      ? '마감이 지났어요. 지금 바로 시작해볼까요?'
      : '마감이 30분 이내예요!',
    icon: '/favicon.ico',
  });
}
