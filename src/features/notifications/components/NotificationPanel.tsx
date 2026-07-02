import { useNotification } from '../hooks/useNotification';

const STATUS_CONFIG = {
  default: { icon: '🔕', label: '알림 켜기' },
  granted: { icon: '🔔', label: '알림 켜짐' },
} as const;

export function NotificationPanel() {
  const { permission, enable } = useNotification();

  if (permission === 'unsupported') return null;

  if (permission === 'denied') {
    return (
      <div className="notify-panel">
        <p className="notify-panel__status notify-panel__status--denied">
          <span aria-hidden="true">⚠️</span> 알림 차단됨 — 브라우저 주소창 왼쪽의 자물쇠 아이콘을 클릭해 알림을 허용해 주세요.
        </p>
      </div>
    );
  }

  const { icon, label } = STATUS_CONFIG[permission];

  return (
    <div className="notify-panel">
      <button
        type="button"
        className={`notify-panel__status notify-panel__status--${permission}`}
        onClick={enable}
        disabled={permission === 'granted'}
      >
        <span aria-hidden="true">{icon}</span> {label}
      </button>
    </div>
  );
}
