import type { NotifyPermission } from '../../../lib/notify';

type Props = {
  permission: NotifyPermission;
  enable: () => void;
  enabled: boolean;
  settingsLoaded: boolean;
  toggleEnabled: () => void;
};

const STATUS_CONFIG = {
  default: { icon: '🔕', label: '알림 켜기' },
  granted: { icon: '🔔', label: '알림 켜짐' },
} as const;

export function NotificationPanel({ permission, enable, enabled, settingsLoaded, toggleEnabled }: Props) {
  if (permission === 'unsupported') return null;

  return (
    <div className="notify-panel">
      <div className="notify-panel__row">
        {permission === 'denied' ? (
          <p className="notify-panel__status notify-panel__status--denied">
            <span aria-hidden="true">⚠️</span> 알림 차단됨 — 브라우저 주소창 왼쪽의 자물쇠 아이콘을 클릭해 알림을 허용해 주세요.
          </p>
        ) : (
          <button
            type="button"
            className={`notify-panel__status notify-panel__status--${permission}`}
            onClick={enable}
            disabled={permission === 'granted'}
          >
            <span aria-hidden="true">{STATUS_CONFIG[permission].icon}</span> {STATUS_CONFIG[permission].label}
          </button>
        )}
        <label className={`notify-toggle${settingsLoaded ? '' : ' notify-toggle--loading'}`}>
          <input
            type="checkbox"
            checked={enabled}
            disabled={!settingsLoaded}
            onChange={toggleEnabled}
          />
          <span className="notify-toggle__track" aria-hidden="true" />
          <span className="notify-toggle__label">태스크 알림</span>
        </label>
      </div>
    </div>
  );
}
