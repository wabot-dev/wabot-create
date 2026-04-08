import chalk from 'chalk'
import degit from 'degit'
import prompts from 'prompts'
import path from 'path'
import fs from 'fs/promises'

export async function runCreateProjectCommand(projectDirectory, options) {
  const projectName = await resolveProjectName(projectDirectory)

  await createProject(projectName, options)
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

async function createProject(projectName, options) {
  const targetDir = path.resolve(process.cwd(), projectName)

  await ensureDirectoryDoesNotExist(targetDir, projectName)

  console.log(chalk.blue(`Creating a new Wabot project in ${chalk.green(targetDir)}`))

  const emitter = degit('wabot-dev/wabot-template', {
    cache: false,
    force: true,
    verbose: true,
  })

  await emitter.clone(targetDir)

  const packageJsonPath = path.join(targetDir, 'package.json')
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))
  packageJson.name = projectName
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))

  await createEnvFile(targetDir, options.dbUrl, options.llmUrl, options.apiKey)

  console.log(chalk.green('\nSuccess! 🎉 Created', projectName))
  console.log(chalk.yellow('\n  .env file add DATABASE_URL, WABOT_LLM_URL, WABOT_API_KEY'))
  console.log('\nInside that directory, you can run several commands:')
  console.log(chalk.cyan('\n  npm install'))
  console.log('    Install the project dependencies')
  console.log(chalk.cyan('\n  npm start'))
  console.log('    Starts the development server')
  console.log('\nWe suggest that you begin by typing:')
  console.log(chalk.cyan(`\n  cd ${projectName}`))
  console.log(chalk.cyan('  npm install'))
  console.log(chalk.cyan('  npm start'))
  console.log('\nHappy hacking! 🚀\n')
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

async function createEnvFile(targetDir, dbUrl, llmUrl, apiKey) {
  const envContent = `
DATABASE_URL=${dbUrl ?? ''}
WABOT_LLM_URL=${llmUrl ?? ''}
WABOT_API_KEY=${apiKey ?? ''}
`

  await fs.writeFile(path.join(targetDir, '.env'), envContent.trim())
}
