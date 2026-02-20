#!/usr/bin/env node

/**
 * GitLab CLI - Main Entry Point
 *
 * Production-ready CLI for GitLab API
 * DevOps platform and CI/CD management
 */

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chalk from 'chalk';

// Import command modules
import { registerProjectCommands } from '../src/commands/projects.js';
import { registerIssueCommands } from '../src/commands/issues.js';
import { registerMergeRequestCommands } from '../src/commands/merge-requests.js';
import { registerPipelineCommands } from '../src/commands/pipelines.js';
import { registerConfigCommands } from '../src/commands/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load package.json
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

const program = new Command();

// Configure main program
program
  .name('gitlab')
  .description(chalk.cyan('GitLab API CLI - DevOps platform and CI/CD management'))
  .version(packageJson.version, '-v, --version', 'output the current version')
  .addHelpText('after', `
${chalk.bold('Examples:')}
  $ gitlab config set apiToken <your-token>
  $ gitlab projects list
  $ gitlab issues list --project-id 123
  $ gitlab merge-requests list --state opened
  $ gitlab pipelines list --project-id 123

${chalk.bold('API Documentation:')}
  ${chalk.blue('https://docs.gitlab.com/ee/api/')}

${chalk.bold('Get API Token:')}
  ${chalk.blue('https://gitlab.com/-/profile/personal_access_tokens')}
`);

// Register all command modules
registerConfigCommands(program);
registerProjectCommands(program);
registerIssueCommands(program);
registerMergeRequestCommands(program);
registerPipelineCommands(program);

// Global error handler
process.on('unhandledRejection', (error) => {
  console.error(chalk.red('Unhandled error:'), error);
  process.exit(1);
});

// Parse command line arguments
program.parse(process.argv);
