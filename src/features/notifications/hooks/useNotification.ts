import { useState } from 'react';
import {
  getPermission,
  requestPermission,
  type NotifyPermission,
} from '../../../lib/notify';

export function useNotification() {
  const [permission, setPermission] = useState<NotifyPermission>(getPermission);

  async function enable() {
    const result = await requestPermission();
    setPermission(result);
  }

  return { permission, enable };
}
