import { openDB, type IDBPDatabase } from 'idb'
import type { Task } from '../types/task'

const DB_NAME = 'todo-reminder'
const DB_VERSION = 2
const TASK_STORE = 'tasks'
const SETTINGS_STORE = 'settings'

const NOTIFICATIONS_ENABLED_KEY = 'notificationsEnabled'

interface TodoSchema {
  tasks: {
    key: string
    value: Task
  }
  settings: {
    key: string
    value: boolean
  }
}

let dbPromise: Promise<IDBPDatabase<TodoSchema>> | null = null

function getDb(): Promise<IDBPDatabase<TodoSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<TodoSchema>(DB_NAME, DB_VERSION, {
      // oldVersion 기준으로 필요한 스토어만 생성한다 — 이미 있는 스토어와
      // 그 안의 데이터는 절대 건드리지 않는다 (v1 → v2 마이그레이션 예시).
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore(TASK_STORE, { keyPath: 'id' })
        }
        if (oldVersion < 2) {
          db.createObjectStore(SETTINGS_STORE)
        }
      },
      blocked(currentVersion, blockedVersion) {
        console.error('[DB] blocked — 다른 탭이 이전 버전을 잡고 있어 업그레이드가 막힘', { currentVersion, blockedVersion })
      },
      blocking(currentVersion, blockedVersion) {
        console.error('[DB] blocking — 이 탭이 다른 탭의 업그레이드를 막고 있음', { currentVersion, blockedVersion })
      },
      terminated() {
        console.error('[DB] terminated — 브라우저에 의해 연결이 비정상 종료됨')
      },
    })
    // 열기 실패 시 캐시를 비워 다음 호출에서 재시도할 수 있게 한다 —
    // 실패한 프라미스를 계속 재사용하면 이후 모든 DB 호출이 영구히 죽는다.
    dbPromise.catch(err => {
      console.error('[DB] openDB() 실패', err)
      dbPromise = null
    })
  }
  return dbPromise
}

export async function getAllTasks(): Promise<Task[]> {
  try {
    const db = await getDb()
    return await db.getAll(TASK_STORE)
  } catch (err) {
    console.error('[DB] getAllTasks() 실패', err)
    throw err
  }
}

export async function putTask(task: Task): Promise<void> {
  try {
    const db = await getDb()
    await db.put(TASK_STORE, task)
  } catch (err) {
    console.error('[DB] putTask() 실패', { id: task.id }, err)
    throw err
  }
}

export async function deleteTaskById(id: string): Promise<void> {
  const db = await getDb()
  await db.delete(TASK_STORE, id)
}

export async function getNotificationsEnabled(): Promise<boolean> {
  const db = await getDb()
  const value = await db.get(SETTINGS_STORE, NOTIFICATIONS_ENABLED_KEY)
  return value ?? true
}

export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  const db = await getDb()
  await db.put(SETTINGS_STORE, enabled, NOTIFICATIONS_ENABLED_KEY)
}
