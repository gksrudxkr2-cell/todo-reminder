import { openDB, type IDBPDatabase } from 'idb'
import type { Task } from '../types/task'

const DB_NAME = 'todo-reminder'
const DB_VERSION = 1
const STORE = 'tasks'

interface TodoSchema {
  tasks: {
    key: string
    value: Task
  }
}

let dbPromise: Promise<IDBPDatabase<TodoSchema>> | null = null

function getDb(): Promise<IDBPDatabase<TodoSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<TodoSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

export async function getAllTasks(): Promise<Task[]> {
  const db = await getDb()
  return db.getAll(STORE)
}

export async function putTask(task: Task): Promise<void> {
  const db = await getDb()
  await db.put(STORE, task)
}

export async function deleteTaskById(id: string): Promise<void> {
  const db = await getDb()
  await db.delete(STORE, id)
}
