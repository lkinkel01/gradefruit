import "server-only";

import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import type { ImportKind, WorkspaceImportPreview, WorkspaceImportResult, WorkspaceVisibleData } from "./types";
import { readWorkspace, mapImportAgent, mapImportPriority, mapImportStatus, saveWorkspace } from "./workspace";
import { integer, record, safeUrl, text, ValidationError } from "./validation";

type Client = SupabaseClient<Database>;
const KINDS: ImportKind[] = ["tasks", "ideas", "milestones", "vision", "links"];

function list(value: unknown, label: string, maximum = 1_000): Record<string, unknown>[] {
  if (!Array.isArray(value)) throw new ValidationError(`${label} fehlt oder ist keine Liste.`);
  if (value.length > maximum) throw new ValidationError(`${label} enthält zu viele Einträge.`);
  return value.map((item) => record(item, label));
}

function date(value: unknown): string {
  if (typeof value === "string" && !Number.isNaN(Date.parse(value))) return value;
  return new Date().toISOString();
}

export function normalizeLocalBackup(value: unknown): WorkspaceVisibleData {
  const source = record(value, "Importdatei");
  const tasks = list(source.tasks, "Aufgaben").map((item, index) => ({
    id: randomUUID(),
    title: text(item.title, "Aufgabentitel", { required: true, max: 180 }),
    status: mapImportStatus(item.status),
    priority: mapImportPriority(item.priority),
    todo: text(item.todo ?? item.description, "To-do", { max: 20_000 }),
    definitionOfDone: text(item.definitionOfDone ?? item.acceptanceCriteria, "Definition of Done", { max: 20_000 }),
    agentPrompt: text(item.agentPrompt ?? item.prompt, "Prompt", { max: 60_000 }),
    preferredAgent: mapImportAgent(item.preferredAgent),
    order: integer(item.order, "Reihenfolge", { min: 0, max: 100_000, fallback: index }),
    createdAt: date(item.createdAt),
    updatedAt: date(item.updatedAt),
  }));
  const ideas = list(source.ideas, "Ideen").map((item, index) => ({
    id: randomUUID(),
    title: text(item.title, "Ideentitel", { required: true, max: 180 }),
    idea: text(item.idea ?? item.note, "Idee", { max: 30_000 }),
    order: integer(item.order, "Reihenfolge", { min: 0, max: 100_000, fallback: index }),
    createdAt: date(item.createdAt),
    updatedAt: date(item.updatedAt),
  }));
  const milestoneSource = source.milestones ?? source.statusItems ?? [];
  const milestones = list(milestoneSource, "Milestones", 300).map((item, index) => ({
    id: randomUUID(),
    title: text(item.title, "Milestone-Titel", { required: true, max: 180 }).replaceAll("Greatfruit", "Gradefruit"),
    shortDescription: text(item.shortDescription ?? item.description, "Milestone-Beschreibung", { max: 1_000 }).replaceAll("Greatfruit", "Gradefruit"),
    order: integer(item.order, "Reihenfolge", { min: 0, max: 100_000, fallback: index }),
  }));
  const vision = list(source.vision ?? [], "Vision", 300).map((item, index) => ({
    id: randomUUID(),
    text: text(item.text, "Vision", { required: true, max: 1_000 }).replaceAll("Greatfruit", "Gradefruit"),
    order: integer(item.order, "Reihenfolge", { min: 0, max: 100_000, fallback: index }),
  }));
  const links = list(source.links, "Links", 300).map((item, index) => ({
    id: randomUUID(),
    name: text(item.name, "Linkname", { required: true, max: 100 }).replaceAll("Greatfruit", "Gradefruit"),
    description: text(item.description, "Linkbeschreibung", { max: 500 }).replaceAll("Greatfruit", "Gradefruit") || undefined,
    url: safeUrl(item.url, "Link-URL", true),
    group: item.group === "external" ? "external" as const : "project" as const,
    order: integer(item.order, "Reihenfolge", { min: 0, max: 100_000, fallback: index }),
  }));
  return { tasks, ideas, milestones, vision, links };
}

function fingerprint(kind: ImportKind, item: Record<string, unknown>): string {
  const fields: Record<ImportKind, string[]> = {
    tasks: ["title", "status", "priority", "todo", "definitionOfDone", "agentPrompt", "preferredAgent"],
    ideas: ["title", "idea"],
    milestones: ["title", "shortDescription"],
    vision: ["text"],
    links: ["name", "url", "group"],
  };
  return JSON.stringify(fields[kind].map((key) => String(item[key] ?? "").trim().toLocaleLowerCase("de-DE")));
}

function splitNew(source: WorkspaceVisibleData, current: WorkspaceVisibleData) {
  return Object.fromEntries(KINDS.map((kind) => {
    const seen = new Set((current[kind] as unknown as Record<string, unknown>[]).map((item) => fingerprint(kind, item)));
    const values = (source[kind] as unknown as Record<string, unknown>[]).filter((item) => {
      const key = fingerprint(kind, item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return [kind, values];
  })) as unknown as WorkspaceVisibleData;
}

function counts(source: WorkspaceVisibleData, fresh: WorkspaceVisibleData): WorkspaceImportPreview {
  const result = Object.fromEntries(KINDS.map((kind) => [kind, { new: fresh[kind].length, duplicates: source[kind].length - fresh[kind].length }])) as WorkspaceImportPreview["counts"];
  return {
    counts: result,
    totalNew: KINDS.reduce((sum, kind) => sum + result[kind].new, 0),
    totalDuplicates: KINDS.reduce((sum, kind) => sum + result[kind].duplicates, 0),
  };
}

export async function previewLocalImport(client: Client, value: unknown): Promise<WorkspaceImportPreview> {
  const source = normalizeLocalBackup(value);
  const current = await readWorkspace(client);
  const fresh = splitNew(source, current);
  return counts(source, fresh);
}

export async function confirmLocalImport(client: Client, ownerId: string, value: unknown): Promise<WorkspaceImportResult> {
  const source = normalizeLocalBackup(value);
  const current = await readWorkspace(client);
  const fresh = splitNew(source, current);
  const preview = counts(source, fresh);
  const merged: WorkspaceVisibleData = {
    tasks: [...current.tasks, ...fresh.tasks],
    ideas: [...current.ideas, ...fresh.ideas],
    milestones: [...current.milestones, ...fresh.milestones],
    vision: [...current.vision, ...fresh.vision],
    links: [...current.links, ...fresh.links],
  };
  await saveWorkspace(client, ownerId, merged, []);
  return { ...preview, imported: Object.fromEntries(KINDS.map((kind) => [kind, fresh[kind].length])) as WorkspaceImportResult["imported"] };
}
