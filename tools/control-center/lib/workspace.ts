import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import {
  WORKSPACE_AGENTS,
  WORKSPACE_LINK_GROUPS,
  WORKSPACE_PRIORITIES,
  WORKSPACE_TASK_STATUSES,
  type IdeaConversionInput,
  type WorkspaceAgent,
  type WorkspaceData,
  type WorkspaceRemoval,
  type WorkspaceVisibleData,
} from "./types";
import { enumValue, identifier, integer, record, safeUrl, text, ValidationError } from "./validation";

type Client = SupabaseClient<Database>;
type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type IdeaRow = Database["public"]["Tables"]["ideas"]["Row"];
type MilestoneRow = Database["public"]["Tables"]["milestones"]["Row"];
type VisionRow = Database["public"]["Tables"]["vision_items"]["Row"];
type LinkRow = Database["public"]["Tables"]["workspace_links"]["Row"];

const STATUS_TO_DB = { offen: "open", später: "later", erledigt: "done" } as const;
const STATUS_FROM_DB = { open: "offen", later: "später", done: "erledigt" } as const;
const PRIORITY_TO_DB = { "sehr-hoch": "very_high", hoch: "high", mittel: "medium", niedrig: "low" } as const;
const PRIORITY_FROM_DB = { very_high: "sehr-hoch", high: "hoch", medium: "mittel", low: "niedrig" } as const;
const AGENT_TO_DB = { "Claude Code": "claude", Codex: "codex", offen: "open" } as const;
const AGENT_FROM_DB = { claude: "Claude Code", codex: "Codex", open: "offen" } as const;

function rows(value: unknown, label: string, maximum = 1_000): unknown[] {
  if (!Array.isArray(value)) throw new ValidationError(`${label} muss eine Liste sein.`);
  if (value.length > maximum) throw new ValidationError(`${label} darf höchstens ${maximum} Einträge enthalten.`);
  return value;
}

function timestamp(value: unknown): string {
  const result = text(value, "Zeitstempel", { required: true, max: 40 });
  if (Number.isNaN(Date.parse(result))) throw new ValidationError("Ein Zeitstempel ist ungültig.");
  return result;
}

function unique<T extends { id: string }>(items: T[], label: string): T[] {
  if (new Set(items.map((item) => item.id)).size !== items.length) throw new ValidationError(`${label} enthält eine doppelte ID.`);
  return items;
}

export function workspaceVisibleInput(value: unknown): WorkspaceVisibleData {
  const data = record(value, "Workspace");
  return {
    tasks: unique(rows(data.tasks, "Aufgaben").map((entry) => {
      const item = record(entry, "Aufgabe");
      return {
        id: identifier(item.id, "Aufgaben-ID"),
        title: text(item.title, "Titel", { required: true, max: 180 }),
        status: enumValue(item.status, "Status", WORKSPACE_TASK_STATUSES),
        priority: enumValue(item.priority, "Priorität", WORKSPACE_PRIORITIES),
        todo: text(item.todo, "To-do", { max: 20_000 }),
        definitionOfDone: text(item.definitionOfDone, "Definition of Done", { max: 20_000 }),
        agentPrompt: text(item.agentPrompt, "Prompt", { max: 60_000 }),
        preferredAgent: enumValue(item.preferredAgent, "Zielagent", WORKSPACE_AGENTS),
        order: integer(item.order, "Reihenfolge", { min: 0, max: 100_000, fallback: 0 }),
        createdAt: timestamp(item.createdAt),
        updatedAt: timestamp(item.updatedAt),
      };
    }), "Aufgaben"),
    ideas: unique(rows(data.ideas, "Ideen").map((entry) => {
      const item = record(entry, "Idee");
      return {
        id: identifier(item.id, "Ideen-ID"),
        title: text(item.title, "Titel", { required: true, max: 180 }),
        idea: text(item.idea, "Idee", { max: 30_000 }),
        order: integer(item.order, "Reihenfolge", { min: 0, max: 100_000, fallback: 0 }),
        createdAt: timestamp(item.createdAt),
        updatedAt: timestamp(item.updatedAt),
      };
    }), "Ideen"),
    milestones: unique(rows(data.milestones, "Milestones", 300).map((entry) => {
      const item = record(entry, "Milestone");
      return {
        id: identifier(item.id, "Milestone-ID"),
        title: text(item.title, "Titel", { required: true, max: 180 }),
        shortDescription: text(item.shortDescription, "Beschreibung", { max: 1_000 }),
        order: integer(item.order, "Reihenfolge", { min: 0, max: 100_000, fallback: 0 }),
      };
    }), "Milestones"),
    vision: unique(rows(data.vision, "Vision", 300).map((entry) => {
      const item = record(entry, "Visionseintrag");
      return {
        id: identifier(item.id, "Vision-ID"),
        text: text(item.text, "Vision", { required: true, max: 1_000 }),
        order: integer(item.order, "Reihenfolge", { min: 0, max: 100_000, fallback: 0 }),
      };
    }), "Vision"),
    links: unique(rows(data.links, "Links", 300).map((entry) => {
      const item = record(entry, "Link");
      const description = text(item.description, "Beschreibung", { max: 500 });
      return {
        id: identifier(item.id, "Link-ID"),
        name: text(item.name, "Name", { required: true, max: 100 }),
        ...(description ? { description } : {}),
        url: safeUrl(item.url, "URL", true),
        group: enumValue(item.group, "Linkgruppe", WORKSPACE_LINK_GROUPS),
        order: integer(item.order, "Reihenfolge", { min: 0, max: 100_000, fallback: 0 }),
      };
    }), "Links"),
  };
}

function databaseError(error: { code?: string; message: string } | null, fallback: string): void {
  if (error) {
    console.error("[Gradefruit Workspace database]", error.code ?? "unknown", error.message);
    throw new Error(fallback);
  }
}

export async function readWorkspace(client: Client): Promise<WorkspaceData> {
  const [tasks, ideas, milestones, vision, links] = await Promise.all([
    client.from("tasks").select("*").order("sort_order").returns<TaskRow[]>(),
    client.from("ideas").select("*").order("sort_order").returns<IdeaRow[]>(),
    client.from("milestones").select("*").order("sort_order").returns<MilestoneRow[]>(),
    client.from("vision_items").select("*").order("sort_order").returns<VisionRow[]>(),
    client.from("workspace_links").select("*").order("sort_order").returns<LinkRow[]>(),
  ]);
  databaseError(tasks.error, "Aufgaben konnten nicht geladen werden.");
  databaseError(ideas.error, "Ideen konnten nicht geladen werden.");
  databaseError(milestones.error, "Milestones konnten nicht geladen werden.");
  databaseError(vision.error, "Vision konnte nicht geladen werden.");
  databaseError(links.error, "Links konnten nicht geladen werden.");
  const allUpdated = [
    ...(tasks.data ?? []).map((row) => row.updated_at),
    ...(ideas.data ?? []).map((row) => row.updated_at),
    ...(milestones.data ?? []).map((row) => row.updated_at),
    ...(vision.data ?? []).map((row) => row.updated_at),
    ...(links.data ?? []).map((row) => row.updated_at),
  ].sort();
  return {
    tasks: (tasks.data ?? []).map((row) => ({ id: row.id, title: row.title, status: STATUS_FROM_DB[row.status], priority: PRIORITY_FROM_DB[row.priority], todo: row.todo, definitionOfDone: row.definition_of_done, agentPrompt: row.agent_prompt, preferredAgent: AGENT_FROM_DB[row.preferred_agent] as WorkspaceAgent, order: row.sort_order, createdAt: row.created_at, updatedAt: row.updated_at })),
    ideas: (ideas.data ?? []).map((row) => ({ id: row.id, title: row.title, idea: row.idea, order: row.sort_order, createdAt: row.created_at, updatedAt: row.updated_at })),
    milestones: (milestones.data ?? []).map((row) => ({ id: row.id, title: row.title, shortDescription: row.short_description, order: row.sort_order })),
    vision: (vision.data ?? []).map((row) => ({ id: row.id, text: row.text, order: row.sort_order })),
    links: (links.data ?? []).map((row) => ({ id: row.id, name: row.name, ...(row.description ? { description: row.description } : {}), url: row.url, group: row.group_name, order: row.sort_order })),
    updatedAt: allUpdated.at(-1) ?? new Date(0).toISOString(),
  };
}

function parseRemovals(value: unknown): WorkspaceRemoval[] {
  if (value === undefined) return [];
  return rows(value, "Löschungen", 200).map((entry) => {
    const item = record(entry, "Löschung");
    return {
      kind: enumValue(item.kind, "Löschtyp", ["task", "idea", "milestone", "vision", "link"] as const),
      id: identifier(item.id, "ID"),
      reason: enumValue(item.reason, "Löschgrund", ["deleted", "converted"] as const),
    };
  });
}

export async function saveWorkspace(client: Client, ownerId: string, value: unknown, removalsValue: unknown): Promise<WorkspaceData> {
  const workspace = workspaceVisibleInput(value);
  const removals = parseRemovals(removalsValue);
  const writes = [
    workspace.tasks.length ? client.from("tasks").upsert(workspace.tasks.map((item) => ({ id: item.id, owner_id: ownerId, title: item.title, status: STATUS_TO_DB[item.status], priority: PRIORITY_TO_DB[item.priority], todo: item.todo, definition_of_done: item.definitionOfDone, agent_prompt: item.agentPrompt, preferred_agent: AGENT_TO_DB[item.preferredAgent], sort_order: item.order, created_at: item.createdAt, updated_at: item.updatedAt }))) : null,
    workspace.ideas.length ? client.from("ideas").upsert(workspace.ideas.map((item) => ({ id: item.id, owner_id: ownerId, title: item.title, idea: item.idea, sort_order: item.order, created_at: item.createdAt, updated_at: item.updatedAt }))) : null,
    workspace.milestones.length ? client.from("milestones").upsert(workspace.milestones.map((item) => ({ id: item.id, owner_id: ownerId, title: item.title, short_description: item.shortDescription, sort_order: item.order }))) : null,
    workspace.vision.length ? client.from("vision_items").upsert(workspace.vision.map((item) => ({ id: item.id, owner_id: ownerId, text: item.text, sort_order: item.order }))) : null,
    workspace.links.length ? client.from("workspace_links").upsert(workspace.links.map((item) => ({ id: item.id, owner_id: ownerId, name: item.name, description: item.description ?? null, url: item.url, group_name: item.group, sort_order: item.order }))) : null,
  ].filter((write): write is Exclude<typeof write, null> => write !== null);
  const results = await Promise.all(writes);
  for (const result of results) databaseError(result.error, "Die Änderung konnte nicht gespeichert werden.");

  const tables = { task: "tasks", idea: "ideas", milestone: "milestones", vision: "vision_items", link: "workspace_links" } as const;
  for (const removal of removals) {
    const result = await client.from(tables[removal.kind]).delete().eq("id", removal.id).eq("owner_id", ownerId);
    databaseError(result.error, "Der Eintrag konnte nicht gelöscht werden.");
  }
  return readWorkspace(client);
}

export function ideaConversionInput(value: unknown): IdeaConversionInput {
  const data = record(value, "Idee umwandeln");
  return {
    ideaId: identifier(data.ideaId, "Ideen-ID"),
    title: text(data.title, "Titel", { required: true, max: 180 }),
    status: enumValue(data.status, "Status", WORKSPACE_TASK_STATUSES),
    priority: enumValue(data.priority, "Priorität", WORKSPACE_PRIORITIES),
  };
}

export async function convertIdeaToTask(client: Client, value: unknown): Promise<WorkspaceData> {
  const input = ideaConversionInput(value);
  const { error } = await client.rpc("convert_idea_to_task", {
    p_idea_id: input.ideaId,
    p_title: input.title,
    p_status: STATUS_TO_DB[input.status],
    p_priority: PRIORITY_TO_DB[input.priority],
  });
  databaseError(error, "Die Idee konnte nicht umgewandelt werden und bleibt erhalten.");
  return readWorkspace(client);
}
