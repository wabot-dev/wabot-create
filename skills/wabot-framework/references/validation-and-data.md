# Validation And Data

Use this when shaping DTOs or mapping raw data into typed objects.

## Common validators

```typescript
import {
  isArray,
  isBoolean,
  isDate,
  isIn,
  isModel,
  isNotEmpty,
  isNumber,
  isOptional,
  isPresent,
  isRecord,
  isString,
  max,
  min,
} from '@wabot-dev/framework'

export class AddressDto {
  @isString()
  @isNotEmpty()
  street!: string
}

export class CreateLeadDto {
  @isString()
  @isPresent()
  @isNotEmpty()
  name!: string

  @isNumber()
  @min(1)
  @max(1000)
  budget!: number

  @isBoolean()
  isQualified!: boolean

  @isDate()
  followUpAt?: Date

  @isString()
  @isIn(['new', 'qualified', 'won', 'lost'])
  status!: string

  @isArray({ minLength: 1 })
  @isString()
  tags!: string[]

  @isModel(AddressDto)
  address?: AddressDto

  @isRecord('string', 'string')
  metadata?: Record<string, string>

  @isString()
  @isOptional()
  source?: string
}
```

## Mapper

```typescript
import { injectable, Mapper } from '@wabot-dev/framework'

@injectable()
export class LeadService {
  constructor(private mapper: Mapper) {}

  create(raw: unknown) {
    const lead = this.mapper.map(raw, CreateLeadDto)
    return lead
  }
}
```

## Practical rule

- Use validation decorators on the DTO itself.
- Use `Mapper` when the input is raw, unknown, or nested.
- Keep transformation and validation together before the service work starts.

