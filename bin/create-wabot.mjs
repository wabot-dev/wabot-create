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

    const packageJsonPath = path.join(targetDir, 'package.json')
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))


    packageJson.name = projectName

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))
    
    const definedVars = await createEnvFile(targetDir, options.dbUrl, options.llmUrl, options.apiKey)

    console.log(chalk.green('\nSuccess! 🎉 Created', projectName))
    
    // Solo mostrar mensaje de variables si hay alguna definida
    if (definedVars.length > 0) {
      console.log(chalk.yellow(`\n  Opcional: Puedes configurar ${definedVars.join(', ')} en el archivo .env`))
    }
    console.log('\nInside that directory, you can run several commands:')
    console.log('\nWe suggest that you begin by typing:')
    console.log(chalk.cyan(`\n  cd ${projectName}`))
    console.log(chalk.cyan('  npm install'))
    console.log(chalk.cyan('  npm run dev'))
    console.log('\nHappy developing! 🚀\n')
  } catch (error) {
    console.error(chalk.red('Error:'), error)
    process.exit(1)
  }
}


/**
 * Crea un archivo .env con las variables de entorno proporcionadas
 * @param {string} targetDir - Directorio donde se creará el archivo .env
 * @param {string} [dbUrl] - URL de la base de datos (opcional)
 * @param {string} [llmUrl] - URL del modelo de lenguaje (opcional)
 * @param {string} [apiKey] - Clave API (opcional)
 * @returns {string[]} - Array con los nombres de las variables definidas
 */
async function createEnvFile(targetDir, dbUrl, llmUrl, apiKey) {
  // Crear un objeto con las variables que tienen valores definidos
  const envVars = {}
  const definedVars = []
  
  // Solo agregar variables que tengan valores definidos
  if (dbUrl) {
    envVars.DATABASE_URL = dbUrl
    definedVars.push('DATABASE_URL')
  }
  if (llmUrl) {
    envVars.WABOT_LLM_URL = llmUrl
    definedVars.push('WABOT_LLM_URL')
  }
  if (apiKey) {
    envVars.WABOT_API_KEY = apiKey
    definedVars.push('WABOT_API_KEY')
  }
  
  // Convertir el objeto a formato de archivo .env
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')
  
  // Solo crear el archivo si hay al menos una variable definida
  if (envContent) {
    await fs.writeFile(path.join(targetDir, '.env'), envContent)
  }
  
  return definedVars
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
