#!/usr/bin/env node

import chalk from 'chalk'
import { buildProgram } from '../lib/cli.mjs'

const program = buildProgram()

try {
  await program.parseAsync(process.argv)
} catch (error) {
  console.error(chalk.red('Error:'), error.message)
  process.exit(1)
}
