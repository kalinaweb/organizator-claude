import { api } from '@/lib/api';
import type { Task, CreateTaskDto, UpdateTaskDto } from '@todo-app/shared';

export const tasksApi = {
  async getAll(listId: string): Promise<Task[]> {
    const { data } = await api.get<Task[]>('/tasks', { params: { listId } });
    return data;
  },

  async create(dto: CreateTaskDto): Promise<Task> {
    const { data } = await api.post<Task>('/tasks', dto);
    return data;
  },

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const { data } = await api.put<Task>(`/tasks/${id}`, dto);
    return data;
  },

  async reorder(id: string, listId: string, order: number): Promise<Task> {
    const { data } = await api.put<Task>(`/tasks/${id}`, { listId, order });
    return data;
  },

  async resort(listId: string): Promise<Task[]> {
    const { data } = await api.put<Task[]>(`/tasks/resort`, { listId });
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },
};
