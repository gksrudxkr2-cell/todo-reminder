import { useEffect, useRef } from 'react';
import type { Task } from '../types/task';
import { getPermission, getTasksToNotify, sendDeadlineNotification } from '../lib/notify';

const INTERVAL_MS = 30_000;

export function useDeadlineNotifier(tasks: Task[]): void {
  const notifiedIds = useRef<Set<string>>(new Set());
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  useEffect(() => {
    function check() {
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
