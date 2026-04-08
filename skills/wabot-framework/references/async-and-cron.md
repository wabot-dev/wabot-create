# Async And Cron

Use this when scheduling work in the background or recurring jobs.

## Command and handler

```typescript
import { command, commandHandler, type ICommandHandler } from '@wabot-dev/framework'
import { isString } from '@wabot-dev/framework'

@command('save-test-tag')
export class SaveTestTag {
  @isString()
  value!: string
}

@commandHandler(SaveTestTag)
export class SaveTestTagHandler implements ICommandHandler<SaveTestTag> {
  constructor(private tags: TagRepository) {}

  async handle(input: SaveTestTag) {
    await this.tags.save(input.value)
  }
}
```

## Run or schedule a command

```typescript
import { Async } from '@wabot-dev/framework'

const job = await async.runCommand(SaveTestTag, { value: 'hello' })
await async.scheduleCommand(SaveTestTag, { value: 'later' }, { minutes: 10 })
```

## Cron handler

```typescript
import { cron } from '@wabot-dev/framework'

@cron({ name: 'sync-leads', cron: '0 * * * *' })
export class SyncLeadsCron {
  constructor(private leadService: LeadService) {}

  async handle() {
    await this.leadService.sync()
  }
}
```

## Good practice

- Use commands for one-off background work.
- Use cron for repeated schedules.
- Keep command DTOs validated and small.
- Keep cron handlers idempotent because they can run many times.

