#!/usr/bin/env node

import { program } from 'commander'
import chalk from 'chalk'
import degit from 'degit'
import prompts from 'prompts'
import path from 'path'
import fs from 'fs/promises'

async function createProject(projectName, options) {
  try {
    // Get the absolute path for the project
    const targetDir = path.resolve(process.cwd(), projectName)

    // Check if directory exists
    try {
      await fs.access(targetDir)
      console.error(chalk.red(`Error: Directory ${projectName} already exists`))
      process.exit(1)
    } catch {
      // Directory doesn't exist, we can proceed
    }

    // Clone the template repository
    console.log(chalk.blue(`Creating a new Wabot project in ${chalk.green(targetDir)}`))

    const emitter = degit('wabot-dev/wabot-template', {
      cache: false,
      force: true,
      verbose: true,
    })

    await emitter.clone(targetDir)

    // Read the template's package.json
    const packageJsonPath = path.join(targetDir, 'package.json')
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))

    // Update package.json with the new project name
    packageJson.name = projectName

    // Write the updated package.json
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))

    // Create .env file
    await createEnvFile(targetDir, options.dbUrl, options.llmUrl, options.apiKey)

    console.log(chalk.green('\nSuccess! 🎉 Created', projectName))
    console.log('\nInside that directory, you can run several commands:')
    console.log(chalk.yellow('\n  .env file add DATABASE_URL, WABOT_LLM_URL, WABOT_API_KEY'))
    console.log(chalk.cyan('\n  npm install'))
    console.log('    Install the project dependencies')
    console.log(chalk.cyan('\n  npm start'))
    console.log('    Starts the development server')
    console.log('\nWe suggest that you begin by typing:')
    console.log(chalk.cyan(`\n  cd ${projectName}`))
    console.log(chalk.cyan('  npm install'))
    console.log(chalk.cyan('  npm start'))
    console.log('\nHappy hacking! 🚀\n')
  } catch (error) {
    console.error(chalk.red('Error:'), error)
    process.exit(1)
  }
}

async function createEnvFile(targetDir, dbUrl, llmUrl, apiKey) {
  const envContent = `
DATABASE_URL=${dbUrl}
WABOT_LLM_URL=${llmUrl}
WABOT_API_KEY=${apiKey}
`

  await fs.writeFile(path.join(targetDir, '.env'), envContent.trim())
}

// Set up the CLI
program
  .name('create-wabot')
  .description('Create a new Wabot project')
  .argument('[project-directory]', 'project name')
  .option('--db-url <dbUrl>', 'database url')
  .option('--llm-url <llmUrl>', 'llm url')
  .option('--api-key <key>', 'api key')
  .action(async (projectDirectory, options) => {
    let projectName = projectDirectory

    if (!projectName) {
      const response = await prompts({
        type: 'text',
        name: 'projectName',
        message: 'What is your project named?',
        initial: 'my-wabot-app',
      })

      if (!response.projectName) {
        console.log(chalk.red('Project name is required'))
        process.exit(1)
      }

      projectName = response.projectName
    }

    await createProject(projectName, options)
  })

program.parse()
