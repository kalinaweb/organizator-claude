import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Контроллер REST API для управления страницами (`/api/pages`).
 *
 * Все маршруты защищены {@link JwtAuthGuard} и требуют заголовок
 * `Authorization: Bearer <token>`. Идентификатор пользователя извлекается
 * из `req.user.id`, установленного JWT-стратегией.
 */
@Controller('pages')
@UseGuards(JwtAuthGuard)
export class PagesController {
  constructor(private pagesService: PagesService) {}

  /**
   * Создаёт новую страницу для текущего пользователя.
   *
   * @param req - Объект запроса Express с данными аутентифицированного пользователя (`req.user.id`).
   * @param body - Тело запроса.
   * @param body.title - Заголовок создаваемой страницы.
   * @returns Промис с созданной страницей.
   */
  @Post()
  create(@Request() req, @Body() body: { title: string }) {
    return this.pagesService.create(req.user.id, body.title);
  }

  /**
   * Возвращает список всех страниц текущего пользователя, отсортированных по дате создания (убывание).
   *
   * @param req - Объект запроса Express с данными аутентифицированного пользователя (`req.user.id`).
   * @returns Промис с массивом страниц пользователя.
   */
  @Get()
  findAll(@Request() req) {
    return this.pagesService.findAll(req.user.id);
  }

  /**
   * Возвращает страницу по идентификатору вместе со всеми вложенными списками и задачами.
   *
   * @param id - Идентификатор страницы.
   * @param req - Объект запроса Express с данными аутентифицированного пользователя (`req.user.id`).
   * @returns Промис со страницей, включающей `lists` и вложенные `tasks`.
   * @throws {NotFoundException} Если страница не найдена или не принадлежит текущему пользователю.
   */
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.pagesService.findOne(id, req.user.id);
  }

  /**
   * Обновляет заголовок страницы.
   *
   * @param id - Идентификатор страницы.
   * @param req - Объект запроса Express с данными аутентифицированного пользователя (`req.user.id`).
   * @param body - Тело запроса.
   * @param body.title - Новый заголовок страницы.
   * @returns Промис с обновлённой страницей.
   * @throws {NotFoundException} Если страница не найдена или не принадлежит текущему пользователю.
   */
  @Put(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { title: string },
  ) {
    return this.pagesService.update(id, req.user.id, body.title);
  }

  /**
   * Удаляет страницу вместе со всеми вложенными списками и задачами (каскадное удаление на уровне БД).
   *
   * @param id - Идентификатор страницы.
   * @param req - Объект запроса Express с данными аутентифицированного пользователя (`req.user.id`).
   * @returns Промис с сообщением об успешном удалении.
   * @throws {NotFoundException} Если страница не найдена или не принадлежит текущему пользователю.
   */
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.pagesService.remove(id, req.user.id);
  }
}
