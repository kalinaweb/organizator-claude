import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

/**
 * Модуль управления задачами (Tasks).
 *
 * Регистрирует {@link TasksController} и {@link TasksService} для CRUD-операций
 * над задачами внутри списков. Задача — нижний уровень иерархии
 * `User → Page → List → Task`.
 */
@Module({
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
