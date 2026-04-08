# Operations

Use this when adding observability or duplicate-work protection.

## Logger

```typescript
import { Logger } from '@wabot-dev/framework'

const logger = new Logger('sales:lead-service')

logger.info('service started')
logger.debug('loading lead', { leadId: 'abc123' })
logger.warn('fallback used', { reason: 'missing metadata' })
logger.error('failed to save lead', new Error('db timeout'))
logger.fatal('process cannot continue')
```

## Logging rule

- `trace`: every request, socket event, or message.
- `debug`: operational steps and query-level detail.
- `info`: lifecycle milestones and meaningful state changes.
- `warn`: recoverable issues or unusual conditions.
- `error`: failed operations with context and error.
- `fatal`: unrecoverable process-level failures.

## Locker

```typescript
import { container, Locker, PgLocker } from '@wabot-dev/framework'

container.registerType(Locker, PgLocker)

const locker = container.resolve(Locker)

await locker.withKey('lead-sync').run(async () => {
  await syncLeads()
})

const maybeResult = await locker.withKey('lead-sync').tryRun(async () => {
  await syncLeads()
})
```

## Combining with entities

```typescript
await locker.withKey(lead).run(async () => {
  await leadService.qualify(lead.id)
})
```

## Rule of thumb

- Use logger for visibility.
- Use locker when duplicate processing would be harmful.
- Prefer small lock scopes so the critical section stays short.
