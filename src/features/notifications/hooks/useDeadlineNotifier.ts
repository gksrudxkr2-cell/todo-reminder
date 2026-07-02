import { useEffect, useRef } from 'react';
import type { Task } from '../../../types/task';
import { getPermission, getTasksToNotify, sendDeadlineNotification } from '../../../lib/notify';

const INTERVAL_MS = 30_000;

export function useDeadlineNotifier(
  tasks: Task[],
  notificationsEnabled: boolean,
  settingsLoaded: boolean,
): void {
  const notifiedIds = useRef<Set<string>>(new Set());
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;
  const enabledRef = useRef(notificationsEnabled);
  enabledRef.current = notificationsEnabled;
  const loadedRef = useRef(settingsLoaded);
  loadedRef.current = settingsLoaded;

  useEffect(() => {
    function check() {
      // 설정 로딩이 끝나기 전엔 판단하지 않는다 — 기본값(true)으로
      // 잘못 판단해 알림을 보내는 것을 막기 위함.
      if (!loadedRef.current) return;
      if (!enabledRef.current) return;
      if (getPermission() !== 'granted') return;
      const toNotify = getTasksToNotify(tasksRef.current, notifiedIds.current);
      for (const task of toNotify) {
        sendDeadlineNotification(task);
        notifiedIds.current.add(task.id);
      }
    }

    check();
    const id = setInterval(check, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
}
