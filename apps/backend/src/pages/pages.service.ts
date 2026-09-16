import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, title: string) {
    return this.prisma.page.create({
      data: {
        title,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.page.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const page = await this.prisma.page.findFirst({
      where: { id, userId },
      include: {
        lists: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return page;
  }

  async update(id: string, userId: string, title: string) {
    const page = await this.prisma.page.findFirst({
      where: { id, userId },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return this.prisma.page.update({
      where: { id },
      data: { title },
    });
  }

  async remove(id: string, userId: string) {
    const page = await this.prisma.page.findFirst({
      where: { id, userId },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    await this.prisma.page.delete({
      where: { id },
    });

    return { message: 'Page deleted successfully' };
  }
}
