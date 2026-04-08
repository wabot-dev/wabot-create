# Core Patterns

Use this when deciding how to register and inject services.

## Lifecycles

| Decorator | Use for | Example |
| --- | --- | --- |
| `@singleton()` | Shared clients, repositories, config, caches | one DB repository for the app |
| `@injectable()` | Stateless services and modules | calculators, adapters, helpers |
| `@scoped(Lifecycle.ContainerScoped)` | Request/chat/socket-local state | auth context, request context |

## Singleton example

```typescript
import { singleton } from '@wabot-dev/framework'

@singleton()
export class ProductRepository {
  private products = new Map<string, string>()

  save(id: string, name: string) {
    this.products.set(id, name)
  }
}
```

## Injectable example

```typescript
import { injectable } from '@wabot-dev/framework'

@injectable()
export class QuoteCalculator {
  total(base: number, discount: number) {
    return base - base * discount
  }
}
```

## Scoped example

```typescript
import { Lifecycle, scoped } from '@wabot-dev/framework'

@scoped(Lifecycle.ContainerScoped)
export class RequestContext {
  private userId?: string

  setUserId(userId: string) {
    this.userId = userId
  }

  requireUserId() {
    if (!this.userId) throw new Error('Unauthorized')
    return this.userId
  }
}
```

## Token injection

```typescript
import { container, inject, injectable } from '@wabot-dev/framework'

container.register('SMTP_HOST', { useValue: 'smtp.example.com' })
container.register('SMTP_PORT', { useValue: 587 })

@injectable()
export class Mailer {
  constructor(
    @inject('SMTP_HOST') private smtpHost: string,
    @inject('SMTP_PORT') private smtpPort: number,
  ) {}
}
```

## Rule of thumb

- Use singleton for shared infrastructure.
- Use injectable for pure business logic.
- Use scoped only when state must not leak across requests or chats.

