/**
 * Утилиты для работы с локальным хранилищем (localStorage).
 *
 * Используются когда пользователь не авторизован.
 * Данные хранятся в формате JSON массивов с localId вместо id.
 */

import type { LocalPage, LocalList, LocalTask } from '@todo-app/shared';

export const STORAGE_KEYS = {
  PAGES: 'todo_local_pages',
  LISTS: 'todo_local_lists',
  TASKS: 'todo_local_tasks',
} as const;

// ==================== Helpers ====================

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

function getItem<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setItem<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ==================== Pages ====================

export function getLocalPages(): LocalPage[] {
  return getItem<LocalPage>(STORAGE_KEYS.PAGES);
}

export function createLocalPage(title: string): LocalPage {
  const pages = getLocalPages();
  const page: LocalPage = {
    localId: generateId(),
    title,
    createdAt: now(),
    updatedAt: now(),
  };
  setItem(STORAGE_KEYS.PAGES, [page, ...pages]);
  return page;
}

export function updateLocalPage(id: string, title: string): void {
  const pages = getLocalPages();
  const index = pages.findIndex((p) => p.localId === id);
  if (index !== -1) {
    pages[index] = { ...pages[index], title, updatedAt: now() };
    setItem(STORAGE_KEYS.PAGES, pages);
  }
}

export function deleteLocalPage(id: string): void {
  const pages = getLocalPages().filter((p) => p.localId !== id);
  setItem(STORAGE_KEYS.PAGES, pages);

  // Cascade delete: remove all lists and tasks for this page
  const lists = getItem<LocalList>(STORAGE_KEYS.LISTS).filter(
    (l) => l.pageId !== id
  );
  setItem(STORAGE_KEYS.LISTS, lists);

  const tasks = getItem<LocalTask>(STORAGE_KEYS.TASKS);
  const listIds = new Set(
    getItem<LocalList>(STORAGE_KEYS.LISTS).map((l) => l.localId)
  );
  const filteredTasks = tasks.filter((t) => !listIds.has(t.listId));
  setItem(STORAGE_KEYS.TASKS, filteredTasks);
}

// ==================== Lists ====================

export function getLocalLists(pageId: string): LocalList[] {
  return getItem<LocalList>(STORAGE_KEYS.LISTS).filter(
    (l) => l.pageId === pageId
  );
}

export function createLocalList(title: string, pageId: string): LocalList {
  const lists = getLocalLists(pageId);
  const maxOrder = lists.reduce(
    (max, l) => (l.order > max ? l.order : max),
    -1
  );

  const list: LocalList = {
    localId: generateId(),
    title,
    pageId,
    order: maxOrder + 1,
    createdAt: now(),
    updatedAt: now(),
  };

  const allLists = getItem<LocalList>(STORAGE_KEYS.LISTS);
  setItem(STORAGE_KEYS.LISTS, [...allLists, list]);
  return list;
}

export function updateLocalList(
  id: string,
  data: { title?: string; order?: number }
): void {
  const allLists = getItem<LocalList>(STORAGE_KEYS.LISTS);
  const index = allLists.findIndex((l) => l.localId === id);
  if (index !== -1) {
    allLists[index] = {
      ...allLists[index],
      ...data,
      updatedAt: now(),
    };
    setItem(STORAGE_KEYS.LISTS, allLists);
  }
}

export function deleteLocalList(id: string): void {
  const allLists = getItem<LocalList>(STORAGE_KEYS.LISTS).filter(
    (l) => l.localId !== id
  );
  setItem(STORAGE_KEYS.LISTS, allLists);

  // Cascade delete: remove all tasks for this list
  const tasks = getItem<LocalTask>(STORAGE_KEYS.TASKS).filter(
    (t) => t.listId !== id
  );
  setItem(STORAGE_KEYS.TASKS, tasks);
}

// ==================== Tasks ====================

export function getLocalTasks(listId: string): LocalTask[] {
  return getItem<LocalTask>(STORAGE_KEYS.TASKS).filter(
    (t) => t.listId === listId
  );
}

export function createLocalTask(
  title: string,
  listId: string,
  description?: string
): LocalTask {
  const tasks = getLocalTasks(listId);
  const maxOrder = tasks.reduce(
    (max, t) => (t.order > max ? t.order : max),
    -1
  );

  const task: LocalTask = {
    localId: generateId(),
    title,
    description,
    completed: false,
    listId,
    order: maxOrder + 1,
    createdAt: now(),
    updatedAt: now(),
  };

  const allTasks = getItem<LocalTask>(STORAGE_KEYS.TASKS);
  setItem(STORAGE_KEYS.TASKS, [...allTasks, task]);
  return task;
}

export function updateLocalTask(
  id: string,
  data: Partial<LocalTask>
): void {
  const allTasks = getItem<LocalTask>(STORAGE_KEYS.TASKS);
  const index = allTasks.findIndex((t) => t.localId === id);
  if (index !== -1) {
    allTasks[index] = { ...allTasks[index], ...data, updatedAt: now() };
    setItem(STORAGE_KEYS.TASKS, allTasks);
  }
}

export function deleteLocalTask(id: string): void {
  const tasks = getItem<LocalTask>(STORAGE_KEYS.TASKS).filter(
    (t) => t.localId !== id
  );
  setItem(STORAGE_KEYS.TASKS, tasks);
}

// ==================== Get All (unfiltered) ====================

export function getAllLocalLists(): LocalList[] {
  return getItem<LocalList>(STORAGE_KEYS.LISTS);
}

export function getAllLocalTasks(): LocalTask[] {
  return getItem<LocalTask>(STORAGE_KEYS.TASKS);
}

// ==================== Sync Helpers ====================

/**
 * Sync local items to server and return mapping localId → serverId.
 *
 * @param localItems - Array of local items with localId
 * @param serverItems - Array of server items (for deduplication)
 * @param localKey - Storage key to read from
 * @param createFn - Async function to create item on server
 * @returns Record mapping localId → serverId
 */
export async function syncLocalToServer<T extends { localId: string }>(
  localItems: T[],
  serverItems: { id: string }[],
  localKey: string,
  createFn: (item: Omit<T, 'localId' | 'createdAt' | 'updatedAt'>) => Promise<{ id: string }>
): Promise<Record<string, string>> {
  const mapping: Record<string, string> = {};
  const serverIds = new Set(serverItems.map((item) => item.id));

  for (const localItem of localItems) {
    // Skip if this item was already synced (exists on server)
    if (serverIds.has(localItem.localId)) continue;

    const { id } = await createFn({
      title: localItem.title,
      ...(localItem as any).description && { description: (localItem as any).description },
      ...(localItem as any).completed !== undefined && { completed: (localItem as any).completed },
      ...(localItem as any).pageId && { pageId: (localItem as any).pageId },
      ...(localItem as any).listId && { listId: (localItem as any).listId },
    });

    mapping[localItem.localId] = id;
  }

  // Clear storage after sync
  setItem<T[]>(localKey, []);

  return mapping;
}
