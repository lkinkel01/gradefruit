export const WORKSPACE_TASK_STATUSES = ["offen", "später", "erledigt"] as const;
export const WORKSPACE_PRIORITIES = ["sehr-hoch", "hoch", "mittel", "niedrig"] as const;
export const WORKSPACE_LINK_GROUPS = ["project", "external"] as const;
export const WORKSPACE_AGENTS = ["offen", "Claude Code", "Codex"] as const;

export type WorkspaceTaskStatus = (typeof WORKSPACE_TASK_STATUSES)[number];
export type WorkspacePriority = (typeof WORKSPACE_PRIORITIES)[number];
export type WorkspaceLinkGroup = (typeof WORKSPACE_LINK_GROUPS)[number];
export type WorkspaceAgent = (typeof WORKSPACE_AGENTS)[number];

export interface WorkspaceTask {
  id: string;
  title: string;
  status: WorkspaceTaskStatus;
  priority: WorkspacePriority;
  todo: string;
  definitionOfDone: string;
  agentPrompt: string;
  preferredAgent: WorkspaceAgent;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceIdea {
  id: string;
  title: string;
  idea: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMilestone {
  id: string;
  title: string;
  shortDescription: string;
  order: number;
}

export interface WorkspaceVisionItem {
  id: string;
  text: string;
  order: number;
}

export interface WorkspaceLink {
  id: string;
  name: string;
  description?: string;
  url: string;
  group: WorkspaceLinkGroup;
  order: number;
}

export interface WorkspaceData {
  tasks: WorkspaceTask[];
  ideas: WorkspaceIdea[];
  milestones: WorkspaceMilestone[];
  vision: WorkspaceVisionItem[];
  links: WorkspaceLink[];
  updatedAt: string;
}

export type WorkspaceVisibleData = Omit<WorkspaceData, "updatedAt">;

export interface WorkspaceRemoval {
  kind: "task" | "idea" | "milestone" | "vision" | "link";
  id: string;
  reason: "deleted" | "converted";
}

export interface IdeaConversionInput {
  ideaId: string;
  title: string;
  status: WorkspaceTaskStatus;
  priority: WorkspacePriority;
}

export type ImportKind = "tasks" | "ideas" | "milestones" | "vision" | "links";

export interface WorkspaceImportPreview {
  counts: Record<ImportKind, { new: number; duplicates: number }>;
  totalNew: number;
  totalDuplicates: number;
}

export interface WorkspaceImportResult extends WorkspaceImportPreview {
  imported: Record<ImportKind, number>;
}
