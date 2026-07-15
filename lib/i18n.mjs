const STRINGS = {
  en: {
    'intro.title': '🤖  Wabot project creator',
    'intro.line1': 'This wizard will scaffold a new chat-bot project from the',
    'intro.line2': (template, env) => `${template} starter and configure your ${env}.`,
    'intro.askAbout': 'You will be asked about:',
    'intro.bullet.template': 'which starter to scaffold (empty or full example)',
    'intro.bullet.storage': 'where to store data (in-memory or PostgreSQL)',
    'intro.bullet.providers': 'which AI providers you want to use',

    'template.prompt': 'Which starter do you want?',
    'template.empty': 'Empty (just the runner — build from scratch with the skills)',
    'template.full': 'Full example (local chat bot + web UI, no third-party channels)',
    'design.prompt': 'Also install the wabot-design design-system skill?',

    'node.required': (required, current) =>
      `✖ Node.js ${required} is required (you are running ${current}).`,
    'node.templatePin': (required, nvmrc) =>
      `The Wabot template pins Node ${required} in its ${nvmrc}.`,
    'node.installHint': (nvm) => `We recommend installing it with ${nvm}:`,
    'node.noNvm': (url) => `Don't have nvm? See ${url}`,

    'project.namePrompt': 'What is your project named?',
    'project.nameRequired': 'Project name is required',
    'project.cancelled': 'Setup cancelled',
    'project.exists': (name) => `Directory ${name} already exists`,
    'project.creating': (dir) => `\nCreating a new Wabot project in ${dir}\n`,
    'project.templateSource': (repo) => `  Using template source: ${repo}`,

    'storage.prompt': 'How do you want to store data?',
    'storage.memory': 'In-memory (quickest start, data resets on restart)',
    'storage.postgres': 'PostgreSQL (persistent, recommended for real bots)',
    'storage.dbUrlPrompt': 'DATABASE_URL (leave blank to fill in later):',

    'providers.prompt': 'Which AI providers will you use? (space to toggle, enter to confirm)',
    'providers.hint': 'At least one is required to run the included Pixel example',
    'providers.apiKeyPrompt': (envKey) => `${envKey} (leave blank to fill in later):`,
    'providers.openrouter': 'Used by the included Pixel example',
    'providers.openai': 'GPT models via the official OpenAI API',
    'providers.anthropic': 'Claude models',
    'providers.google': 'Gemini models',

    'skills.installPrompt': 'Install Wabot agent skills into the new project?',
    'skills.agentsPrompt': 'Install for which agents? (space to toggle, enter to confirm)',
    'skills.agentsHint': 'Each adds a folder of <agent>/skills under the project root',
    'skills.installing': '\nInstalling Wabot agent skills...\n',
    'skills.installed': (agent, count, dir) =>
      `  ✔ ${agent}: installed ${count} skill(s) into ${dir}`,
    'skills.skipped': (count) =>
      `  ⚠  ${count} skill folder(s) already existed and were left untouched.`,
    'skills.failed': (msg) => `  ✖ Failed to install agent skills: ${msg}`,
    'skills.installLater':
      '  You can install/refresh them later with `npx wabot-skills sync`.',

    'deps.installing': '\nInstalling dependencies with npm...\n',
    'deps.exitCode': (code) => `npm install exited with code ${code}`,

    'env.debugComment': '# debug important things',
    'env.postgresComment': '# postgres connection string',
    'env.inMemoryComment':
      '# using in-memory storage (set DATABASE_URL to switch to postgres)',
    'env.providersComment': '# AI provider keys',

    'next.ready': (name) => `\n✔ Project ${name} is ready.\n`,
    'next.dbUrlEmpty': '  ⚠  DATABASE_URL is empty — set it in .env before running.',
    'next.missingKeys': (keys) => `  ⚠  Missing API keys in .env: ${keys}`,
    'next.heading': '\nNext steps:',
    'next.cmdChannelHint':
      '\nIn another terminal, open a CLI to chat with your bot:',
    'next.happy': '\nHappy hacking! 🚀\n',

    'agent.label.claude': 'Claude Code (.claude/skills)',
    'agent.label.codex': 'Codex (.codex/skills)',
    'agent.label.agents': 'Generic agents (.agents/skills)',
  },

  es: {
    'intro.title': '🤖  Creador de proyectos Wabot',
    'intro.line1': 'Este asistente generará un nuevo proyecto de chat-bot a partir de',
    'intro.line2': (template, env) =>
      `la plantilla ${template} y configurará tu archivo ${env}.`,
    'intro.askAbout': 'Te preguntaremos sobre:',
    'intro.bullet.template': 'con qué plantilla empezar (vacía o ejemplo completo)',
    'intro.bullet.storage': 'dónde almacenar los datos (en memoria o PostgreSQL)',
    'intro.bullet.providers': 'qué proveedores de IA deseas usar',

    'template.prompt': '¿Con qué plantilla quieres empezar?',
    'template.empty': 'Vacía (solo el runner — construye desde cero con las skills)',
    'template.full': 'Ejemplo completo (chat bot local + UI web, sin canales de terceros)',
    'design.prompt': '¿Instalar también la skill del sistema de diseño wabot-design?',

    'node.required': (required, current) =>
      `✖ Se requiere Node.js ${required} (estás usando ${current}).`,
    'node.templatePin': (required, nvmrc) =>
      `La plantilla de Wabot fija Node ${required} en su ${nvmrc}.`,
    'node.installHint': (nvm) => `Recomendamos instalarlo con ${nvm}:`,
    'node.noNvm': (url) => `¿No tienes nvm? Consulta ${url}`,

    'project.namePrompt': '¿Cómo se llama tu proyecto?',
    'project.nameRequired': 'El nombre del proyecto es obligatorio',
    'project.cancelled': 'Configuración cancelada',
    'project.exists': (name) => `El directorio ${name} ya existe`,
    'project.creating': (dir) => `\nCreando un nuevo proyecto Wabot en ${dir}\n`,
    'project.templateSource': (repo) => `  Usando fuente del template: ${repo}`,

    'storage.prompt': '¿Cómo deseas almacenar los datos?',
    'storage.memory': 'En memoria (inicio más rápido, los datos se pierden al reiniciar)',
    'storage.postgres': 'PostgreSQL (persistente, recomendado para bots reales)',
    'storage.dbUrlPrompt': 'DATABASE_URL (déjalo en blanco para completarlo después):',

    'providers.prompt':
      '¿Qué proveedores de IA usarás? (espacio para alternar, enter para confirmar)',
    'providers.hint':
      'Se requiere al menos uno para ejecutar el ejemplo Pixel incluido',
    'providers.apiKeyPrompt': (envKey) =>
      `${envKey} (déjalo en blanco para completarlo después):`,
    'providers.openrouter': 'Usado por el ejemplo Pixel incluido',
    'providers.openai': 'Modelos GPT mediante la API oficial de OpenAI',
    'providers.anthropic': 'Modelos Claude',
    'providers.google': 'Modelos Gemini',

    'skills.installPrompt': '¿Instalar las skills de agente de Wabot en el nuevo proyecto?',
    'skills.agentsPrompt':
      '¿Para qué agentes instalarlas? (espacio para alternar, enter para confirmar)',
    'skills.agentsHint':
      'Cada uno añade una carpeta <agente>/skills en la raíz del proyecto',
    'skills.installing': '\nInstalando skills de agente Wabot...\n',
    'skills.installed': (agent, count, dir) =>
      `  ✔ ${agent}: se instalaron ${count} skill(s) en ${dir}`,
    'skills.skipped': (count) =>
      `  ⚠  ${count} carpeta(s) de skill ya existían y no se modificaron.`,
    'skills.failed': (msg) => `  ✖ Fallo al instalar las skills de agente: ${msg}`,
    'skills.installLater':
      '  Puedes instalarlas/actualizarlas más tarde con `npx wabot-skills sync`.',

    'deps.installing': '\nInstalando dependencias con npm...\n',
    'deps.exitCode': (code) => `npm install terminó con código ${code}`,

    'env.debugComment': '# depurar lo importante',
    'env.postgresComment': '# cadena de conexión de postgres',
    'env.inMemoryComment':
      '# usando almacenamiento en memoria (define DATABASE_URL para cambiar a postgres)',
    'env.providersComment': '# claves de proveedores de IA',

    'next.ready': (name) => `\n✔ El proyecto ${name} está listo.\n`,
    'next.dbUrlEmpty':
      '  ⚠  DATABASE_URL está vacío — defínelo en .env antes de ejecutar.',
    'next.missingKeys': (keys) => `  ⚠  Faltan claves de API en .env: ${keys}`,
    'next.heading': '\nPróximos pasos:',
    'next.cmdChannelHint':
      '\nEn otra terminal, abre una CLI para chatear con tu bot:',
    'next.happy': '\n¡Feliz desarrollo! 🚀\n',

    'agent.label.claude': 'Claude Code (.claude/skills)',
    'agent.label.codex': 'Codex (.codex/skills)',
    'agent.label.agents': 'Agentes genéricos (.agents/skills)',
  },
}

export const SUPPORTED_LANGS = Object.keys(STRINGS)
export const DEFAULT_LANG = 'en'

export function resolveLang(lang) {
  if (!lang) return DEFAULT_LANG
  const normalized = String(lang).toLowerCase()
  return SUPPORTED_LANGS.includes(normalized) ? normalized : DEFAULT_LANG
}

export function createTranslator(lang) {
  const resolved = resolveLang(lang)
  const dict = STRINGS[resolved]
  const fallback = STRINGS[DEFAULT_LANG]

  return function t(key, ...args) {
    const value = dict[key] ?? fallback[key]
    if (value === undefined) return key
    return typeof value === 'function' ? value(...args) : value
  }
}
