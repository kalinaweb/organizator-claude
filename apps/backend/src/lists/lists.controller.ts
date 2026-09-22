import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ListsService } from './lists.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Контроллер REST API для управления списками (`/api/lists`).
 *
 * Все маршруты защищены {@link JwtAuthGuard} и требуют заголовок
 * `Authorization: Bearer <token>`. Идентификатор пользователя извлекается
 * из `req.user.id`, установленного JWT-стратегией.
 */
@Controller('lists')
@UseGuards(JwtAuthGuard)
export class ListsController {
  constructor(private listsService: ListsService) {}

  /**
   * Создаёт новый список на указанной странице.
   *
   * @param req - Объект запроса Express с данными аутентифицированного пользователя (`req.user.id`).
   * @param body - Тело запроса.
   * @param body.title - Заголовок создаваемого списка.
   * @param body.pageId - Идентификатор страницы, которой будет принадлежать список.
   * @returns Промис с созданным списком.
   * @throws {NotFoundException} Если страница не найдена или не принадлежит текущему пользователю.
   */
  @Post()
  create(
    @Request() req,
    @Body() body: { title: string; pageId: string },
  ) {
    return this.listsService.create(body.pageId, body.title, req.user.id);
  }

  /**
   * Возвращает списки указанной страницы вместе с их задачами.
   *
   * @param req - Объект запроса Express с данными аутентифицированного пользователя (`req.user.id`).
   * @param pageId - Идентификатор страницы (query-параметр).
   * @returns Промис с массивом списков, отсортированных по `order`, включая вложенные `tasks`.
   * @throws {NotFoundException} Если страница не найдена или не принадлежит текущему пользователю.
   */
  @Get()
  findAll(@Request() req, @Query('pageId') pageId: string) {
    return this.listsService.findAll(pageId, req.user.id);
  }

  /**
   * Возвращает список по идентификатору вместе с его задачами.
   *
   * @param id - Идентификатор списка.
   * @param req - Объект запроса Express с данными аутентифицированного пользователя (`req.user.id`).
   * @returns Промис со списком, включающим родительскую `page` и отсортированные `tasks`.
   * @throws {NotFoundException} Если список не найден или страница-владелец не принадлежит текущему пользователю.
   */
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.listsService.findOne(id, req.user.id);
  }

  /**
   * Обновляет заголовок и/или порядок списка.
   *
   * @param id - Идентификатор списка.
   * @param req - Объект запроса Express с данными аутентифицированного пользователя (`req.user.id`).
   * @param body - Тело запроса.
   * @param body.title - Новый заголовок списка (опционально).
   * @param body.order - Новый порядковый номер списка (опционально).
   * @returns Промис с обновлённым списком.
   * @throws {NotFoundException} Если список не найден или страница-владелец не принадлежит текущему пользователю.
   */
  @Put(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { title?: string; order?: number },
  ) {
    return this.listsService.update(id, req.user.id, body);
  }

  /**
   * Удаляет список вместе со всеми вложенными задачами (каскадное удаление на уровне БД).
   *
   * @param id - Идентификатор списка.
   * @param req - Объект запроса Express с данными аутентифицированного пользователя (`req.user.id`).
   * @returns Промис с сообщением об успешном удалении.
   * @throws {NotFoundException} Если список не найден или страница-владелец не принадлежит текущему пользователю.
   */
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.listsService.remove(id, req.user.id);
  }
}
