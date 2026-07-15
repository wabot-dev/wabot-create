import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { installSkillsInProject, listSupportedAgents } from '../lib/skills/install.mjs'
import { listSkills, listSkillNames } from '../lib/skills/registry.mjs'

const EXPECTED_SKILLS = [
  'wabot-agents',
  'wabot-async',
  'wabot-auth',
  'wabot-chat',
  'wabot-design',
  'wabot-di-config',
  'wabot-framework',
  'wabot-mindset',
  'wabot-ops',
  'wabot-persistence',
  'wabot-rest-socket',
  'wabot-testing',
  'wabot-ui',
  'wabot-validation',
  'wabot-voice',
]

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'wabot-bulk-skills-'))

try {
  testRegistryEnumeration()
  await testInstallAllAgentsAllSkills(tempRoot)
  await testIdempotentReinstall(tempRoot)
  await testSubsetSelection(tempRoot)
  await testUnknownAgent(tempRoot)
  console.log('Bulk skills installer smoke tests passed')
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true })
}

function testRegistryEnumeration() {
  const names = listSkillNames()
  assert.deepEqual(names, EXPECTED_SKILLS, 'registry should expose the 15 packaged skills, sorted')

  const skills = listSkills()
  assert.equal(skills.length, EXPECTED_SKILLS.length)
  for (const skill of skills) {
    const skillFile = path.join(skill.sourceDir, 'SKILL.md')
    assert.equal(fs.existsSync(skillFile), true, `Missing SKILL.md for ${skill.name}`)
    const text = fs.readFileSync(skillFile, 'utf-8')
    assert.match(text, /^---\nname:\s*\S+/, `Bad frontmatter on ${skill.name}/SKILL.md`)
    assert.match(text, /description:\s*\S/, `Missing description in ${skill.name}/SKILL.md`)
  }
}

async function testInstallAllAgentsAllSkills(root) {
  const projectDir = path.join(root, 'all')
  fs.mkdirSync(projectDir, { recursive: true })

  const result = await installSkillsInProject(projectDir, listSupportedAgents())

  assert.deepEqual(result.agents.sort(), listSupportedAgents().sort())
  assert.deepEqual(result.skills.sort(), EXPECTED_SKILLS.slice().sort())
  assert.equal(
    result.installations.length,
    result.agents.length * result.skills.length,
    'should produce one installation entry per agent × skill',
  )

  for (const item of result.installations) {
    assert.equal(item.status, 'installed', `expected install but got ${item.status} for ${item.skill}`)
    const expectedRoot = path.join(projectDir, `.${item.agent}`, 'skills', item.skill)
    assert.equal(item.installDir, expectedRoot)
    assert.equal(fs.existsSync(path.join(item.installDir, 'SKILL.md')), true)
  }
}

async function testIdempotentReinstall(root) {
  const projectDir = path.join(root, 'idempotent')
  fs.mkdirSync(projectDir, { recursive: true })

  await installSkillsInProject(projectDir, ['claude'], ['wabot-framework', 'wabot-mindset'])

  const second = await installSkillsInProject(projectDir, ['claude'], ['wabot-framework', 'wabot-mindset'])

  for (const item of second.installations) {
    assert.equal(item.status, 'skipped', `expected skipped on re-install, got ${item.status} for ${item.skill}`)
  }
}

async function testSubsetSelection(root) {
  const projectDir = path.join(root, 'subset')
  fs.mkdirSync(projectDir, { recursive: true })

  const result = await installSkillsInProject(projectDir, ['claude'], ['wabot-async', 'wabot-auth'])

  assert.deepEqual(result.skills, ['wabot-async', 'wabot-auth'])
  assert.equal(result.installations.length, 2)
  assert.equal(fs.existsSync(path.join(projectDir, '.claude', 'skills', 'wabot-async', 'SKILL.md')), true)
  assert.equal(fs.existsSync(path.join(projectDir, '.claude', 'skills', 'wabot-auth', 'SKILL.md')), true)
  assert.equal(fs.existsSync(path.join(projectDir, '.claude', 'skills', 'wabot-ops')), false)
}

async function testUnknownAgent(root) {
  const projectDir = path.join(root, 'unknown-agent')
  fs.mkdirSync(projectDir, { recursive: true })

  await assert.rejects(
    () => installSkillsInProject(projectDir, ['cursor']),
    /Unsupported agent "cursor"/,
  )
}
