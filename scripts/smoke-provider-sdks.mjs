import assert from 'node:assert/strict'

import { AI_PROVIDERS, providerSdkSpecs } from '../lib/providers.mjs'

// framework 2.x: every provider SDK is an optional peer with a supported range.
const framework2 = {
  peerDependencies: {
    '@openrouter/sdk': '^0.12.2',
    openai: '^6.10.0',
    '@anthropic-ai/sdk': '^0.60.0',
    '@google/genai': '^1.51.0',
  },
  peerDependenciesMeta: {
    '@openrouter/sdk': { optional: true },
    openai: { optional: true },
    '@anthropic-ai/sdk': { optional: true },
    '@google/genai': { optional: true },
  },
}

// framework 1.x: required peers, npm already installed them with the framework.
const framework1 = { peerDependencies: { ...framework2.peerDependencies } }

const emptyProject = { dependencies: { '@wabot-dev/framework': '^2.0.0' } }
const fullProject = {
  dependencies: { '@openrouter/sdk': '^0.12.2', '@wabot-dev/framework': '^2.0.0' },
}

assert.deepEqual(
  AI_PROVIDERS.map((p) => p.sdkPackage),
  ['@openrouter/sdk', 'openai', '@anthropic-ai/sdk', '@google/genai'],
)

assert.deepEqual(
  providerSdkSpecs(['openrouter', 'anthropic'], framework2, emptyProject),
  ['@openrouter/sdk@^0.12.2', '@anthropic-ai/sdk@^0.60.0'],
  'installs the chosen SDKs in the range the framework declares',
)

assert.deepEqual(
  providerSdkSpecs(['openrouter', 'openai'], framework2, fullProject),
  ['openai@^6.10.0'],
  'skips an SDK the template already depends on',
)

assert.deepEqual(
  providerSdkSpecs(['openrouter', 'google'], framework1, emptyProject),
  [],
  'installs nothing for a framework whose SDKs are required peers',
)

assert.deepEqual(providerSdkSpecs(['unknown'], framework2, emptyProject), [])

console.log('Provider SDK smoke tests passed')
