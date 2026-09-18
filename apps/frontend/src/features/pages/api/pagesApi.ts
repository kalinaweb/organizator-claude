import { api } from '@/lib/api';
import type { Page, CreatePageDto, UpdatePageDto } from '@todo-app/shared';

export const pagesApi = {
  async getAll(): Promise<Page[]> {
    const { data } = await api.get<Page[]>('/pages');
    return data;
  },

  async getOne(id: string): Promise<Page> {
    const { data } = await api.get<Page>(`/pages/${id}`);
    return data;
  },

  async create(dto: CreatePageDto): Promise<Page> {
    const { data } = await api.post<Page>('/pages', dto);
    return data;
  },

  async update(id: string, dto: UpdatePageDto): Promise<Page> {
    const { data } = await api.put<Page>(`/pages/${id}`, dto);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/pages/${id}`);
  },
};
