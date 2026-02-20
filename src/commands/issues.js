import { api } from '../lib/api.js';
import chalk from 'chalk';
import ora from 'ora';

export function registerIssueCommands(program) {
  const issues = program
    .command('issues')
    .alias('i')
    .description('Manage GitLab issues');

  issues
    .command('list')
    .description('List issues')
    .requiredOption('--project-id <id>', 'Project ID')
    .option('--state <state>', 'Issue state (opened, closed)', 'opened')
    .option('--per-page <n>', 'Results per page', '20')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      const spinner = ora('Fetching issues...').start();
      try {
        const issues = await api.listIssues(options.projectId, {
          state: options.state,
          per_page: options.perPage
        });
        spinner.succeed('Issues fetched');

        if (options.json) {
          console.log(JSON.stringify(issues, null, 2));
        } else {
          console.log(chalk.cyan(`\nTotal issues: ${issues.length}\n`));
          issues.forEach(issue => {
            console.log(chalk.bold(`#${issue.iid} ${issue.title}`));
            console.log(`  State: ${issue.state}`);
            console.log(`  Author: ${issue.author.name}`);
            console.log(`  URL: ${chalk.blue(issue.web_url)}`);
            console.log('');
          });
        }
      } catch (error) {
        spinner.fail('Failed to fetch issues');
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });

  issues
    .command('get')
    .description('Get issue details')
    .requiredOption('--project-id <id>', 'Project ID')
    .requiredOption('--issue-id <id>', 'Issue ID')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      const spinner = ora('Fetching issue...').start();
      try {
        const issue = await api.getIssue(options.projectId, options.issueId);
        spinner.succeed('Issue fetched');

        if (options.json) {
          console.log(JSON.stringify(issue, null, 2));
        } else {
          console.log(chalk.cyan('\nIssue Details:\n'));
          console.log(chalk.bold(`#${issue.iid} ${issue.title}`));
          console.log(`  State: ${issue.state}`);
          console.log(`  Author: ${issue.author.name}`);
          console.log(`  Created: ${issue.created_at}`);
          console.log(`  URL: ${chalk.blue(issue.web_url)}`);
          console.log(`\n  ${issue.description || 'No description'}`);
        }
      } catch (error) {
        spinner.fail('Failed to fetch issue');
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });

  issues
    .command('create')
    .description('Create a new issue')
    .requiredOption('--project-id <id>', 'Project ID')
    .requiredOption('--title <title>', 'Issue title')
    .option('--description <desc>', 'Issue description')
    .option('--labels <labels>', 'Comma-separated labels')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      const spinner = ora('Creating issue...').start();
      try {
        const issueData = {
          title: options.title
        };

        if (options.description) issueData.description = options.description;
        if (options.labels) issueData.labels = options.labels;

        const issue = await api.createIssue(options.projectId, issueData);
        spinner.succeed('Issue created');

        if (options.json) {
          console.log(JSON.stringify(issue, null, 2));
        } else {
          console.log(chalk.green('\n✓ Issue created successfully!\n'));
          console.log(chalk.bold(`#${issue.iid} ${issue.title}`));
          console.log(`  URL: ${chalk.blue(issue.web_url)}`);
        }
      } catch (error) {
        spinner.fail('Failed to create issue');
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });

  issues
    .command('close')
    .description('Close an issue')
    .requiredOption('--project-id <id>', 'Project ID')
    .requiredOption('--issue-id <id>', 'Issue ID')
    .action(async (options) => {
      const spinner = ora('Closing issue...').start();
      try {
        await api.closeIssue(options.projectId, options.issueId);
        spinner.succeed(chalk.green(`✓ Issue #${options.issueId} closed`));
      } catch (error) {
        spinner.fail('Failed to close issue');
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });
}
