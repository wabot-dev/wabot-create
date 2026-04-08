# Full Example

Use this when you need an end-to-end pattern that combines most of the framework.

## What this example covers

- project bootstrap
- mindset and chat routing
- external mindset module
- validation and mapper
- persistence
- REST and socket controllers
- JWT auth
- async command and cron
- logger and locker

## 1. Bootstrap

```typescript
import {
  ChatAdapter,
  ChatRepository,
  container,
  Env,
  PgChatRepository,
  runChatControllers,
  runRestControllers,
  WabotChatAdapter,
} from '@wabot-dev/framework'
import { Pool } from 'pg'

import { SalesChatController } from './controllers/SalesChatController'
import { SalesWebhookController } from './controllers/SalesWebhookController'

const env = container.resolve(Env)
container.registerInstance(Pool, new Pool({ connectionString: env.requireString('DATABASE_URL') }))
container.registerType(ChatAdapter, WabotChatAdapter)
container.registerType(ChatRepository, PgChatRepository)

runRestControllers([SalesWebhookController])
runChatControllers([SalesChatController])
```

## 2. Mindset and module

```typescript
import {
  type IMindset,
  type IMindsetIdentity,
  type IMindsetLlm,
  description,
  mindset,
  mindsetModule,
} from '@wabot-dev/framework'

@mindsetModule()
export class LeadInsightsModule {
  @description('Summarize the latest notes and suggest the next best action')
  async summarizeLead(req: { note: string }) {
    return `Next action: ${req.note}`
  }
}

@mindset({ modules: [LeadInsightsModule] })
export class SalesMindset implements IMindset {
  async context() {
    return 'Act like a helpful sales assistant.'
  }

  async identity(): Promise<IMindsetIdentity> {
    return { name: 'Martin', language: 'Español' }
  }

  async skills() {
    return 'Qualify leads, explain offers, and guide the next step.'
  }

  async limits() {
    return 'Do not invent prices or promise features that are not available.'
  }

  async workflow() {
    return 'Ask one clear question at a time and move toward qualification.'
  }

  async llms(): Promise<IMindsetLlm[]> {
    return [{ provider: 'openai', model: 'gpt-4o-mini' }]
  }
}
```

## 3. Validation and persistence

```typescript
import {
  Entity,
  Locker,
  Logger,
  Mapper,
  PgCrudRepository,
  type IEntityData,
  injectable,
  isNotEmpty,
  isNumber,
  isString,
  min,
  singleton,
} from '@wabot-dev/framework'
import { Pool } from 'pg'

export class CreateLeadDto {
  @isString()
  @isNotEmpty()
  name!: string

  @isNumber()
  @min(1)
  budget!: number
}

export interface LeadData extends IEntityData {
  name: string
  budget: number
  status: 'new' | 'qualified'
}

export class Lead extends Entity<LeadData> {}

@singleton()
export class LeadRepository extends PgCrudRepository<Lead> {
  constructor(pool: Pool) {
    super(pool, { table: 'leads', constructor: Lead })
  }
}

@injectable()
export class LeadService {
  constructor(
    private mapper: Mapper,
    private leads: LeadRepository,
    private logger: Logger,
    private locker: Locker,
  ) {}

  async create(raw: unknown) {
    const lead = this.mapper.map(raw, CreateLeadDto)
    await this.locker.withKey(`lead:${lead.name}`).run(async () => {
      this.logger.info('creating lead', { name: lead.name })
      await this.leads.create(new Lead({ name: lead.name, budget: lead.budget, status: 'new' }))
    })
  }
}
```

## 4. Chat controller

```typescript
import { chatBot, chatController, ChatBot, cmd, type IReceivedMessage } from '@wabot-dev/framework'

@chatController()
export class SalesChatController {
  constructor(@chatBot(SalesMindset) private bot: ChatBot) {}

  @cmd()
  async onMessage(context: IReceivedMessage) {
    const fallback = 'Puedo ayudarte a revisar el caso y registrar el siguiente paso.'

    await this.bot.sendMessage(context.message, async (replyMessage) => {
      await context.reply(replyMessage ?? { text: fallback })
    })
  }
}
```

## 5. REST and socket auth

```typescript
import {
  apiKeyGuard,
  apiKeyHandshakeGuard,
  jwtGuard,
  jwtHandshakeGuard,
  onGet,
  onPost,
  onSocketEvent,
  restController,
  socketController,
} from '@wabot-dev/framework'

@restController('/api/leads')
export class SalesApiController {
  constructor(private leadService: LeadService) {}

  @apiKeyGuard()
  @onGet()
  async list() {
    return []
  }

  @jwtGuard()
  @onPost()
  async create(body: CreateLeadDto) {
    return this.leadService.create(body)
  }
}

@socketController('/sales')
@jwtHandshakeGuard()
export class SalesSocketController {
  @onSocketEvent('ping')
  async ping() {
    return { ok: true }
  }
}

@apiKeyHandshakeGuard()
@socketController('/sales-admin')
export class SalesAdminSocketController {}
```

## 6. Async and cron

```typescript
import { Async, command, commandHandler, cron, isString } from '@wabot-dev/framework'

@command('sync-lead')
export class SyncLeadCommand {
  @isString()
  leadId!: string
}

@commandHandler(SyncLeadCommand)
export class SyncLeadHandler {
  constructor(private leadService: LeadService) {}

  async handle(input: SyncLeadCommand) {
    await this.leadService.create({ name: input.leadId, budget: 1 })
  }
}

@cron({ name: 'sync-leads', cron: '0 * * * *' })
export class SyncLeadsCron {
  constructor(private async: Async) {}

  async handle() {
    await this.async.runCommand(SyncLeadCommand, { leadId: 'all' })
  }
}
```

## 7. Operational guardrails

```typescript
import { container, Locker, Logger, PgLocker } from '@wabot-dev/framework'
import { injectable } from '@wabot-dev/framework'

container.registerType(Locker, PgLocker)

@injectable()
export class SalesOpsService {
  constructor(private locker: Locker) {}

  async sync() {
    const logger = new Logger('sales:app')
    logger.info('app started')

    await this.locker.withKey('sales-sync').run(async () => {
      logger.debug('syncing leads')
    })
  }
}
```

## Read this example when

- the user wants the whole flow
- the task spans several framework areas
- the answer needs a working mental model, not just one decorator
