import fs from 'fs/promises'
import os from 'os'
import path from 'path'

import { getSkill, listSkillNames, listSkills } from './registry.mjs'

const supportedAgents = {
  codex: ['.codex', 'skills'],
  claude: ['.claude', 'skills'],
  agents: ['.agents', 'skills'],
}

export function listSupportedAgents() {
  return Object.keys(supportedAgents)
}

export async function installSkillsInProject(projectDir, agents, skillNames) {
  if (!projectDir) {
    throw new Error('installSkillsInProject: projectDir is required')
  }

  const resolvedAgents = (agents && agents.length > 0 ? agents : ['claude']).map((agent) => {
    if (!supportedAgents[agent]) {
      throw new Error(
        `Unsupported agent "${agent}". Supported: ${Object.keys(supportedAgents).join(', ')}`,
      )
    }
    return agent
  })

  const skills =
    skillNames && skillNames.length > 0 ? skillNames.map((name) => requireSkill(name)) : listSkills()

  const installations = []

  for (const agent of resolvedAgents) {
    const baseDir = path.join(projectDir, ...supportedAgents[agent])
    await fs.mkdir(baseDir, { recursive: true })

    for (const skill of skills) {
      const installDir = path.join(baseDir, skill.name)
      try {
        await fs.cp(skill.sourceDir, installDir, {
          recursive: true,
          force: false,
          errorOnExist: true,
        })
        installations.push({ agent, skill: skill.name, installDir, status: 'installed' })
      } catch (error) {
        if (error?.code === 'ERR_FS_CP_EEXIST' || error?.code === 'EEXIST') {
          installations.push({ agent, skill: skill.name, installDir, status: 'skipped' })
          continue
        }
        throw error
      }
    }
  }

  return { agents: resolvedAgents, skills: skills.map((skill) => skill.name), installations }
}

function requireSkill(name) {
  const skill = getSkill(name)
  if (!skill) {
    throw new Error(
      `Unknown skill "${name}". Available skills: ${listSkillNames().join(', ')}`,
    )
  }
  return skill
}

export async function installSkill(skillName, options, cwd = process.cwd()) {
  const skill = getSkill(skillName)

  if (!skill) {
    throw new Error(
      `Unknown skill "${skillName}". Available skills: ${listSkillNames().join(', ')}`,
    )
  }

  const plan = await buildInstallPlan(skill, options, cwd)

  for (const destination of plan.destinations) {
    await fs.mkdir(destination.baseDir, { recursive: true })
    await fs.cp(skill.sourceDir, destination.installDir, {
      recursive: true,
      force: false,
      errorOnExist: true,
    })
  }

  return {
    skill,
    mode: plan.mode,
    homeRoot: plan.homeRoot,
    installations: plan.destinations.map((destination) => ({
      agent: destination.agent,
      installDir: destination.installDir,
    })),
  }
}

async function buildInstallPlan(skill, options, cwd) {
  await assertPathExists(skill.sourceDir, `Packaged skill source not found at ${skill.sourceDir}`)

  if (options.local && options.global) {
    throw new Error('Choose only one install mode: --local or --global')
  }

  if (!options.global && (options.target || options.targets || options.home)) {
    throw new Error('--home, --target, and --targets can only be used together with --global')
  }

  if (options.local) {
    const installDir = path.join(cwd, '.agents', 'skills', skill.name)
    await assertDestinationAvailable(installDir)

    return {
      mode: 'local',
      homeRoot: null,
      destinations: [
        {
          agent: 'agents',
          baseDir: path.join(cwd, '.agents', 'skills'),
          installDir,
        },
      ],
    }
  }

  const homeRoot = resolveHomeRoot(options.home)
  const targets = resolveTargets(options)
  const destinations = targets.map((agent) => {
    const baseDir = resolveAgentSkillsDir(homeRoot, agent)

    return {
      agent,
      baseDir,
      installDir: path.join(baseDir, skill.name),
    }
  })

  await Promise.all(destinations.map((destination) => assertDestinationAvailable(destination.installDir)))

  return {
    mode: 'global',
    homeRoot,
    destinations,
  }
}

function resolveTargets(options) {
  const parsedTargets = []

  if (options.target) {
    parsedTargets.push(options.target)
  }

  if (options.targets) {
    parsedTargets.push(
      ...String(options.targets)
        .split(',')
        .map((target) => target.trim())
        .filter(Boolean),
    )
  }

  if (parsedTargets.length === 0) {
    return ['codex']
  }

  const uniqueTargets = [...new Set(parsedTargets)]

  if (uniqueTargets.length !== parsedTargets.length) {
    throw new Error('Duplicate targets are not allowed in --target/--targets')
  }

  for (const target of uniqueTargets) {
    if (!supportedAgents[target]) {
      throw new Error(
        `Unsupported target "${target}". Supported targets: ${Object.keys(supportedAgents).join(', ')}`,
      )
    }
  }

  return uniqueTargets
}

function resolveHomeRoot(explicitHome) {
  if (explicitHome) {
    return path.resolve(explicitHome)
  }

  const homeRoot = os.homedir()

  if (!homeRoot) {
    throw new Error('Unable to resolve a home directory. Pass --home <path> explicitly.')
  }

  return path.resolve(homeRoot)
}

function resolveAgentSkillsDir(homeRoot, agent) {
  const segments = supportedAgents[agent]

  if (!segments) {
    throw new Error(
      `Unsupported target "${agent}". Supported targets: ${Object.keys(supportedAgents).join(', ')}`,
    )
  }

  return path.join(homeRoot, ...segments)
}

async function assertDestinationAvailable(installDir) {
  try {
    await fs.access(installDir)
    throw new Error(`Skill already exists at ${installDir}`)
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return
    }

    throw error
  }
}

async function assertPathExists(targetPath, errorMessage) {
  try {
    await fs.access(targetPath)
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error(errorMessage)
    }

    throw error
  }
}
