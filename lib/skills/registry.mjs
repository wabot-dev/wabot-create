import { fileURLToPath } from 'url'

function packagedSkill(name, description) {
  return {
    name,
    description,
    sourceDir: fileURLToPath(new URL(`../../skills/${name}`, import.meta.url)),
  }
}

const skillDefinitions = {
  'wabot-framework': packagedSkill(
    'wabot-framework',
    'Umbrella skill — project boot, layout, scripts, and where to dive for each subsystem',
  ),
  'wabot-di-config': packagedSkill(
    'wabot-di-config',
    'DI lifecycles, Env, and typed config references',
  ),
  'wabot-validation': packagedSkill(
    'wabot-validation',
    'Validators, @description, validateAndTransform, Mapper',
  ),
  'wabot-persistence': packagedSkill(
    'wabot-persistence',
    'Entities, repositories, query DSL, mem/pg extensions',
  ),
  'wabot-mindset': packagedSkill(
    'wabot-mindset',
    'Mindsets, modules, models, ChatOperator',
  ),
  'wabot-chat': packagedSkill(
    'wabot-chat',
    'Chat controllers, channels (cmd/socket/telegram/whatsapp/wasender), chat-bot adapters',
  ),
  'wabot-rest-socket': packagedSkill(
    'wabot-rest-socket',
    'REST and Socket.IO controllers, middlewares, handshake guards',
  ),
  'wabot-async': packagedSkill(
    'wabot-async',
    'Commands, cron handlers, @transaction, the Async service',
  ),
  'wabot-auth': packagedSkill(
    'wabot-auth',
    'Auth<D> scope, JWT and API key guards, token issuing',
  ),
  'wabot-ops': packagedSkill(
    'wabot-ops',
    'Logger, Locker, CustomError, Password, Random',
  ),
  'wabot-testing': packagedSkill(
    'wabot-testing',
    'Unit harnesses (chat/REST/async), MockChatAdapter, LlmJudge evals, fixtures',
  ),
}

export function getSkill(skillName) {
  return skillDefinitions[skillName] ?? null
}

export function listSkillNames() {
  return Object.keys(skillDefinitions).sort()
}

export function listSkills() {
  return listSkillNames().map((name) => skillDefinitions[name])
}
