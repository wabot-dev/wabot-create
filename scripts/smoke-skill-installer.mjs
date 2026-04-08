import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const cliPath = path.join(repoRoot, 'bin', 'create-wabot.mjs')

run()

function run() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'wabot-skill-smoke-'))

  try {
    testExplicitHomeAndSingleTarget(tempRoot)
    testMultipleTargets(tempRoot)
    testUnknownTarget(tempRoot)
    testDuplicateTargets(tempRoot)
    testExistingDestinationConflict(tempRoot)
    console.log('Skill installer smoke tests passed')
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true })
  }
}

function testExplicitHomeAndSingleTarget(tempRoot) {
  const homeRoot = path.join(tempRoot, 'home-claude')
  const result = runCli([
    'skill',
    'add',
    'wabot-framework',
    '--global',
    '--home',
    homeRoot,
    '--target',
    'claude',
  ])

  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /Target: claude/)
  assertExists(path.join(homeRoot, '.claude', 'skills', 'wabot-framework', 'SKILL.md'))
}

function testMultipleTargets(tempRoot) {
  const homeRoot = path.join(tempRoot, 'home-multi')
  const result = runCli([
    'skill',
    'add',
    'wabot-framework',
    '--global',
    '--home',
    homeRoot,
    '--targets',
    'agents,codex,claude',
  ])

  assert.equal(result.status, 0, result.stderr)
  assertExists(path.join(homeRoot, '.agents', 'skills', 'wabot-framework', 'SKILL.md'))
  assertExists(path.join(homeRoot, '.codex', 'skills', 'wabot-framework', 'SKILL.md'))
  assertExists(path.join(homeRoot, '.claude', 'skills', 'wabot-framework', 'SKILL.md'))
}

function testUnknownTarget(tempRoot) {
  const homeRoot = path.join(tempRoot, 'home-unknown-target')
  const result = runCli([
    'skill',
    'add',
    'wabot-framework',
    '--global',
    '--home',
    homeRoot,
    '--target',
    'cursor',
  ])

  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /Unsupported target "cursor"/)
}

function testDuplicateTargets(tempRoot) {
  const homeRoot = path.join(tempRoot, 'home-duplicate-targets')
  const result = runCli([
    'skill',
    'add',
    'wabot-framework',
    '--global',
    '--home',
    homeRoot,
    '--targets',
    'codex,codex',
  ])

  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /Duplicate targets are not allowed/)
}

function testExistingDestinationConflict(tempRoot) {
  const homeRoot = path.join(tempRoot, 'home-existing')
  const firstRun = runCli([
    'skill',
    'add',
    'wabot-framework',
    '--global',
    '--home',
    homeRoot,
    '--targets',
    'codex,claude',
  ])
  assert.equal(firstRun.status, 0, firstRun.stderr)

  const secondRun = runCli([
    'skill',
    'add',
    'wabot-framework',
    '--global',
    '--home',
    homeRoot,
    '--targets',
    'codex,claude',
  ])

  assert.notEqual(secondRun.status, 0)
  assert.match(secondRun.stderr, /Skill already exists/)
}

function runCli(args, env = {}) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: repoRoot,
    env: {
      ...process.env,
      ...env,
    },
    encoding: 'utf-8',
  })
}

function assertExists(targetPath) {
  assert.equal(fs.existsSync(targetPath), true, `Expected path to exist: ${targetPath}`)
}
