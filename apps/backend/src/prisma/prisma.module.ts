import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Глобальный модуль доступа к базе данных.
 *
 * Экспортирует {@link PrismaService}, делая его доступным во всех модулях
 * приложения (`PagesModule`, `ListsModule`, `TasksModule` и др.) без необходимости
 * повторного импорта благодаря декоратору `@Global()`.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
