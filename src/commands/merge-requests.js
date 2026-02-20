import { api } from '../lib/api.js';
import chalk from 'chalk';
import ora from 'ora';

export function registerMergeRequestCommands(program) {
  const mrs = program
    .command('merge-requests')
    .alias('mr')
    .description('Manage GitLab merge requests');

  mrs
    .command('list')
    .description('List merge requests')
    .requiredOption('--project-id <id>', 'Project ID')
    .option('--state <state>', 'MR state (opened, closed, merged)', 'opened')
    .option('--per-page <n>', 'Results per page', '20')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      const spinner = ora('Fetching merge requests...').start();
      try {
        const mrs = await api.listMergeRequests(options.projectId, {
          state: options.state,
          per_page: options.perPage
        });
        spinner.succeed('Merge requests fetched');

        if (options.json) {
          console.log(JSON.stringify(mrs, null, 2));
        } else {
          console.log(chalk.cyan(`\nTotal merge requests: ${mrs.length}\n`));
          mrs.forEach(mr => {
            console.log(chalk.bold(`!${mr.iid} ${mr.title}`));
            console.log(`  State: ${mr.state}`);
            console.log(`  Author: ${mr.author.name}`);
            console.log(`  Source: ${mr.source_branch} → Target: ${mr.target_branch}`);
            console.log(`  URL: ${chalk.blue(mr.web_url)}`);
            console.log('');
          });
        }
      } catch (error) {
        spinner.fail('Failed to fetch merge requests');
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });

  mrs
    .command('get')
    .description('Get merge request details')
    .requiredOption('--project-id <id>', 'Project ID')
    .requiredOption('--mr-id <id>', 'Merge request ID')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      const spinner = ora('Fetching merge request...').start();
      try {
        const mr = await api.getMergeRequest(options.projectId, options.mrId);
        spinner.succeed('Merge request fetched');

        if (options.json) {
          console.log(JSON.stringify(mr, null, 2));
        } else {
          console.log(chalk.cyan('\nMerge Request Details:\n'));
          console.log(chalk.bold(`!${mr.iid} ${mr.title}`));
          console.log(`  State: ${mr.state}`);
          console.log(`  Author: ${mr.author.name}`);
          console.log(`  Source: ${mr.source_branch} → Target: ${mr.target_branch}`);
          console.log(`  URL: ${chalk.blue(mr.web_url)}`);
          console.log(`\n  ${mr.description || 'No description'}`);
        }
      } catch (error) {
        spinner.fail('Failed to fetch merge request');
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });

  mrs
    .command('create')
    .description('Create a new merge request')
    .requiredOption('--project-id <id>', 'Project ID')
    .requiredOption('--source-branch <branch>', 'Source branch')
    .requiredOption('--target-branch <branch>', 'Target branch')
    .requiredOption('--title <title>', 'MR title')
    .option('--description <desc>', 'MR description')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      const spinner = ora('Creating merge request...').start();
      try {
        const mrData = {
          source_branch: options.sourceBranch,
          target_branch: options.targetBranch,
          title: options.title
        };

        if (options.description) mrData.description = options.description;

        const mr = await api.createMergeRequest(options.projectId, mrData);
        spinner.succeed('Merge request created');

        if (options.json) {
          console.log(JSON.stringify(mr, null, 2));
        } else {
          console.log(chalk.green('\n✓ Merge request created successfully!\n'));
          console.log(chalk.bold(`!${mr.iid} ${mr.title}`));
          console.log(`  URL: ${chalk.blue(mr.web_url)}`);
        }
      } catch (error) {
        spinner.fail('Failed to create merge request');
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });

  mrs
    .command('merge')
    .description('Merge a merge request')
    .requiredOption('--project-id <id>', 'Project ID')
    .requiredOption('--mr-id <id>', 'Merge request ID')
    .action(async (options) => {
      const spinner = ora('Merging merge request...').start();
      try {
        await api.mergeMergeRequest(options.projectId, options.mrId);
        spinner.succeed(chalk.green(`✓ Merge request !${options.mrId} merged`));
      } catch (error) {
        spinner.fail('Failed to merge merge request');
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });
}
