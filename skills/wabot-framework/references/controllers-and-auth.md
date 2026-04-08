# Controllers And Auth

Use this when exposing HTTP endpoints, socket events, or protected routes.

## REST controller

```typescript
import { IncomingMessage } from 'http'
import { onPost, restController } from '@wabot-dev/framework'

class PaymentService {
  processWebhook(rawBody: string) {
    return { ok: true, rawBody }
  }
}

@restController('/webhooks/bold')
export class BoldWebhookController {
  constructor(private paymentService: PaymentService) {}

  @onPost({
    disableJsonParser: true,
    disableUrlEncodedParser: true,
  })
  async receiveWebhook(request: IncomingMessage) {
    const rawBody = await this.readRawBody(request)
    return this.paymentService.processWebhook(rawBody)
  }
}
```

## Socket controller

```typescript
import { jwtHandshakeGuard, onSocketEvent, socketController } from '@wabot-dev/framework'

@jwtHandshakeGuard()
@socketController('/sales')
export class SalesSocketController {
  @onSocketEvent('message')
  async onMessage(payload: { text: string }) {
    return { ok: true, received: payload.text }
  }
}
```

## JWT and API key auth

Use JWT when the client already has a signed token. Use API keys when the client should present a shared secret.

```typescript
import {
  apiKeyGuard,
  apiKeyHandshakeGuard,
  jwtGuard,
  jwtHandshakeGuard,
  onGet,
  onPost,
  restController,
  socketController,
} from '@wabot-dev/framework'

class CreateLeadDto {
  name!: string
}

class LeadService {
  async create(body: CreateLeadDto) {
    return { created: true, lead: body }
  }
}

@restController('/api/leads')
export class LeadApiController {
  constructor(private leadService: LeadService) {}

  @apiKeyGuard()
  @onGet()
  async listLeads() {
    return []
  }

  @jwtGuard()
  @onPost()
  async createLead(body: CreateLeadDto) {
    return this.leadService.create(body)
  }
}

@socketController('/lead-room')
@jwtHandshakeGuard()
export class LeadRoomSocketController {}

@apiKeyHandshakeGuard()
@socketController('/api-room')
export class ApiRoomSocketController {}
```

## Rule of thumb

- REST for request/response workflows, webhooks, and admin APIs.
- Socket for live events and long-lived sessions.
- JWT when the client already has a signed token.
- API key when the client should present a shared secret.
