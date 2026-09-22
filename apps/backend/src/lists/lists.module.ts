import { Module } from '@nestjs/common';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';

/**
 * Модуль управления списками (Lists).
 *
 * Регистрирует {@link ListsController} и {@link ListsService} для CRUD-операций
 * над списками внутри страниц. Список — средний уровень иерархии
 * `User → Page → List → Task`.
 */
@Module({
  controllers: [ListsController],
  providers: [ListsService],
})
export class ListsModule {}
