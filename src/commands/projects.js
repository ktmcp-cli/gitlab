import { api } from '../lib/api.js';
import chalk from 'chalk';
import ora from 'ora';

export function registerProjectCommands(program) {
  const projects = program
    .command('projects')
    .alias('p')
    .description('Manage GitLab projects');

  projects
    .command('list')
    .description('List all projects')
    .option('--owned', 'Show only owned projects')
    .option('--starred', 'Show only starred projects')
    .option('--per-page <n>', 'Results per page', '20')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      const spinner = ora('Fetching projects...').start();
      try {
        const params = { per_page: options.perPage };
        if (options.owned) params.owned = true;
        if (options.starred) params.starred = true;

        const projects = await api.listProjects(params);
        spinner.succeed('Projects fetched');

        if (options.json) {
          console.log(JSON.stringify(projects, null, 2));
        } else {
          console.log(chalk.cyan(`\nTotal projects: ${projects.length}\n`));
          projects.forEach(project => {
            console.log(chalk.bold(project.name));
            console.log(`  ID: ${project.id}`);
            console.log(`  Path: ${project.path_with_namespace}`);
            console.log(`  URL: ${chalk.blue(project.web_url)}`);
            console.log(`  Visibility: ${project.visibility}`);
            console.log('');
          });
        }
      } catch (error) {
        spinner.fail('Failed to fetch projects');
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });

  projects
    .command('get <projectId>')
    .description('Get project details')
    .option('--json', 'Output as JSON')
    .action(async (projectId, options) => {
      const spinner = ora('Fetching project...').start();
      try {
        const project = await api.getProject(projectId);
        spinner.succeed('Project fetched');

        if (options.json) {
          console.log(JSON.stringify(project, null, 2));
        } else {
          console.log(chalk.cyan('\nProject Details:\n'));
          console.log(chalk.bold(project.name));
          console.log(`  ID: ${project.id}`);
          console.log(`  Description: ${project.description || 'None'}`);
          console.log(`  Path: ${project.path_with_namespace}`);
          console.log(`  URL: ${chalk.blue(project.web_url)}`);
          console.log(`  Stars: ${project.star_count}`);
          console.log(`  Forks: ${project.forks_count}`);
        }
      } catch (error) {
        spinner.fail('Failed to fetch project');
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });

  projects
    .command('create')
    .description('Create a new project')
    .option('--name <name>', 'Project name', 'New Project')
    .option('--description <desc>', 'Project description')
    .option('--visibility <level>', 'Visibility level (private, internal, public)', 'private')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      const spinner = ora('Creating project...').start();
      try {
        const projectData = {
          name: options.name,
          visibility: options.visibility
        };

        if (options.description) {
          projectData.description = options.description;
        }

        const project = await api.createProject(projectData);
        spinner.succeed('Project created');

        if (options.json) {
          console.log(JSON.stringify(project, null, 2));
        } else {
          console.log(chalk.green('\n✓ Project created successfully!\n'));
          console.log(chalk.bold(project.name));
          console.log(`  ID: ${project.id}`);
          console.log(`  URL: ${chalk.blue(project.web_url)}`);
        }
      } catch (error) {
        spinner.fail('Failed to create project');
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });

  projects
    .command('delete <projectId>')
    .description('Delete a project')
    .action(async (projectId) => {
      const spinner = ora('Deleting project...').start();
      try {
        await api.deleteProject(projectId);
        spinner.succeed(chalk.green(`✓ Project ${projectId} deleted`));
      } catch (error) {
        spinner.fail('Failed to delete project');
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });
}
