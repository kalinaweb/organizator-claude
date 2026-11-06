'use client';

import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '../api/tasksApi';
import { isAuthenticated } from '@/lib/auth';
import {
  getLocalTasks,
  createLocalTask as createLocalTaskStorage,
  updateLocalTask as updateLocalTaskStorage,
  deleteLocalTask as deleteLocalTaskStorage,
} from '@/lib/storage';
import type { Task, LocalTask, CreateTaskDto, UpdateTaskDto } from '@todo-app/shared';

// Helper to convert LocalTask to Task-like object for UI
function localTaskToDisplay(task: LocalTask): Task {
  return {
    id: task.localId,
    title: task.title,
    description: task.description,
    completed: task.completed,
    listId: task.listId,
    order: task.order,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
  };
}

export const useTasks = (listId: string | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!listId) {
      setTasks([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      if (isAuthenticated()) {
        const data = await tasksApi.getAll(listId);
        setTasks(data);
      } else {
        const localTasks = getLocalTasks(listId);
        setTasks(localTasks.map(localTaskToDisplay));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [listId]);

  const createTask = async (dto: CreateTaskDto) => {
    try {
      if (isAuthenticated()) {
        const newTask = await tasksApi.create(dto);
        setTasks((prev) => [...prev, newTask]);
        return newTask;
      } else {
        const newLocalTask = createLocalTaskStorage(
          dto.title,
          dto.listId,
          dto.description
        );
        setTasks((prev) => [...prev, localTaskToDisplay(newLocalTask)]);
        return localTaskToDisplay(newLocalTask);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task');
      throw err;
    }
  };

  const updateTask = async (id: string, dto: UpdateTaskDto) => {
    try {
      if (isAuthenticated()) {
        const updated = await tasksApi.update(id, dto);
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
        return updated;
      } else {
        if (dto.title || dto.description !== undefined || dto.completed !== undefined || dto.order !== undefined) {
          updateLocalTaskStorage(id, dto);
        }
        setTasks((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  title: dto.title || t.title,
                  description: dto.description !== undefined ? dto.description : t.description,
                  completed: dto.completed !== undefined ? dto.completed : t.completed,
                  order: dto.order !== undefined ? dto.order : t.order,
                  updatedAt: new Date(),
                }
              : t
          )
        );
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update task');
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      if (isAuthenticated()) {
        await tasksApi.delete(id);
        setTasks((prev) => prev.filter((t) => t.id !== id));
      } else {
        deleteLocalTaskStorage(id);
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete task');
      throw err;
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    return updateTask(id, { completed });
  };

  const reorderTask = async (id: string, listId: string, order: number) => {
    try {
      if (isAuthenticated()) {
        const updated = await tasksApi.reorder(id, listId, order);
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
        return updated;
      } else {
        updateLocalTaskStorage(id, { listId, order });
        setTasks((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  listId,
                  order,
                  updatedAt: new Date(),
                }
              : t
          )
        );
        return;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reorder task');
      throw err;
    }
  };

  const resortTasks = async () => {
    try {
      if (!listId) return;
      if (isAuthenticated()) {
        const updated = await tasksApi.resort(listId);
        setTasks(updated);
        return updated;
      } else {
        // Для локального режима пересчитаем order линейно
        const localTasks = getLocalTasks(listId);
        const sorted = [...localTasks].sort((a, b) => a.order - b.order);
        sorted.forEach((t, i) => {
          updateLocalTaskStorage(t.localId, { order: (i + 1) * 1000 });
        });
        const updatedTasks = sorted.map(localTaskToDisplay);
        setTasks(updatedTasks);
        return updatedTasks;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resort tasks');
      throw err;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    isLoading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    reorderTask,
    resortTasks,
    deleteTask,
    toggleTask,
  };
};
