---
name: wabot-framework
description: Use when building, reviewing, or debugging apps with @wabot-dev/framework. This skill is self-contained and includes offline examples for project setup, dependency injection, mindsets, external function modules, validation, persistence, chat controllers, REST and socket controllers, async commands, cron, auth, logger, and locking.
---

# Wabot Framework

Use this skill for Wabot application work. It is self-contained: read the bundled examples first and do not depend on web access for normal tasks.

## How To Use

Load the reference file that matches the request:

- `references/quickstart.md` for project bootstrap and first run
- `references/core-patterns.md` for dependency injection and service lifecycles
- `references/mindset-and-chat.md` for bot personality, tools, and chat routing
- `references/validation-and-data.md` for DTOs, validation, and `Mapper`
- `references/persistence.md` for entities, repositories, and PostgreSQL persistence
- `references/controllers-and-auth.md` for REST, socket, and JWT auth
- `references/async-and-cron.md` for commands and scheduled work
- `references/ops.md` for logger and locking
- `references/full-example.md` for an end-to-end sales bot app

## Rules

- Keep prose in Spanish when explaining to the team.
- Keep code identifiers in English.
- Use `@wabot-dev/framework` imports in examples.
- Do not invent APIs. If a detail is not covered by the bundled examples, say what is missing instead of guessing.
- Keep controllers thin and push business logic into services or modules.
- Use `@scoped()` only when request, chat, or socket isolation matters.
- Prefer the smallest example that demonstrates the pattern.
