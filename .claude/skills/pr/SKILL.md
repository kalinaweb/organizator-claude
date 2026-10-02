---
name: pr
description: Создание GitHub Pull Request с заданными названием и веткой.
model: Sonnet
allowed-tools: Bash(git *), Bash(gh *)
user-invocable: true
argument-hint: [title] [branch, default master]
---

# PR Skill

Создай Pull Request на GitHub, соблюдая соглашения проекта.

## Arguments

- $0 - название PR
- $1 - целевая ветка

## Подготовка

1. Проверь что ветка готова:
  !`bash ${CLAUDE_SKILL_DIR}/scripts/validate.sh`
2. Получил diff от базовой ветки:
  !`git diff`
3. Получи список коммитов:
  !`git log --oneline`

## Задача

Используя данные выше, заполни шаблон из @template.md.
Посмотри пример хорошего PR: @examples/good.pr.md

## Создание PR

Создай PR командой

gh pr create \
     --title "$0 или сгенерированный title" \
     --body "заполненный шаблон"
     --base "${ARGUMENTS:-master}"

## Правила
- Заголовок по conventional commits
- Если ветка не запушена: 
    git push --set-upstream origin HEAD
     




