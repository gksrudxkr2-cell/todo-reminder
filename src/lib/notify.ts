export type NotifyPermission = 'default' | 'granted' | 'denied' | 'unsupported';

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
