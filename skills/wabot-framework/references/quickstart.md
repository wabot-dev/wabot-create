# Quickstart

Use this when starting a new Wabot app or explaining how the app boots.

## Minimal bootstrap

```typescript
import {
  ChatAdapter,
  ChatRepository,
  container,
  Env,
  PgChatRepository,
  runChatControllers,
  WabotChatAdapter,
} from '@wabot-dev/framework'
import { Pool } from 'pg'

import { MyChatController } from './controllers/MyChatController'

const env = container.resolve(Env)

container.registerInstance(
  Pool,
  new Pool({ connectionString: env.requireString('DATABASE_URL') }),
)
container.registerType(ChatAdapter, WabotChatAdapter)
container.registerType(ChatRepository, PgChatRepository)

runChatControllers([MyChatController])
```

## Starter flow

1. Create the app scaffold.
2. Add the database connection.
3. Register the chat adapter and chat repository.
4. Run the chat controller.

## Typical files

```text
src/
  run.ts
  controllers/MyChatController.ts
  mindsets/MyMindset.ts
```

## First commands

```bash
npx @wabot-dev/create
npm install
npm run dev
```

