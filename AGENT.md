# GitLab CLI - Agent Guide

This guide helps AI agents effectively use the GitLab CLI.

## Quick Start

```bash
# Configure API token
gitlab config set apiToken YOUR_TOKEN

# List projects
gitlab projects list

# List issues
gitlab issues list --project-id 123

# Create merge request
gitlab merge-requests create --project-id 123 --source-branch feature --target-branch main --title "Title"
```

## Common Commands

### Projects

- `gitlab projects list` - List all projects
- `gitlab projects get <id>` - Get project details
- `gitlab projects create --name "Name"` - Create project
- `gitlab projects delete <id>` - Delete project

### Issues

- `gitlab issues list --project-id <id>` - List issues
- `gitlab issues get --project-id <id> --issue-id <id>` - Get issue details
- `gitlab issues create --project-id <id> --title "Title"` - Create issue
- `gitlab issues close --project-id <id> --issue-id <id>` - Close issue

### Merge Requests

- `gitlab merge-requests list --project-id <id>` - List MRs
- `gitlab merge-requests get --project-id <id> --mr-id <id>` - Get MR details
- `gitlab merge-requests create --project-id <id> --source-branch <branch> --target-branch <branch> --title "Title"` - Create MR
- `gitlab merge-requests merge --project-id <id> --mr-id <id>` - Merge MR

### Pipelines

- `gitlab pipelines list --project-id <id>` - List pipelines
- `gitlab pipelines get --project-id <id> --pipeline-id <id>` - Get pipeline details
- `gitlab pipelines create --project-id <id> --ref <branch>` - Create pipeline
- `gitlab pipelines cancel --project-id <id> --pipeline-id <id>` - Cancel pipeline
- `gitlab pipelines retry --project-id <id> --pipeline-id <id>` - Retry pipeline

## JSON Output

All commands support `--json` flag:

```bash
gitlab projects list --json
gitlab issues list --project-id 123 --json
```

## Error Handling

Check exit codes:
- 0 = success
- 1 = error

Parse error messages from stderr.

## Configuration

Config stored at: `~/.config/ktmcp-gitlab/config.json`

Required settings:
- `apiToken` - GitLab API token

Optional:
- `baseURL` - API base URL (default: https://gitlab.com/api/v4)

## Tips

1. Always use `--json` for programmatic access
2. Use `jq` to parse JSON responses
3. Check for null values in optional fields
4. Handle rate limiting (429 errors) with retries
5. Store project IDs for later reference
