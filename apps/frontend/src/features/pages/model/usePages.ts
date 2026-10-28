'use client';

import { useState, useEffect, useCallback } from 'react';
import { pagesApi } from '../api/pagesApi';
import { isAuthenticated } from '@/lib/auth';
import {
  getLocalPages,
  createLocalPage as createLocalPageStorage,
  updateLocalPage as updateLocalPageStorage,
  deleteLocalPage as deleteLocalPageStorage,
} from '@/lib/storage';
import type { Page, LocalPage, CreatePageDto, UpdatePageDto } from '@todo-app/shared';

// Helper to convert LocalPage to Page-like object for UI
function localPageToDisplay(page: LocalPage): Page {
  return {
    id: page.localId,
    title: page.title,
    userId: 'local',
    createdAt: new Date(page.createdAt),
    updatedAt: new Date(page.updatedAt),
  };
}

export const usePages = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isAuthenticated()) {
        const data = await pagesApi.getAll();
        setPages(data);
      } else {
        const localPages = getLocalPages();
        setPages(localPages.map(localPageToDisplay));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load pages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPage = async (dto: CreatePageDto) => {
    try {
      if (isAuthenticated()) {
        const newPage = await pagesApi.create(dto);
        setPages((prev) => [newPage, ...prev]);
        return newPage;
      } else {
        const newLocalPage = createLocalPageStorage(dto.title);
        setPages((prev) => [localPageToDisplay(newLocalPage), ...prev]);
        return localPageToDisplay(newLocalPage);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create page');
      throw err;
    }
  };

  const updatePage = async (id: string, dto: UpdatePageDto) => {
    try {
      if (isAuthenticated()) {
        const updated = await pagesApi.update(id, dto);
        setPages((prev) => prev.map((p) => (p.id === id ? updated : p)));
        return updated;
      } else {
        if (dto.title) {
          updateLocalPageStorage(id, dto.title);
        }
        setPages((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, title: dto.title || p.title, updatedAt: new Date() }
              : p
          )
        );
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update page');
      throw err;
    }
  };

  const deletePage = async (id: string) => {
    try {
      if (isAuthenticated()) {
        await pagesApi.delete(id);
        setPages((prev) => prev.filter((p) => p.id !== id));
      } else {
        deleteLocalPageStorage(id);
        setPages((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete page');
      throw err;
    }
  };

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  return {
    pages,
    isLoading,
    error,
    refetch: fetchPages,
    createPage,
    updatePage,
    deletePage,
  };
};
