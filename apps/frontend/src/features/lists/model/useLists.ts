'use client';

import { useState, useEffect, useCallback } from 'react';
import { listsApi } from '../api/listsApi';
import type { List, CreateListDto, UpdateListDto } from '@todo-app/shared';

export const useLists = (pageId: string | null) => {
  const [lists, setLists] = useState<List[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLists = useCallback(async () => {
    if (!pageId) {
      setLists([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await listsApi.getAll(pageId);
      setLists(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load lists');
    } finally {
      setIsLoading(false);
    }
  }, [pageId]);

  const createList = async (dto: CreateListDto) => {
    try {
      const newList = await listsApi.create(dto);
      setLists((prev) => [...prev, newList]);
      return newList;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create list');
      throw err;
    }
  };

  const updateList = async (id: string, dto: UpdateListDto) => {
    try {
      const updated = await listsApi.update(id, dto);
      setLists((prev) => prev.map((l) => (l.id === id ? updated : l)));
      return updated;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update list');
      throw err;
    }
  };

  const deleteList = async (id: string) => {
    try {
      await listsApi.delete(id);
      setLists((prev) => prev.filter((l) => l.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete list');
      throw err;
    }
  };

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  return {
    lists,
    isLoading,
    error,
    refetch: fetchLists,
    createList,
    updateList,
    deleteList,
  };
};
