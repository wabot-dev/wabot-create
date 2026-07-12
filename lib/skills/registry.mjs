import fs from 'fs'
import path from 'path'

import { resolveFrameworkSkillsDir } from './framework-source.mjs'

// Skills are owned and versioned by @wabot-dev/framework. The registry discovers
// them from the framework's packaged `skills/` directory rather than bundling its
// own copy, so adding a skill upstream requires no change here.

export function listSkillNames(skillsDir = resolveFrameworkSkillsDir()) {
  return fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() && fs.existsSync(path.join(skillsDir, entry.name, 'SKILL.md')),
    )
    .map((entry) => entry.name)
    .sort()
}

export function listSkills(skillsDir = resolveFrameworkSkillsDir()) {
  return listSkillNames(skillsDir).map((name) => ({
    name,
    sourceDir: path.join(skillsDir, name),
  }))
}

export function getSkill(name, skillsDir = resolveFrameworkSkillsDir()) {
  const sourceDir = path.join(skillsDir, name)
  if (!fs.existsSync(path.join(sourceDir, 'SKILL.md'))) {
    return null
  }
  return { name, sourceDir }
}
