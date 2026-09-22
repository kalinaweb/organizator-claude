import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Сервис бизнес-логики для работы со страницами (Pages).
 *
 * Страница — верхний уровень иерархии `User → Page → List → Task`.
 * Каждый метод, работающий с конкретной страницей, проверяет принадлежность
 * ресурса пользователю (`userId`), чтобы предотвратить доступ к чужим данным.
 */
@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Создаёт новую страницу для пользователя.
   *
   * @param userId - Идентификатор владельца страницы.
   * @param title - Заголовок страницы.
   * @returns Промис с созданной страницей.
   */
  async create(userId: string, title: string) {
    return this.prisma.page.create({
      data: {
        title,
        userId,
      },
    });
  }

  /**
   * Возвращает все страницы пользователя, отсортированные по дате создания (убывание).
   *
   * @param userId - Идентификатор пользователя-владельца.
   * @returns Промис с массивом страниц.
   */
  async findAll(userId: string) {
    return this.prisma.page.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Возвращает страницу по идентификатору вместе со всеми списками и задачами.
   *
   * @param id - Идентификатор страницы.
   * @param userId - Идентификатор пользователя, выполняющего запрос (для проверки владения).
   * @returns Промис со страницей, включающей отсортированные `lists` и вложенные `tasks`.
   * @throws {NotFoundException} Если страница не найдена или не принадлежит пользователю.
   */
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

  /**
   * Обновляет заголовок страницы.
   *
   * @param id - Идентификатор страницы.
   * @param userId - Идентификатор пользователя, выполняющего запрос (для проверки владения).
   * @param title - Новый заголовок страницы.
   * @returns Промис с обновлённой страницей.
   * @throws {NotFoundException} Если страница не найдена или не принадлежит пользователю.
   */
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

  /**
   * Удаляет страницу вместе со всеми вложенными списками и задачами
   * (каскадное удаление обеспечивается на уровне БД через Prisma).
   *
   * @param id - Идентификатор страницы.
   * @param userId - Идентификатор пользователя, выполняющего запрос (для проверки владения).
   * @returns Промис с сообщением об успешном удалении.
   * @throws {NotFoundException} Если страница не найдена или не принадлежит пользователю.
   */
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
