// AI providers the creator offers. Each maps to the env key the framework reads
// to enable it and to the SDK its adapter needs.
export const AI_PROVIDERS = [
  {
    value: 'openrouter',
    title: 'OpenRouter',
    descriptionKey: 'providers.openrouter',
    envKey: 'OPENROUTER_API_KEY',
    sdkPackage: '@openrouter/sdk',
  },
  {
    value: 'openai',
    title: 'OpenAI',
    descriptionKey: 'providers.openai',
    envKey: 'OPENAI_API_KEY',
    sdkPackage: 'openai',
  },
  {
    value: 'anthropic',
    title: 'Anthropic',
    descriptionKey: 'providers.anthropic',
    envKey: 'ANTHROPIC_API_KEY',
    sdkPackage: '@anthropic-ai/sdk',
  },
  {
    value: 'google',
    title: 'Google',
    descriptionKey: 'providers.google',
    envKey: 'GOOGLE_API_KEY',
    sdkPackage: '@google/genai',
  },
]

// The `npm install` specs for the SDKs of the chosen providers. Since framework
// 2.0 each SDK is an optional peer dependency: npm does not install it, so the
// project must. The range comes from the installed framework, so npm never picks
// a version it does not support. Skipped: an SDK the project already declares
// (the full template depends on OpenRouter's), and one the framework does not
// declare as optional (before 2.0 every SDK was a required peer, already
// installed with it).
export function providerSdkSpecs(providers, frameworkPackageJson, projectPackageJson) {
  const declared = {
    ...projectPackageJson.dependencies,
    ...projectPackageJson.devDependencies,
  }
  const specs = []
  for (const value of providers) {
    const provider = AI_PROVIDERS.find((p) => p.value === value)
    if (!provider) continue
    const { sdkPackage } = provider
    if (declared[sdkPackage]) continue
    if (frameworkPackageJson.peerDependenciesMeta?.[sdkPackage]?.optional !== true) continue
    const range = frameworkPackageJson.peerDependencies?.[sdkPackage]
    specs.push(range ? `${sdkPackage}@${range}` : sdkPackage)
  }
  return specs
}
