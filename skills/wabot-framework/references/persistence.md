# Persistence

Use this when saving or loading domain information from PostgreSQL.

## Entity

```typescript
import { Entity, PgCrudRepository, type IEntityData, injectable, singleton, Locker, Logger } from '@wabot-dev/framework'
import { Pool } from 'pg'

export interface LeadData extends IEntityData {
  name: string
  budget: number
  status: 'new' | 'qualified' | 'won' | 'lost'
}

export class Lead extends Entity<LeadData> {
  get name() {
    return this['data'].name
  }

  setQualified() {
    this.update({ status: 'qualified' })
  }
}
```

## Repository

```typescript
import { singleton } from '@wabot-dev/framework'
import { Pool } from 'pg'
import { PgCrudRepository } from '@wabot-dev/framework'

@singleton()
export class LeadRepository extends PgCrudRepository<Lead> {
  constructor(pool: Pool) {
    super(pool, {
      table: 'leads',
      constructor: Lead,
    })
  }
}
```

## Service using the repository

```typescript
import { injectable } from '@wabot-dev/framework'

@injectable()
export class LeadService {
  constructor(
    private leads: LeadRepository,
    private locker: Locker,
    private logger: Logger,
  ) {}

  async qualify(id: string) {
    return await this.locker.withKey(`lead:${id}`).run(async () => {
      const lead = await this.leads.findOrThrow(id)
      lead.setQualified()
      this.logger.info('lead qualified', { id })
      await this.leads.update(lead)
      return lead
    })
  }
}
```

## Lock key

Entities already provide a `lockerKey()` implementation through `Entity`, so they can be used with the lock system.

```typescript
await locker.withKey(lead).run(async () => {
  await leadService.qualify(lead.id)
})
```

## Rule of thumb

- Keep persistence logic in repositories.
- Keep domain rules in entities or services.
- Let services orchestrate repository calls.
