---
name: commit
description: Create a conventional commit in Russian following project conventions
Model: Sonnet
allowed-tools: Bash(git *), Read, Glog, Grep
---

# Commit Skill

This skill handles creating commits for this project following the established conventions.

## Commit Conventions

This project follows conventional commits with messages in Russian.

### Format

```
<type>: <краткое описание>

<подробное описание изменений>
- список изменений
- ...

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

### Types

- `feat` - новая функциональность
- `fix` - исправление бага
- `refactor` - рефакторинг без изменения функциональности
- `docs` - изменения в документации
- `style` - форматирование кода (без изменения логики)
- `test` - добавление или обновление тестов
- `chore` - обновление зависимостей, конфигурации

## Process

1. **Review changes**:
   ```bash
   git status
   git diff
   git log --oneline -5
   ```

2. **Analyze changes** and draft commit message:
   - Summarize the nature of changes (new feature, enhancement, bug fix, refactoring, test, docs, etc.)
   - Ensure message accurately reflects changes and their purpose
   - Keep it concise (1-2 sentences for detailed description)
   - Focus on WHY rather than WHAT

3. **Stage and commit**:
   ```bash
   git add <specific-files>
   git commit -m "$(cat <<'EOF'
   <type>: <краткое описание>
   
   <подробное описание>
   - список изменений
   
   Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
   EOF
   )"
   ```

4. **Verify**:
   ```bash
   git status
   git log -1 --stat
   ```

## Important Notes

- **Never commit directly to main/master** unless explicitly asked
- **Stage specific files** rather than using `git add .` or `git add -A` to avoid accidentally committing sensitive files (.env, credentials) or large binaries
- **Never skip hooks** (--no-verify) unless explicitly requested
- **Always create NEW commits** rather than amending, unless explicitly asked
- **Do not commit secrets** - warn if detecting .env, credentials.json, etc.
- **Use HEREDOC** for commit messages to ensure proper formatting
- **Review git log** before committing to match repository's commit message style

## Examples

### Feature Commit
```bash
git commit -m "$(cat <<'EOF'
feat: добавлена функциональность регистрации

Реализована полная система аутентификации с JWT
- Добавлены страницы /login и /register
- Создана feature auth по FSD методологии
- Настроен axios interceptor

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

### Bug Fix Commit
```bash
git commit -m "$(cat <<'EOF'
fix: исправлена ошибка валидации email

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

### Refactor Commit
```bash
git commit -m "$(cat <<'EOF'
refactor: упрощена логика обработки задач

Удалены дублирующиеся проверки, улучшена читаемость кода
- Объединены методы validateTask и checkTaskPermissions
- Убраны неиспользуемые импорты

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

## Safety Rules

- If pre-commit hook fails, the commit did NOT happen - fix the issue and create a NEW commit (never use --amend)
- When staging files, prefer adding specific files by name
- If there are no changes to commit, do not create an empty commit
- Never update git config
- Never run destructive git commands (push --force, reset --hard, etc.) without explicit permission
- Никогда не коммить '.env', '.env.local' файлы
- Не используй '--no-verify', '--amend' без явной просьбы пользователя
- Не добавляй файлы без явного понимания их содержимого
