import { api } from '@/lib/api';
import type { List, CreateListDto, UpdateListDto } from '@todo-app/shared';

export const listsApi = {
  async getAll(pageId: string): Promise<List[]> {
    const { data } = await api.get<List[]>('/lists', { params: { pageId } });
    return data;
  },

  async create(dto: CreateListDto): Promise<List> {
    const { data } = await api.post<List>('/lists', dto);
    return data;
  },

  async update(id: string, dto: UpdateListDto): Promise<List> {
    const { data } = await api.put<List>(`/lists/${id}`, dto);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/lists/${id}`);
  },
};
