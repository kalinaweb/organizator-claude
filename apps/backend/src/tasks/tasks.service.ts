import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Сервис бизнес-логики для работы с задачами (Tasks).
 *
 * Задача — нижний уровень иерархии `User → Page → List → Task`.
 * Владение проверяется через цепочку `list → page → userId`: сервис
 * загружает связанные `list` и `page`, чтобы убедиться, что задача
 * принадлежит текущему пользователю.
 */
@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  /**
   * Создаёт новую задачу в указанном списке.
   *
   * Новой задаче присваивается порядковый номер `order`, равный
   * максимальному существующему `order` среди задач списка плюс один
   * (или `0`, если задача в списке создаётся впервые).
   *
   * @param listId - Идентификатор списка, которому будет принадлежать задача.
   * @param userId - Идентификатор пользователя, выполняющего запрос (для проверки владения через список/страницу).
   * @param data - Данные новой задачи.
   * @param data.title - Заголовок задачи.
   * @param data.description - Описание задачи (опционально).
   * @returns Промис с созданной задачей.
   * @throws {NotFoundException} Если список не найден или не принадлежит пользователю.
   */
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

  /**
   * Возвращает все задачи указанного списка.
   *
   * @param listId - Идентификатор списка.
   * @param userId - Идентификатор пользователя, выполняющего запрос (для проверки владения через список/страницу).
   * @returns Промис с массивом задач, отсортированных по `order`.
   * @throws {NotFoundException} Если список не найден или не принадлежит пользователю.
   */
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

  /**
   * Возвращает задачу по идентификатору.
   *
   * @param id - Идентификатор задачи.
   * @param userId - Идентификатор пользователя, выполняющего запрос (для проверки владения через цепочку список → страница).
   * @returns Промис с найденной задачей.
   * @throws {NotFoundException} Если задача не найдена или список/страница-владелец не принадлежит пользователю.
   */
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

  /**
   * Обновляет заголовок, описание, статус выполнения и/или порядок задачи.
   *
   * @param id - Идентификатор задачи.
   * @param userId - Идентификатор пользователя, выполняющего запрос (для проверки владения через цепочку список → страница).
   * @param data - Поля для обновления.
   * @param data.title - Новый заголовок задачи (опционально).
   * @param data.description - Новое описание задачи (опционально).
   * @param data.completed - Новый статус выполнения задачи (опционально).
   * @param data.order - Новый порядковый номер задачи (опционально).
   * @returns Промис с обновлённой задачей.
   * @throws {NotFoundException} Если задача не найдена или список/страница-владелец не принадлежит пользователю.
   */
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

  /**
   * Удаляет задачу.
   *
   * @param id - Идентификатор задачи.
   * @param userId - Идентификатор пользователя, выполняющего запрос (для проверки владения через цепочку список → страница).
   * @returns Промис с сообщением об успешном удалении.
   * @throws {NotFoundException} Если задача не найдена или список/страница-владелец не принадлежит пользователю.
   */
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
