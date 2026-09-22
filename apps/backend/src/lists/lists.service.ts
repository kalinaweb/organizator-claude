import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Сервис бизнес-логики для работы со списками (Lists).
 *
 * Список — средний уровень иерархии `User → Page → List → Task`.
 * Владение проверяется через родительскую страницу: для операций над
 * существующим списком сервис загружает связанную `page` и сверяет её `userId`.
 */
@Injectable()
export class ListsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Создаёт новый список на указанной странице.
   *
   * Новому списку присваивается порядковый номер `order`, равный
   * максимальному существующему `order` среди списков страницы плюс один
   * (или `0`, если список на странице создаётся впервые).
   *
   * @param pageId - Идентификатор страницы, которой будет принадлежать список.
   * @param title - Заголовок создаваемого списка.
   * @param userId - Идентификатор пользователя, выполняющего запрос (для проверки владения страницей).
   * @returns Промис с созданным списком.
   * @throws {NotFoundException} Если страница не найдена или не принадлежит пользователю.
   */
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

  /**
   * Возвращает все списки указанной страницы вместе с их задачами.
   *
   * @param pageId - Идентификатор страницы.
   * @param userId - Идентификатор пользователя, выполняющего запрос (для проверки владения страницей).
   * @returns Промис с массивом списков, отсортированных по `order`, включая вложенные `tasks`.
   * @throws {NotFoundException} Если страница не найдена или не принадлежит пользователю.
   */
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

  /**
   * Возвращает список по идентификатору вместе с его задачами и родительской страницей.
   *
   * @param id - Идентификатор списка.
   * @param userId - Идентификатор пользователя, выполняющего запрос (для проверки владения через родительскую страницу).
   * @returns Промис со списком, включающим `page` и отсортированные `tasks`.
   * @throws {NotFoundException} Если список не найден или страница-владелец не принадлежит пользователю.
   */
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

  /**
   * Обновляет заголовок и/или порядок списка.
   *
   * @param id - Идентификатор списка.
   * @param userId - Идентификатор пользователя, выполняющего запрос (для проверки владения через родительскую страницу).
   * @param data - Поля для обновления.
   * @param data.title - Новый заголовок списка (опционально).
   * @param data.order - Новый порядковый номер списка (опционально).
   * @returns Промис с обновлённым списком.
   * @throws {NotFoundException} Если список не найден или страница-владелец не принадлежит пользователю.
   */
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

  /**
   * Удаляет список вместе со всеми вложенными задачами
   * (каскадное удаление обеспечивается на уровне БД через Prisma).
   *
   * @param id - Идентификатор списка.
   * @param userId - Идентификатор пользователя, выполняющего запрос (для проверки владения через родительскую страницу).
   * @returns Промис с сообщением об успешном удалении.
   * @throws {NotFoundException} Если список не найден или страница-владелец не принадлежит пользователю.
   */
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
