import chalk from 'chalk'
import degit from 'degit'
import prompts from 'prompts'
import path from 'path'
import fs from 'fs/promises'
import { spawn } from 'child_process'

const REQUIRED_NODE_MAJOR = 22

const AI_PROVIDERS = [
  {
    value: 'openrouter',
    title: 'OpenRouter',
    description: 'Used by the included Pixel example',
    envKey: 'OPENROUTER_API_KEY',
  },
  {
    value: 'openai',
    title: 'OpenAI',
    description: 'GPT models via the official OpenAI API',
    envKey: 'OPENAI_API_KEY',
  },
  {
    value: 'anthropic',
    title: 'Anthropic',
    description: 'Claude models',
    envKey: 'ANTHROPIC_API_KEY',
  },
  {
    value: 'google',
    title: 'Google',
    description: 'Gemini models',
    envKey: 'GOOGLE_API_KEY',
  },
]

export async function runCreateProjectCommand(projectDirectory, options) {
  printIntro()
  ensureNodeVersion()

  const projectName = await resolveProjectName(projectDirectory)
  const setup = await collectSetup(options)

  await createProject(projectName, setup)
  await installDependencies(projectName)

  printNextSteps(projectName, setup)
  process.exit(0)
}

function printIntro() {
  const line = chalk.gray('─'.repeat(60))
  console.log()
  console.log(line)
  console.log(chalk.bold.cyan('  🤖  Wabot project creator'))
  console.log()
  console.log(
    '  This wizard will scaffold a new chat-bot project from the',
  )
  console.log(
    `  ${chalk.cyan('@wabot-dev/template')} starter and configure your ${chalk.cyan('.env')}.`,
  )
  console.log()
  console.log('  You will be asked about:')
  console.log('    • where to store data (in-memory or PostgreSQL)')
  console.log('    • which AI providers you want to use')
  console.log(line)
  console.log()
}

function ensureNodeVersion() {
  const major = Number(process.versions.node.split('.')[0])
  if (major === REQUIRED_NODE_MAJOR) {
    return
  }

  console.log(
    chalk.red(
      `✖ Node.js ${REQUIRED_NODE_MAJOR} is required (you are running ${process.versions.node}).`,
    ),
  )
  console.log()
  console.log(
    `The Wabot template pins Node ${REQUIRED_NODE_MAJOR} in its ${chalk.cyan('.nvmrc')}.`,
  )
  console.log(`We recommend installing it with ${chalk.cyan('nvm')}:`)
  console.log()
  console.log(chalk.cyan(`  nvm install ${REQUIRED_NODE_MAJOR}`))
  console.log(chalk.cyan(`  nvm use ${REQUIRED_NODE_MAJOR}`))
  console.log()
  console.log(
    `Don't have nvm? See ${chalk.underline('https://github.com/nvm-sh/nvm#installing-and-updating')}`,
  )
  console.log()
  process.exit(1)
}

async function resolveProjectName(projectDirectory) {
  if (projectDirectory) {
    return projectDirectory
  }

  const response = await prompts({
    type: 'text',
    name: 'projectName',
    message: 'What is your project named?',
    initial: 'my-wabot-app',
  })

  if (!response.projectName) {
    throw new Error('Project name is required')
  }

  return response.projectName
}

async function collectSetup(options) {
  const onCancel = () => {
    throw new Error('Setup cancelled')
  }

  const { storage } = await prompts(
    {
      type: 'select',
      name: 'storage',
      message: 'How do you want to store data?',
      choices: [
        {
          title: 'In-memory (quickest start, data resets on restart)',
          value: 'memory',
        },
        {
          title: 'PostgreSQL (persistent, recommended for real bots)',
          value: 'postgres',
        },
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
        message: 'DATABASE_URL (leave blank to fill in later):',
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
      message: 'Which AI providers will you use? (space to toggle, enter to confirm)',
      choices: AI_PROVIDERS.map((p) => ({
        title: p.title,
        value: p.value,
        description: p.description,
        selected: p.value === 'openrouter',
      })),
      hint: 'At least one is required to run the included Pixel example',
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
        message: `${provider.envKey} (leave blank to fill in later):`,
      },
      { onCancel },
    )
    providerKeys[provider.envKey] = apiKey ?? ''
  }

  return { storage, databaseUrl, providers, providerKeys }
}

async function createProject(projectName, setup) {
  const targetDir = path.resolve(process.cwd(), projectName)

  await ensureDirectoryDoesNotExist(targetDir, projectName)

  console.log(chalk.blue(`\nCreating a new Wabot project in ${chalk.green(targetDir)}\n`))

  const emitter = degit('wabot-dev/wabot-template', {
    cache: false,
    force: true,
    verbose: true,
  })

  await emitter.clone(targetDir)

  const packageJsonPath = path.join(targetDir, 'package.json')
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))
  packageJson.name = projectName
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')

  await writeEnvFile(targetDir, setup)
}

async function ensureDirectoryDoesNotExist(targetDir, projectName) {
  try {
    await fs.access(targetDir)
    throw new Error(`Directory ${projectName} already exists`)
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return
    }

    throw error
  }
}

async function writeEnvFile(targetDir, setup) {
  const lines = []
  lines.push('# debug important things')
  lines.push('DEBUG=wabot:*:error,wabot:*:warn,wabot:*:info')
  lines.push('')

  if (setup.storage === 'postgres') {
    lines.push('# postgres connection string')
    lines.push(`DATABASE_URL=${setup.databaseUrl}`)
  } else {
    lines.push('# using in-memory storage (set DATABASE_URL to switch to postgres)')
    lines.push('# DATABASE_URL=')
  }
  lines.push('')

  lines.push('# AI provider keys')
  for (const provider of AI_PROVIDERS) {
    const selected = setup.providers.includes(provider.value)
    if (selected) {
      lines.push(`${provider.envKey}=${setup.providerKeys[provider.envKey] ?? ''}`)
    } else {
      lines.push(`# ${provider.envKey}=`)
    }
  }
  lines.push('')

  await fs.writeFile(path.join(targetDir, '.env'), lines.join('\n'))
}

async function installDependencies(projectName) {
  const targetDir = path.resolve(process.cwd(), projectName)
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'

  console.log(chalk.blue('\nInstalling dependencies with npm...\n'))

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
        reject(new Error(`npm install exited with code ${code}`))
      }
    })
  })
}

function printNextSteps(projectName, setup) {
  console.log(chalk.green(`\n✔ Project ${chalk.bold(projectName)} is ready.\n`))

  const missingKeys = AI_PROVIDERS.filter(
    (p) => setup.providers.includes(p.value) && !setup.providerKeys[p.envKey],
  ).map((p) => p.envKey)

  if (setup.storage === 'postgres' && !setup.databaseUrl) {
    console.log(chalk.yellow('  ⚠  DATABASE_URL is empty — set it in .env before running.'))
  }
  if (missingKeys.length > 0) {
    console.log(
      chalk.yellow(`  ⚠  Missing API keys in .env: ${missingKeys.join(', ')}`),
    )
  }

  console.log('\nNext steps:')
  console.log(chalk.cyan(`\n  cd ${projectName}`))
  console.log(chalk.cyan('  npm run dev'))
  console.log('\nHappy hacking! 🚀\n')
}
