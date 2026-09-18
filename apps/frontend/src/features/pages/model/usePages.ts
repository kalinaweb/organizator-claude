'use client';

import { useState, useEffect, useCallback } from 'react';
import { pagesApi } from '../api/pagesApi';
import type { Page, CreatePageDto, UpdatePageDto } from '@todo-app/shared';

export const usePages = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await pagesApi.getAll();
      setPages(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load pages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPage = async (dto: CreatePageDto) => {
    try {
      const newPage = await pagesApi.create(dto);
      setPages((prev) => [newPage, ...prev]);
      return newPage;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create page');
      throw err;
    }
  };

  const updatePage = async (id: string, dto: UpdatePageDto) => {
    try {
      const updated = await pagesApi.update(id, dto);
      setPages((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update page');
      throw err;
    }
  };

  const deletePage = async (id: string) => {
    try {
      await pagesApi.delete(id);
      setPages((prev) => prev.filter((p) => p.id !== id));
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
