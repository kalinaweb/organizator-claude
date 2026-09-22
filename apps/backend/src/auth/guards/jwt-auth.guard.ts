import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard для защиты endpoints с помощью JWT-аутентификации.
 *
 * Применяется через `@UseGuards(JwtAuthGuard)` к контроллерам `PagesController`,
 * `ListsController`, `TasksController` и др. Делегирует проверку токена
 * стратегии Passport с именем `'jwt'` (см. `JwtStrategy`).
 *
 * При отсутствии или невалидности токена выбрасывает `UnauthorizedException` (401)
 * и блокирует доступ к маршруту. При успешной проверке добавляет объект пользователя
 * (`{ id, email }`) в `request.user`.
 *
 * @throws {UnauthorizedException} Если токен отсутствует, просрочен или невалиден.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
