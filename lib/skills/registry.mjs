import { fileURLToPath } from 'url'

const skillDefinitions = {
  'wabot-framework': {
    name: 'wabot-framework',
    sourceDir: fileURLToPath(new URL('../../skills/wabot-framework', import.meta.url)),
    description: 'Wabot Framework packaged skill',
  },
}

export function getSkill(skillName) {
  return skillDefinitions[skillName] ?? null
}

export function listSkillNames() {
  return Object.keys(skillDefinitions).sort()
}