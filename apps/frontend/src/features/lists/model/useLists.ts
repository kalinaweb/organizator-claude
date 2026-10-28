'use client';

import { useState, useEffect, useCallback } from 'react';
import { listsApi } from '../api/listsApi';
import { isAuthenticated } from '@/lib/auth';
import {
  getLocalLists,
  createLocalList as createLocalListStorage,
  updateLocalList as updateLocalListStorage,
  deleteLocalList as deleteLocalListStorage,
} from '@/lib/storage';
import type { List, LocalList, CreateListDto, UpdateListDto } from '@todo-app/shared';

// Helper to convert LocalList to List-like object for UI
function localListToDisplay(list: LocalList): List {
  return {
    id: list.localId,
    title: list.title,
    pageId: list.pageId,
    order: list.order,
    createdAt: new Date(list.createdAt),
    updatedAt: new Date(list.updatedAt),
  };
}

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
      if (isAuthenticated()) {
        const data = await listsApi.getAll(pageId);
        setLists(data);
      } else {
        const localLists = getLocalLists(pageId);
        setLists(localLists.map(localListToDisplay));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load lists');
    } finally {
      setIsLoading(false);
    }
  }, [pageId]);

  const createList = async (dto: CreateListDto) => {
    try {
      if (isAuthenticated()) {
        const newList = await listsApi.create(dto);
        setLists((prev) => [...prev, newList]);
        return newList;
      } else {
        const newLocalList = createLocalListStorage(dto.title, dto.pageId);
        setLists((prev) => [...prev, localListToDisplay(newLocalList)]);
        return localListToDisplay(newLocalList);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create list');
      throw err;
    }
  };

  const updateList = async (id: string, dto: UpdateListDto) => {
    try {
      if (isAuthenticated()) {
        const updated = await listsApi.update(id, dto);
        setLists((prev) => prev.map((l) => (l.id === id ? updated : l)));
        return updated;
      } else {
        if (dto.title || dto.order !== undefined) {
          updateLocalListStorage(id, dto);
        }
        setLists((prev) =>
          prev.map((l) =>
            l.id === id
              ? {
                  ...l,
                  title: dto.title || l.title,
                  order: dto.order !== undefined ? dto.order : l.order,
                  updatedAt: new Date(),
                }
              : l
          )
        );
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update list');
      throw err;
    }
  };

  const deleteList = async (id: string) => {
    try {
      if (isAuthenticated()) {
        await listsApi.delete(id);
        setLists((prev) => prev.filter((l) => l.id !== id));
      } else {
        deleteLocalListStorage(id);
        setLists((prev) => prev.filter((l) => l.id !== id));
      }
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
