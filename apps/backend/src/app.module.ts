import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PagesModule } from './pages/pages.module';
import { ListsModule } from './lists/lists.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: (config) => {
        if (!config.DATABASE_URL) {
          throw new Error('DATABASE_URL is not set');
        }
        return config;
      },
    }),
    PrismaModule,
    AuthModule,
    PagesModule,
    ListsModule,
    TasksModule,
  ],
})
export class AppModule {}
