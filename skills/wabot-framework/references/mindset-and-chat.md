# Mindset And Chat

Use this when defining bot behavior or routing chat messages.

## Mindset shape

```typescript
import { type IMindset, type IMindsetIdentity, type IMindsetLlm, mindset } from '@wabot-dev/framework'
import { description, mindsetModule } from '@wabot-dev/framework'

class LeadNotesDto {
  note!: string
}

@mindsetModule()
export class SalesInsightsModule {
  @description('Summarize the lead history and suggest the next action')
  async summarizeLead(input: LeadNotesDto) {
    return `Lead note: ${input.note}`
  }
}

@mindset({ modules: [SalesInsightsModule] })
export class SalesMindset implements IMindset {
  async context(): Promise<string> {
    return 'You are a helpful sales assistant that keeps replies short and concrete.'
  }

  async identity(): Promise<IMindsetIdentity> {
    return {
      name: 'Martin',
      language: 'Español',
      personality: 'Calmo, persuasivo y orientado a resultados',
      emotions: 'Empatico, confiado y directo',
    }
  }

  async skills(): Promise<string> {
    return `
      Calificar prospectos.
      Explicar beneficios con claridad.
      Manejar objeciones sin presionar.
    `
  }

  async limits(): Promise<string> {
    return `
      No prometer funciones que no existen.
      No inventar precios ni descuentos.
      No pedir datos sensibles.
    `
  }

  async workflow(): Promise<string> {
    return `
      1. Entender la necesidad.
      2. Hacer una pregunta clara.
      3. Registrar datos utiles.
      4. Proponer el siguiente paso.
    `
  }

  async llms(): Promise<IMindsetLlm[]> {
    return [{ provider: 'openai', model: 'gpt-4o-mini' }]
  }
}
```

## Mindset module

Use a module when the mindset needs an extra tool-like function.

## Chat controller

```typescript
import { chatBot, chatController, ChatBot, cmd, type IReceivedMessage } from '@wabot-dev/framework'

@chatController()
export class SalesChatController {
  constructor(@chatBot(SalesMindset) private bot: ChatBot) {}

  @cmd()
  async onMessage(context: IReceivedMessage) {
    const fallback = 'Te ayudo a elegir una solucion y avanzar al siguiente paso.'

    await this.bot.sendMessage(context.message, async (replyMessage) => {
      await context.reply(replyMessage ?? { text: fallback })
    })
  }
}
```

## Good practice

- Put policy and personality in the mindset.
- Put business rules in services or modules.
- Keep the controller only as an entry point and reply bridge.
