import chalk from 'chalk'
import degit from 'degit'
import prompts from 'prompts'
import path from 'path'
import fs from 'fs/promises'
import { spawn } from 'child_process'

import { installSkillsInProject, listSupportedAgents } from './skills/install.mjs'
import { createTranslator } from './i18n.mjs'

const REQUIRED_NODE_MAJOR = 22

const TEMPLATE_REPO = 'wabot-dev/wabot-template'

// Each starter variant lives on its own branch of the template repo, with a
// matching `*-beta` branch that pins the beta framework. Beta builds of
// @wabot-dev/create scaffold from the beta branch, stable builds from the
// default one. `WABOT_TEMPLATE_REF` overrides everything (e.g. to test a branch).
//
//   variant   stable branch   beta branch
//   full      (default)       beta
//   empty     empty           empty-beta
const TEMPLATE_BRANCHES = {
  full: { stable: '', beta: 'beta' },
  empty: { stable: 'empty', beta: 'empty-beta' },
}

async function resolveTemplateRepo(variant = 'empty') {
  if (process.env.WABOT_TEMPLATE_REF) {
    return process.env.WABOT_TEMPLATE_REF
  }

  const pkgRaw = await fs.readFile(new URL('../package.json', import.meta.url), 'utf-8')
  const version = JSON.parse(pkgRaw).version ?? ''
  const isBeta = version.includes('-beta')

  const branches = TEMPLATE_BRANCHES[variant] ?? TEMPLATE_BRANCHES.empty
  const branch = isBeta ? branches.beta : branches.stable
  return branch ? `${TEMPLATE_REPO}#${branch}` : TEMPLATE_REPO
}

const AI_PROVIDERS = [
  {
    value: 'openrouter',
    title: 'OpenRouter',
    descriptionKey: 'providers.openrouter',
    envKey: 'OPENROUTER_API_KEY',
  },
  {
    value: 'openai',
    title: 'OpenAI',
    descriptionKey: 'providers.openai',
    envKey: 'OPENAI_API_KEY',
  },
  {
    value: 'anthropic',
    title: 'Anthropic',
    descriptionKey: 'providers.anthropic',
    envKey: 'ANTHROPIC_API_KEY',
  },
  {
    value: 'google',
    title: 'Google',
    descriptionKey: 'providers.google',
    envKey: 'GOOGLE_API_KEY',
  },
]

function agentLabel(t, agent) {
  const key = `agent.label.${agent}`
  const value = t(key)
  return value === key ? agent : value
}

export async function runCreateProjectCommand(projectDirectory, options) {
  const t = createTranslator(options?.lang)

  printIntro(t)
  ensureNodeVersion(t)

  const projectName = await resolveProjectName(projectDirectory, t)
  const setup = await collectSetup(options, t)

  await createProject(projectName, setup, t)
  await installDependencies(projectName, t)

  if (setup.skills.install) {
    await installAgentSkills(projectName, setup.skills, t)
  }

  printNextSteps(projectName, setup, t)
  process.exit(0)
}

function printIntro(t) {
  const line = chalk.gray('─'.repeat(60))
  console.log()
  console.log(line)
  console.log(chalk.bold.cyan(`  ${t('intro.title')}`))
  console.log()
  console.log(`  ${t('intro.line1')}`)
  console.log(
    `  ${t('intro.line2', chalk.cyan('@wabot-dev/template'), chalk.cyan('.env'))}`,
  )
  console.log()
  console.log(`  ${t('intro.askAbout')}`)
  console.log(`    • ${t('intro.bullet.template')}`)
  console.log(`    • ${t('intro.bullet.storage')}`)
  console.log(`    • ${t('intro.bullet.providers')}`)
  console.log(line)
  console.log()
}

function ensureNodeVersion(t) {
  const major = Number(process.versions.node.split('.')[0])
  if (major === REQUIRED_NODE_MAJOR) {
    return
  }

  console.log(chalk.red(t('node.required', REQUIRED_NODE_MAJOR, process.versions.node)))
  console.log()
  console.log(t('node.templatePin', REQUIRED_NODE_MAJOR, chalk.cyan('.nvmrc')))
  console.log(t('node.installHint', chalk.cyan('nvm')))
  console.log()
  console.log(chalk.cyan(`  nvm install ${REQUIRED_NODE_MAJOR}`))
  console.log(chalk.cyan(`  nvm use ${REQUIRED_NODE_MAJOR}`))
  console.log()
  console.log(
    t('node.noNvm', chalk.underline('https://github.com/nvm-sh/nvm#installing-and-updating')),
  )
  console.log()
  process.exit(1)
}

async function resolveProjectName(projectDirectory, t) {
  if (projectDirectory) {
    return projectDirectory
  }

  const response = await prompts({
    type: 'text',
    name: 'projectName',
    message: t('project.namePrompt'),
    initial: 'my-wabot-app',
  })

  if (!response.projectName) {
    throw new Error(t('project.nameRequired'))
  }

  return response.projectName
}

async function collectSetup(options, t) {
  const onCancel = () => {
    throw new Error(t('project.cancelled'))
  }

  const { template } = await prompts(
    {
      type: 'select',
      name: 'template',
      message: t('template.prompt'),
      choices: [
        { title: t('template.empty'), value: 'empty' },
        { title: t('template.full'), value: 'full' },
      ],
      initial: 0,
    },
    { onCancel },
  )

  const { storage } = await prompts(
    {
      type: 'select',
      name: 'storage',
      message: t('storage.prompt'),
      choices: [
        { title: t('storage.memory'), value: 'memory' },
        { title: t('storage.postgres'), value: 'postgres' },
      ],
      initial: 0,
    },
    { onCancel },
  )

  let databaseUrl = ''
  if (storage === 'postgres') {
    const dbResponse = await prompts(
      {
        type: 'text',
        name: 'databaseUrl',
        message: t('storage.dbUrlPrompt'),
        initial: options.dbUrl ?? '',
      },
      { onCancel },
    )
    databaseUrl = dbResponse.databaseUrl ?? ''
  }

  const { providers } = await prompts(
    {
      type: 'multiselect',
      name: 'providers',
      message: t('providers.prompt'),
      choices: AI_PROVIDERS.map((p) => ({
        title: p.title,
        value: p.value,
        description: t(p.descriptionKey),
        selected: p.value === 'openrouter',
      })),
      hint: t('providers.hint'),
      instructions: false,
      min: 1,
    },
    { onCancel },
  )

  const providerKeys = {}
  for (const value of providers) {
    const provider = AI_PROVIDERS.find((p) => p.value === value)
    const { apiKey } = await prompts(
      {
        type: 'password',
        name: 'apiKey',
        message: t('providers.apiKeyPrompt', provider.envKey),
      },
      { onCancel },
    )
    providerKeys[provider.envKey] = apiKey ?? ''
  }

  const skills = await collectSkillsSetup({ onCancel }, t)

  return { template, storage, databaseUrl, providers, providerKeys, skills }
}

async function collectSkillsSetup({ onCancel }, t) {
  const supportedAgents = listSupportedAgents()

  const { install } = await prompts(
    {
      type: 'confirm',
      name: 'install',
      message: t('skills.installPrompt'),
      initial: true,
    },
    { onCancel },
  )

  if (!install) {
    return { install: false, agents: [], skills: [], exclude: [] }
  }

  const { agents } = await prompts(
    {
      type: 'multiselect',
      name: 'agents',
      message: t('skills.agentsPrompt'),
      choices: supportedAgents.map((agent) => ({
        title: agentLabel(t, agent),
        value: agent,
        selected: true,
      })),
      hint: t('skills.agentsHint'),
      instructions: false,
      min: 1,
    },
    { onCancel },
  )

  // Always offer the design-system skill explicitly — it's opt-in regardless of
  // the chosen starter.
  const { installDesign } = await prompts(
    {
      type: 'confirm',
      name: 'installDesign',
      message: t('design.prompt'),
      initial: true,
    },
    { onCancel },
  )

  // Empty skills list = install every skill the framework ships (resolved at
  // install time from @wabot-dev/framework in the new project); `exclude` drops
  // wabot-design when the dev opts out.
  return {
    install: true,
    agents,
    skills: [],
    exclude: installDesign ? [] : ['wabot-design'],
  }
}

async function createProject(projectName, setup, t) {
  const targetDir = path.resolve(process.cwd(), projectName)

  await ensureDirectoryDoesNotExist(targetDir, projectName, t)

  console.log(chalk.blue(t('project.creating', chalk.green(targetDir))))

  const templateRepo = await resolveTemplateRepo(setup.template)
  if (templateRepo !== TEMPLATE_REPO) {
    console.log(chalk.gray(t('project.templateSource', templateRepo)))
  }

  const emitter = degit(templateRepo, {
    cache: false,
    force: true,
    verbose: true,
  })

  await emitter.clone(targetDir)

  const packageJsonPath = path.join(targetDir, 'package.json')
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))
  packageJson.name = projectName
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')

  await writeEnvFile(targetDir, setup, t)
}

async function ensureDirectoryDoesNotExist(targetDir, projectName, t) {
  try {
    await fs.access(targetDir)
    throw new Error(t('project.exists', projectName))
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return
    }

    throw error
  }
}

async function writeEnvFile(targetDir, setup, t) {
  const lines = []
  lines.push(t('env.debugComment'))
  lines.push('DEBUG=wabot:*:error,wabot:*:warn,wabot:*:info')
  lines.push('')

  if (setup.storage === 'postgres') {
    lines.push(t('env.postgresComment'))
    lines.push(`DATABASE_URL=${setup.databaseUrl}`)
  } else {
    lines.push(t('env.inMemoryComment'))
    lines.push('# DATABASE_URL=')
  }
  lines.push('')

  lines.push(t('env.providersComment'))
  for (const provider of AI_PROVIDERS) {
    const apiKey = setup.providerKeys[provider.envKey]
    const selected = setup.providers.includes(provider.value)
    // The framework refuses to boot on a key that is defined but empty, so a
    // provider chosen without a key ships commented out like an unchosen one —
    // the project still runs, and printNextSteps warns which keys to fill in.
    if (selected && apiKey) {
      lines.push(`${provider.envKey}=${apiKey}`)
    } else {
      lines.push(`# ${provider.envKey}=`)
    }
  }
  lines.push('')

  await fs.writeFile(path.join(targetDir, '.env'), lines.join('\n'))
}

async function installDependencies(projectName, t) {
  const targetDir = path.resolve(process.cwd(), projectName)
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'

  console.log(chalk.blue(t('deps.installing')))

  await new Promise((resolve, reject) => {
    const child = spawn(npmCmd, ['install'], {
      cwd: targetDir,
      stdio: 'inherit',
    })

    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(t('deps.exitCode', code)))
      }
    })
  })
}

async function installAgentSkills(projectName, skillsSetup, t) {
  const targetDir = path.resolve(process.cwd(), projectName)

  console.log(chalk.blue(t('skills.installing')))

  try {
    const result = await installSkillsInProject(
      targetDir,
      skillsSetup.agents,
      skillsSetup.skills,
      skillsSetup.exclude,
    )

    const installed = result.installations.filter((i) => i.status === 'installed')
    const skipped = result.installations.filter((i) => i.status === 'skipped')

    if (installed.length > 0) {
      const byAgent = new Map()
      for (const item of installed) {
        const list = byAgent.get(item.agent) ?? []
        list.push(item.skill)
        byAgent.set(item.agent, list)
      }
      for (const [agent, names] of byAgent) {
        const dir = path.join(projectName, ...resolveAgentDir(agent))
        console.log(chalk.green(t('skills.installed', agent, names.length, dir)))
      }
    }
    if (skipped.length > 0) {
      console.log(chalk.yellow(t('skills.skipped', skipped.length)))
    }
  } catch (error) {
    console.log(chalk.red(t('skills.failed', error.message)))
    console.log(chalk.yellow(t('skills.installLater')))
  }
}

function resolveAgentDir(agent) {
  switch (agent) {
    case 'claude': return ['.claude', 'skills']
    case 'codex': return ['.codex', 'skills']
    case 'agents': return ['.agents', 'skills']
    default: return [`.${agent}`, 'skills']
  }
}

function printNextSteps(projectName, setup, t) {
  console.log(chalk.green(t('next.ready', chalk.bold(projectName))))

  const missingKeys = AI_PROVIDERS.filter(
    (p) => setup.providers.includes(p.value) && !setup.providerKeys[p.envKey],
  ).map((p) => p.envKey)

  if (setup.storage === 'postgres' && !setup.databaseUrl) {
    console.log(chalk.yellow(t('next.dbUrlEmpty')))
  }
  if (missingKeys.length > 0) {
    console.log(chalk.yellow(t('next.missingKeys', missingKeys.join(', '))))
  }

  console.log(t('next.heading'))
  console.log(chalk.cyan(`\n  cd ${projectName}`))
  console.log(chalk.cyan('  npm run dev:watch'))
  console.log(t('next.cmdChannelHint'))
  console.log(chalk.cyan('\n  npm run cmd'))
  console.log(t('next.happy'))
}
