import { apiFetch } from '../../../utils/api';

// Helper to construct query string from params object
function getQueryString(params: Record<string, any> = {}): string {
  const cleanParams: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      cleanParams[key] = String(value);
    }
  });
  const query = new URLSearchParams(cleanParams).toString();
  return query ? `?${query}` : '';
}

export class AdminApiService {
  // Stats
  static async getDashboard() {
    const res = await apiFetch('/api/v1/admin/dashboard');
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch dashboard data');
    return json.data;
  }

  // Users CRUD
  static async getUsers(params: any = {}) {
    const res = await apiFetch(`/api/v1/admin/users${getQueryString(params)}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch users');
    return json.data; // { data: User[], total, page, limit }
  }

  static async getUser(id: string) {
    const res = await apiFetch(`/api/v1/admin/users/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch user details');
    return json.data;
  }

  static async updateUserStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED') {
    const res = await apiFetch(`/api/v1/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update user status');
    return json;
  }

  static async deleteUser(id: string) {
    const res = await apiFetch(`/api/v1/admin/users/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to delete user');
    return json;
  }

  static async resetUserPassword(id: string) {
    const res = await apiFetch(`/api/v1/admin/users/${id}/reset-password`, {
      method: 'POST'
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to reset password');
    return json; // { success, tempPassword, message }
  }

  // Specialized User management
  static async getEmployers(params: any = {}) {
    const res = await apiFetch(`/api/v1/admin/employers${getQueryString(params)}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch employers');
    return json.data;
  }

  static async getWorkers(params: any = {}) {
    const res = await apiFetch(`/api/v1/admin/workers${getQueryString(params)}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch workers');
    return json.data;
  }

  // Job Listing & Approvals
  static async getJobs(params: any = {}) {
    const res = await apiFetch(`/api/v1/admin/jobs${getQueryString(params)}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch jobs');
    return json.data;
  }

  static async getPendingJobs(params: any = {}) {
    const res = await apiFetch(`/api/v1/admin/jobs/pending${getQueryString(params)}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch pending jobs');
    return json.data;
  }

  static async getJob(id: string) {
    const res = await apiFetch(`/api/v1/admin/jobs/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch job details');
    return json.data;
  }

  static async approveJob(id: string) {
    const res = await apiFetch(`/api/v1/admin/jobs/${id}/approve`, {
      method: 'PATCH'
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to approve job');
    return json.data;
  }

  static async rejectJob(id: string, reason: string) {
    const res = await apiFetch(`/api/v1/admin/jobs/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to reject job');
    return json.data;
  }

  static async unpublishJob(id: string) {
    const res = await apiFetch(`/api/v1/admin/jobs/${id}/unpublish`, {
      method: 'PATCH'
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to unpublish job');
    return json.data;
  }

  static async deleteJob(id: string) {
    const res = await apiFetch(`/api/v1/admin/jobs/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to delete job');
    return json;
  }

  // Categories CRUD
  static async getCategories() {
    const res = await apiFetch('/api/v1/admin/categories');
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch categories');
    return json.data;
  }

  static async createCategory(data: { name: string; icon: string }) {
    const res = await apiFetch('/api/v1/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create category');
    return json.data;
  }

  static async updateCategory(id: string, data: { name: string; icon: string; status: 'ACTIVE' | 'INACTIVE' }) {
    const res = await apiFetch(`/api/v1/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update category');
    return json.data;
  }

  static async deleteCategory(id: string) {
    const res = await apiFetch(`/api/v1/admin/categories/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to delete category');
    return json;
  }

  // Skills CRUD
  static async getSkills() {
    const res = await apiFetch('/api/v1/admin/skills');
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch skills');
    return json.data;
  }

  static async createSkill(data: { name: string }) {
    const res = await apiFetch('/api/v1/admin/skills', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create skill');
    return json.data;
  }

  static async updateSkill(id: string, data: { name: string; status: 'ACTIVE' | 'INACTIVE' }) {
    const res = await apiFetch(`/api/v1/admin/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update skill');
    return json.data;
  }

  static async deleteSkill(id: string) {
    const res = await apiFetch(`/api/v1/admin/skills/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to delete skill');
    return json;
  }

  // Reports
  static async getReports(params: any = {}) {
    const res = await apiFetch(`/api/v1/admin/reports${getQueryString(params)}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch reports');
    return json.data;
  }

  static async resolveReport(id: string, action: 'ignore' | 'delete_content' | 'suspend_user') {
    const res = await apiFetch(`/api/v1/admin/reports/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ action })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to resolve report');
    return json;
  }

  // Settings
  static async getSettings() {
    const res = await apiFetch('/api/v1/admin/settings');
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch system settings');
    return json.data;
  }

  static async updateSettings(settings: Record<string, string>) {
    const res = await apiFetch('/api/v1/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update system settings');
    return json;
  }

  // Audit Logs
  static async getAuditLogs(params: any = {}) {
    const res = await apiFetch(`/api/v1/admin/audit${getQueryString(params)}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch audit logs');
    return json.data;
  }

  // Broadcast System
  static async getBroadcastHistory(params: any = {}) {
    const res = await apiFetch(`/api/v1/admin/broadcast/history${getQueryString(params)}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch broadcast history');
    return json.data;
  }

  static async broadcastNotifications(data: {
    targetAudience: 'ALL' | 'WORKERS' | 'EMPLOYERS' | 'CATEGORY_WORKERS';
    category?: string;
    channels: ('IN_APP' | 'EMAIL')[];
    subject: string;
    message: string;
    actionLink?: string;
  }) {
    const res = await apiFetch('/api/v1/admin/broadcast', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to dispatch broadcast');
    return json;
  }
}
