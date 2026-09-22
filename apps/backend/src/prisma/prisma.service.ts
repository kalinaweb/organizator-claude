import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Глобальный сервис доступа к базе данных через Prisma ORM.
 *
 * Расширяет {@link PrismaClient} и управляет жизненным циклом подключения
 * к PostgreSQL в соответствии с жизненным циклом NestJS-модуля.
 * Используется всеми сервисами приложения (`PagesService`, `ListsService`, `TasksService` и др.)
 * для выполнения запросов к БД.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * Устанавливает соединение с базой данных при инициализации модуля.
   *
   * @returns Промис, разрешающийся после успешного подключения.
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Закрывает соединение с базой данных при уничтожении модуля.
   *
   * @returns Промис, разрешающийся после отключения от БД.
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
