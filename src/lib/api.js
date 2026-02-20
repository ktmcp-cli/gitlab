import axios from 'axios';
import Conf from 'conf';

const config = new Conf({ projectName: 'ktmcp-gitlab' });

export class GitLabAPI {
  constructor() {
    this.baseURL = config.get('baseURL') || process.env.GITLAB_BASE_URL || 'https://gitlab.com/api/v4';
    this.apiToken = config.get('apiToken') || process.env.GITLAB_API_TOKEN;
  }

  getHeaders() {
    if (!this.apiToken) {
      throw new Error('API token not configured. Run: gitlab config set apiToken YOUR_TOKEN');
    }
    return {
      'PRIVATE-TOKEN': this.apiToken,
      'Content-Type': 'application/json'
    };
  }

  async request(method, endpoint, data = null, params = null) {
    try {
      const response = await axios({
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: this.getHeaders(),
        data,
        params
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`GitLab API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  // Projects
  async listProjects(params = {}) {
    return this.request('GET', '/projects', null, params);
  }

  async getProject(projectId) {
    return this.request('GET', `/projects/${projectId}`);
  }

  async createProject(projectData) {
    return this.request('POST', '/projects', projectData);
  }

  async deleteProject(projectId) {
    return this.request('DELETE', `/projects/${projectId}`);
  }

  // Issues
  async listIssues(projectId, params = {}) {
    return this.request('GET', `/projects/${projectId}/issues`, null, params);
  }

  async getIssue(projectId, issueId) {
    return this.request('GET', `/projects/${projectId}/issues/${issueId}`);
  }

  async createIssue(projectId, issueData) {
    return this.request('POST', `/projects/${projectId}/issues`, issueData);
  }

  async updateIssue(projectId, issueId, issueData) {
    return this.request('PUT', `/projects/${projectId}/issues/${issueId}`, issueData);
  }

  async closeIssue(projectId, issueId) {
    return this.updateIssue(projectId, issueId, { state_event: 'close' });
  }

  // Merge Requests
  async listMergeRequests(projectId, params = {}) {
    return this.request('GET', `/projects/${projectId}/merge_requests`, null, params);
  }

  async getMergeRequest(projectId, mrId) {
    return this.request('GET', `/projects/${projectId}/merge_requests/${mrId}`);
  }

  async createMergeRequest(projectId, mrData) {
    return this.request('POST', `/projects/${projectId}/merge_requests`, mrData);
  }

  async mergeMergeRequest(projectId, mrId) {
    return this.request('PUT', `/projects/${projectId}/merge_requests/${mrId}/merge`);
  }

  // Pipelines
  async listPipelines(projectId, params = {}) {
    return this.request('GET', `/projects/${projectId}/pipelines`, null, params);
  }

  async getPipeline(projectId, pipelineId) {
    return this.request('GET', `/projects/${projectId}/pipelines/${pipelineId}`);
  }

  async createPipeline(projectId, ref) {
    return this.request('POST', `/projects/${projectId}/pipeline`, { ref });
  }

  async cancelPipeline(projectId, pipelineId) {
    return this.request('POST', `/projects/${projectId}/pipelines/${pipelineId}/cancel`);
  }

  async retryPipeline(projectId, pipelineId) {
    return this.request('POST', `/projects/${projectId}/pipelines/${pipelineId}/retry`);
  }
}

export const api = new GitLabAPI();
