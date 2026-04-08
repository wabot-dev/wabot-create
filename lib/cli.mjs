import { Command } from 'commander'
import chalk from 'chalk'

import { runCreateProjectCommand } from './create-project.mjs'
import { installSkill } from './skills/install.mjs'

export function buildProgram() {
  const program = new Command()

  program
    .name('create-wabot')
    .description('Create a new Wabot project and install packaged Wabot skills')
    .argument('[project-directory]', 'project name')
    .option('--db-url <dbUrl>', 'database url')
    .option('--llm-url <llmUrl>', 'llm url')
    .option('--api-key <key>', 'api key')
    .action(async (projectDirectory, options) => {
      await runCreateProjectCommand(projectDirectory, options)
    })

  const skillCommand = program.command('skill').description('Manage packaged Wabot skills')

  skillCommand
    .command('add <skill-name>')
    .description('Install a packaged Wabot skill')
    .option('--local', 'install into ./.agents/skills/<skill-name>')
    .option('--global', 'install into one or more agent homes under the selected home root')
    .option('--home <path>', 'global home root; defaults to $HOME')
    .option('--target <name>', 'single global target (codex, claude, agents)')
    .option('--targets <names>', 'comma-separated global targets (codex, claude, agents)')
    .action(async (skillName, options) => {
      const result = await installSkill(skillName, options)

      if (result.mode === 'global') {
        console.log(chalk.blue(`Home root: ${result.homeRoot}`))
      } else {
        console.log(chalk.blue('Agent target: local workspace (.agents/skills)'))
      }

      for (const installation of result.installations) {
        console.log(
          chalk.green(
            `Installed ${result.skill.name} to ${chalk.cyan(installation.installDir)}`,
          ),
        )
        console.log(chalk.blue(`Target: ${installation.agent}`))
      }
    })

  return program
}
