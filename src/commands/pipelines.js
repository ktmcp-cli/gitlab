import { api } from '../lib/api.js';
import chalk from 'chalk';
import ora from 'ora';

export function registerPipelineCommands(program) {
  const pipelines = program
    .command('pipelines')
    .alias('pipe')
    .description('Manage GitLab CI/CD pipelines');

  pipelines
    .command('list')
    .description('List pipelines')
    .requiredOption('--project-id <id>', 'Project ID')
    .option('--per-page <n>', 'Results per page', '20')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      const spinner = ora('Fetching pipelines...').start();
      try {
        const pipelines = await api.listPipelines(options.projectId, {
          per_page: options.perPage
        });
        spinner.succeed('Pipelines fetched');

        if (options.json) {
          console.log(JSON.stringify(pipelines, null, 2));
        } else {
          console.log(chalk.cyan(`\nTotal pipelines: ${pipelines.length}\n`));
          pipelines.forEach(pipeline => {
            console.log(chalk.bold(`Pipeline #${pipeline.id}`));
            console.log(`  Ref: ${pipeline.ref}`);
            console.log(`  Status: ${pipeline.status}`);
            console.log(`  Created: ${pipeline.created_at}`);
            console.log(`  URL: ${chalk.blue(pipeline.web_url)}`);
            console.log('');
          });
        }
      } catch (error) {
        spinner.fail('Failed to fetch pipelines');
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });

  pipelines
    .command('get')
    .description('Get pipeline details')
    .requiredOption('--project-id <id>', 'Project ID')
    .requiredOption('--pipeline-id <id>', 'Pipeline ID')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      const spinner = ora('Fetching pipeline...').start();
      try {
        const pipeline = await api.getPipeline(options.projectId, options.pipelineId);
        spinner.succeed('Pipeline fetched');

        if (options.json) {
          console.log(JSON.stringify(pipeline, null, 2));
        } else {
          console.log(chalk.cyan('\nPipeline Details:\n'));
          console.log(chalk.bold(`Pipeline #${pipeline.id}`));
          console.log(`  Ref: ${pipeline.ref}`);
          console.log(`  Status: ${pipeline.status}`);
          console.log(`  Created: ${pipeline.created_at}`);
          console.log(`  Duration: ${pipeline.duration || 'N/A'}s`);
          console.log(`  URL: ${chalk.blue(pipeline.web_url)}`);
        }
      } catch (error) {
        spinner.fail('Failed to fetch pipeline');
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });

  pipelines
    .command('create')
    .description('Create a new pipeline')
    .requiredOption('--project-id <id>', 'Project ID')
    .requiredOption('--ref <ref>', 'Branch or tag name')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      const spinner = ora('Creating pipeline...').start();
      try {
        const pipeline = await api.createPipeline(options.projectId, options.ref);
        spinner.succeed('Pipeline created');

        if (options.json) {
          console.log(JSON.stringify(pipeline, null, 2));
        } else {
          console.log(chalk.green('\n✓ Pipeline created successfully!\n'));
          console.log(chalk.bold(`Pipeline #${pipeline.id}`));
          console.log(`  Ref: ${pipeline.ref}`);
          console.log(`  URL: ${chalk.blue(pipeline.web_url)}`);
        }
      } catch (error) {
        spinner.fail('Failed to create pipeline');
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });

  pipelines
    .command('cancel')
    .description('Cancel a pipeline')
    .requiredOption('--project-id <id>', 'Project ID')
    .requiredOption('--pipeline-id <id>', 'Pipeline ID')
    .action(async (options) => {
      const spinner = ora('Cancelling pipeline...').start();
      try {
        await api.cancelPipeline(options.projectId, options.pipelineId);
        spinner.succeed(chalk.green(`✓ Pipeline #${options.pipelineId} cancelled`));
      } catch (error) {
        spinner.fail('Failed to cancel pipeline');
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });

  pipelines
    .command('retry')
    .description('Retry a pipeline')
    .requiredOption('--project-id <id>', 'Project ID')
    .requiredOption('--pipeline-id <id>', 'Pipeline ID')
    .action(async (options) => {
      const spinner = ora('Retrying pipeline...').start();
      try {
        await api.retryPipeline(options.projectId, options.pipelineId);
        spinner.succeed(chalk.green(`✓ Pipeline #${options.pipelineId} retried`));
      } catch (error) {
        spinner.fail('Failed to retry pipeline');
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });
}
