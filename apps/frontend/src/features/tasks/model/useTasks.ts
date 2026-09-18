'use client';

import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '../api/tasksApi';
import type { Task, CreateTaskDto, UpdateTaskDto } from '@todo-app/shared';

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
      const data = await tasksApi.getAll(listId);
      setTasks(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [listId]);

  const createTask = async (dto: CreateTaskDto) => {
    try {
      const newTask = await tasksApi.create(dto);
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task');
      throw err;
    }
  };

  const updateTask = async (id: string, dto: UpdateTaskDto) => {
    try {
      const updated = await tasksApi.update(id, dto);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update task');
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await tasksApi.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete task');
      throw err;
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    return updateTask(id, { completed });
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
    deleteTask,
    toggleTask,
  };
};
