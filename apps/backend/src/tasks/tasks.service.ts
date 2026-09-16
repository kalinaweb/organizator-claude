import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(
    listId: string,
    userId: string,
    data: { title: string; description?: string },
  ) {
    // Verify list belongs to user's page
    const list = await this.prisma.list.findUnique({
      where: { id: listId },
      include: { page: true },
    });

    if (!list || list.page.userId !== userId) {
      throw new NotFoundException('List not found');
    }

    // Get max order for new task
    const maxOrder = await this.prisma.task.findFirst({
      where: { listId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    return this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        listId,
        order: maxOrder ? maxOrder.order + 1 : 0,
      },
    });
  }

  async findAll(listId: string, userId: string) {
    // Verify list belongs to user's page
    const list = await this.prisma.list.findUnique({
      where: { id: listId },
      include: { page: true },
    });

    if (!list || list.page.userId !== userId) {
      throw new NotFoundException('List not found');
    }

    return this.prisma.task.findMany({
      where: { listId },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        list: {
          include: {
            page: true,
          },
        },
      },
    });

    if (!task || task.list.page.userId !== userId) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(
    id: string,
    userId: string,
    data: {
      title?: string;
      description?: string;
      completed?: boolean;
      order?: number;
    },
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        list: {
          include: {
            page: true,
          },
        },
      },
    });

    if (!task || task.list.page.userId !== userId) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.task.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        list: {
          include: {
            page: true,
          },
        },
      },
    });

    if (!task || task.list.page.userId !== userId) {
      throw new NotFoundException('Task not found');
    }

    await this.prisma.task.delete({
      where: { id },
    });

    return { message: 'Task deleted successfully' };
  }
}
