import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ListsService {
  constructor(private prisma: PrismaService) {}

  async create(pageId: string, title: string, userId: string) {
    // Verify page belongs to user
    const page = await this.prisma.page.findFirst({
      where: { id: pageId, userId },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    // Get max order for new list
    const maxOrder = await this.prisma.list.findFirst({
      where: { pageId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    return this.prisma.list.create({
      data: {
        title,
        pageId,
        order: maxOrder ? maxOrder.order + 1 : 0,
      },
    });
  }

  async findAll(pageId: string, userId: string) {
    // Verify page belongs to user
    const page = await this.prisma.page.findFirst({
      where: { id: pageId, userId },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return this.prisma.list.findMany({
      where: { pageId },
      orderBy: { order: 'asc' },
      include: {
        tasks: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const list = await this.prisma.list.findUnique({
      where: { id },
      include: {
        page: true,
        tasks: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!list || list.page.userId !== userId) {
      throw new NotFoundException('List not found');
    }

    return list;
  }

  async update(id: string, userId: string, data: { title?: string; order?: number }) {
    const list = await this.prisma.list.findUnique({
      where: { id },
      include: { page: true },
    });

    if (!list || list.page.userId !== userId) {
      throw new NotFoundException('List not found');
    }

    return this.prisma.list.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string) {
    const list = await this.prisma.list.findUnique({
      where: { id },
      include: { page: true },
    });

    if (!list || list.page.userId !== userId) {
      throw new NotFoundException('List not found');
    }

    await this.prisma.list.delete({
      where: { id },
    });

    return { message: 'List deleted successfully' };
  }
}
