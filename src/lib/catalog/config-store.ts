import type { Workspace, Project, Branch, WorkspaceMember } from './workspace-schema';

declare global {
  interface KVNamespace {
    get(key: string, type?: 'text' | 'json' | 'arrayBuffer' | 'stream'): Promise<any>;
    put(key: string, value: string | ArrayBuffer | ReadableStream): Promise<void>;
    delete(key: string): Promise<void>;
  }
}

/**
 * A lightweight ConfigStore to manage tenant routing via Cloudflare KV.
 * Falls back to in-memory config for local development if KV is not bound.
 */
export class ConfigStore {
  private kv: KVNamespace | null;

  constructor(kvBinding?: KVNamespace) {
    this.kv = kvBinding || (globalThis as any).WORKSPACES_KV || null;
  }

  // --- Development Mock Data ---
  private mockWorkspaces: Workspace[] = [
    { id: 'ws_1', name: 'Demo Workspace', slug: 'demo', created_at: new Date().toISOString() }
  ];
  
  private mockProjects: Project[] = [
    { id: 'proj_1', workspace_id: 'ws_1', name: 'Main Catalog', slug: 'main', google_sheet_id: '1xyz...', theme_config: {}, created_at: new Date().toISOString() }
  ];
  
  private mockBranches: Branch[] = [
    { id: 'br_1', project_id: 'proj_1', name: 'Riyadh Branch', slug: 'riyadh', domain: null, metadata: {}, created_at: new Date().toISOString() }
  ];
  
  private mockMembers: WorkspaceMember[] = [
    { workspace_id: 'ws_1', user_id: 'admin_1', role: 'owner', profile: { id: 'admin_1', email: 'admin@demo.com', full_name: 'Admin', avatar_url: null } }
  ];

  // --- Methods ---

  async getWorkspaces(): Promise<Workspace[]> {
    if (this.kv) {
      const data = await this.kv.get('workspaces');
      return data ? JSON.parse(data) : [];
    }
    return this.mockWorkspaces;
  }

  async getProjects(workspaceId: string): Promise<Project[]> {
    if (this.kv) {
      const data = await this.kv.get(`projects:${workspaceId}`);
      return data ? JSON.parse(data) : [];
    }
    return this.mockProjects.filter(p => p.workspace_id === workspaceId);
  }

  async getBranches(projectId: string): Promise<Branch[]> {
    if (this.kv) {
      const data = await this.kv.get(`branches:${projectId}`);
      return data ? JSON.parse(data) : [];
    }
    return this.mockBranches.filter(b => b.project_id === projectId);
  }

  async getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    if (this.kv) {
      const data = await this.kv.get(`members:${workspaceId}`);
      return data ? JSON.parse(data) : [];
    }
    return this.mockMembers.filter(m => m.workspace_id === workspaceId);
  }

  async getBranchBySlugs(projectSlug: string, branchSlug: string): Promise<{ project: Project, branch: Branch } | null> {
    if (this.kv) {
      // In KV, we could store a fast-lookup map: `route:${projectSlug}:${branchSlug}` -> {project, branch}
      const data = await this.kv.get(`route:${projectSlug}:${branchSlug}`);
      if (data) return JSON.parse(data);
      return null; // or do a slow lookup
    }
    
    const project = this.mockProjects.find(p => p.slug === projectSlug);
    if (!project) return null;
    
    const branch = this.mockBranches.find(b => b.project_id === project.id && b.slug === branchSlug);
    if (!branch) return null;
    
    return { project, branch };
  }
}
