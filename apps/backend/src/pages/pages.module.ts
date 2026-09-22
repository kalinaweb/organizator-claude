import { Module } from '@nestjs/common';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';

/**
 * Модуль управления страницами (Pages).
 *
 * Регистрирует {@link PagesController} и {@link PagesService} для CRUD-операций
 * над страницами пользователя. Является верхним уровнем иерархии
 * `User → Page → List → Task`.
 */
@Module({
  controllers: [PagesController],
  providers: [PagesService],
})
export class PagesModule {}
