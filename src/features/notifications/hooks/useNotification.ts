import { useEffect, useState } from 'react';
import {
  getPermission,
  requestPermission,
  type NotifyPermission,
} from '../../../lib/notify';
import { getNotificationsEnabled, setNotificationsEnabled } from '../../../lib/db';

export function useNotification() {
  const [permission, setPermission] = useState<NotifyPermission>(getPermission);
  const [enabled, setEnabled] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getNotificationsEnabled().then(value => {
      if (cancelled) return;
      setEnabled(value);
      setSettingsLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function enable() {
    const result = await requestPermission();
    setPermission(result);
  }

  async function toggleEnabled() {
    const next = !enabled;
    setEnabled(next);
    await setNotificationsEnabled(next);
  }

  return { permission, enable, enabled, settingsLoaded, toggleEnabled };
}
