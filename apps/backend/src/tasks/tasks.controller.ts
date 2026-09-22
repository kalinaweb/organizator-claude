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
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Контроллер REST API для управления задачами (`/api/tasks`).
 *
 * Все маршруты защищены {@link JwtAuthGuard} и требуют заголовок
 * `Authorization: Bearer <token>`. Идентификатор пользователя извлекается
 * из `req.user.id`, установленного JWT-стратегией.
 */
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  /**
   * Создаёт новую задачу в указанном списке.
   *
   * @param req - Объект запроса Express с данными аутентифицированного пользователя (`req.user.id`).
   * @param body - Тело запроса.
   * @param body.title - Заголовок создаваемой задачи.
   * @param body.description - Описание задачи (опционально).
   * @param body.listId - Идентификатор списка, которому будет принадлежать задача.
   * @returns Промис с созданной задачей.
   * @throws {NotFoundException} Если список не найден или не принадлежит текущему пользователю.
   */
  @Post()
  create(
    @Request() req,
    @Body() body: { title: string; description?: string; listId: string },
  ) {
    return this.tasksService.create(body.listId, req.user.id, {
      title: body.title,
      description: body.description,
    });
  }

  /**
   * Возвращает задачи указанного списка.
   *
   * @param req - Объект запроса Express с данными аутентифицированного пользователя (`req.user.id`).
   * @param listId - Идентификатор списка (query-параметр).
   * @returns Промис с массивом задач, отсортированных по `order`.
   * @throws {NotFoundException} Если список не найден или не принадлежит текущему пользователю.
   */
  @Get()
  findAll(@Request() req, @Query('listId') listId: string) {
    return this.tasksService.findAll(listId, req.user.id);
  }

  /**
   * Возвращает задачу по идентификатору.
   *
   * @param id - Идентификатор задачи.
   * @param req - Объект запроса Express с данными аутентифицированного пользователя (`req.user.id`).
   * @returns Промис с найденной задачей.
   * @throws {NotFoundException} Если задача не найдена или список/страница-владелец не принадлежит текущему пользователю.
   */
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.tasksService.findOne(id, req.user.id);
  }

  /**
   * Обновляет заголовок, описание, статус выполнения и/или порядок задачи.
   *
   * @param id - Идентификатор задачи.
   * @param req - Объект запроса Express с данными аутентифицированного пользователя (`req.user.id`).
   * @param body - Тело запроса.
   * @param body.title - Новый заголовок задачи (опционально).
   * @param body.description - Новое описание задачи (опционально).
   * @param body.completed - Новый статус выполнения задачи (опционально).
   * @param body.order - Новый порядковый номер задачи (опционально).
   * @returns Промис с обновлённой задачей.
   * @throws {NotFoundException} Если задача не найдена или список/страница-владелец не принадлежит текущему пользователю.
   */
  @Put(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body()
    body: {
      title?: string;
      description?: string;
      completed?: boolean;
      order?: number;
    },
  ) {
    return this.tasksService.update(id, req.user.id, body);
  }

  /**
   * Удаляет задачу.
   *
   * @param id - Идентификатор задачи.
   * @param req - Объект запроса Express с данными аутентифицированного пользователя (`req.user.id`).
   * @returns Промис с сообщением об успешном удалении.
   * @throws {NotFoundException} Если задача не найдена или список/страница-владелец не принадлежит текущему пользователю.
   */
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.tasksService.remove(id, req.user.id);
  }
}
