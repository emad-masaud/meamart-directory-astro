export interface Workspace {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

export type Role = 'owner' | 'admin' | 'editor' | 'viewer';

export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  role: Role;
  profile?: Profile;
}

export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  google_sheet_id: string | null;
  theme_config: any;
  created_at: string;
}

export interface Branch {
  id: string;
  project_id: string;
  name: string;
  slug: string;
  domain: string | null;
  metadata: any;
  created_at: string;
}
