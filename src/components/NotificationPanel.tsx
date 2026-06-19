import { useNotification } from '../hooks/useNotification';

export function NotificationPanel() {
  const { permission, enable, test } = useNotification();

  if (permission === 'unsupported') return null;

  if (permission === 'denied') {
    return (
      <div className="notify-panel">
        <p className="notify-panel__denied">
          알림이 차단되었습니다. 브라우저 주소창 왼쪽의 자물쇠 아이콘을 클릭해 알림을 허용해 주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="notify-panel">
      <div className="notify-panel__actions">
        <button
          className="btn-secondary btn-sm"
          onClick={enable}
          disabled={permission === 'granted'}
        >
          {permission === 'granted' ? '알림 켜짐' : '알림 켜기'}
        </button>
        {permission === 'granted' && (
          <button className="btn-secondary btn-sm" onClick={test}>
            테스트 알림
          </button>
        )}
      </div>
    </div>
  );
}
