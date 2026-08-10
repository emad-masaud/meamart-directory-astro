import { ConfigStore } from './config-store';
import type { Workspace, Project, Branch, WorkspaceMember } from './workspace-schema';

// Helper to get the store. In Astro SSR, you can pass Astro.locals.runtime.env.WORKSPACES_KV
export function getStore(kvBinding?: any) {
  return new ConfigStore(kvBinding);
}

/**
 * Legacy wrappers to maintain API compatibility for existing routes.
 * They will use the mock store if no KV is bound globally.
 */
const store = new ConfigStore();

export async function getUserWorkspaces(): Promise<Workspace[]> {
  return store.getWorkspaces();
}

export async function getWorkspaceProjects(workspaceId: string): Promise<Project[]> {
  return store.getProjects(workspaceId);
}

export async function getProjectBranches(projectId: string): Promise<Branch[]> {
  return store.getBranches(projectId);
}

export async function getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  return store.getMembers(workspaceId);
}

export async function getBranchBySlugs(projectSlug: string, branchSlug: string): Promise<{ project: Project, branch: Branch } | null> {
  return store.getBranchBySlugs(projectSlug, branchSlug);
}
