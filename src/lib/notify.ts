import type { Task } from '../types/task';

export type NotifyPermission = 'default' | 'granted' | 'denied' | 'unsupported';

const NOTIFICATION_ICON  = '/icons/notification-icon-192.png';
const NOTIFICATION_BADGE = '/icons/pwa-192x192.png';

async function showNotification(title: string, options: NotificationOptions): Promise<void> {
  const opts = { icon: NOTIFICATION_ICON, badge: NOTIFICATION_BADGE, ...options };
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, opts);
    return;
  }
  new Notification(title, opts);
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
  await showNotification(isOverdue ? '❗ 마감 지남' : '⏰ 마감 임박', {
    body: isOverdue
      ? `${task.title} · 마감이 지났어요. 지금 바로 시작해볼까요?`
      : `${task.title} · 마감이 30분 이내예요!`,
  });
}
