"use client";

import type { DragEvent, FormEvent } from "react";
import { useMemo, useState } from "react";
import type { WorkspacePriority, WorkspaceTask, WorkspaceTaskStatus } from "@/lib/types";
import { useWorkspace } from "@/lib/use-workspace";
import { ModeToolbar, type WorkspaceMode } from "./ModeToolbar";
import { Disclosure, SortHandle } from "./SortHandle";
import { WorkspaceModal } from "./WorkspaceModal";
import { EmptyState, Field, Loading, Notice } from "./ui";

const STATUS_LABELS: Record<WorkspaceTaskStatus, string> = { offen: "Offen", später: "Später", erledigt: "Erledigt" };
const PRIORITY_LABELS: Record<WorkspacePriority, string> = { "sehr-hoch": "Sehr hoch", hoch: "Hoch", mittel: "Mittel", niedrig: "Niedrig" };
const STATUS_ORDER: Record<WorkspaceTaskStatus, number> = { offen: 0, später: 1, erledigt: 2 };
const PRIORITY_ORDER: Record<WorkspacePriority, number> = { "sehr-hoch": 0, hoch: 1, mittel: 2, niedrig: 3 };
type StatusFilter = WorkspaceTaskStatus | "alle";
type PriorityFilter = WorkspacePriority | "alle";

function sortTasks(tasks: WorkspaceTask[]): WorkspaceTask[] {
  return [...tasks].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    || a.order - b.order
    || a.createdAt.localeCompare(b.createdAt));
}

function sameGroup(a: WorkspaceTask, b: WorkspaceTask): boolean {
  return a.status === b.status && a.priority === b.priority;
}

export function WorkClient() {
  const { workspace, visible, notice, error, busy, save } = useWorkspace();
  const [mode, setMode] = useState<WorkspaceMode>("normal");
  const [draft, setDraft] = useState<WorkspaceTask | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("alle");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("alle");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const sorted = useMemo(() => sortTasks(workspace?.tasks ?? []), [workspace]);
  const filtered = sorted
    .filter((task) => statusFilter === "alle" || task.status === statusFilter)
    .filter((task) => priorityFilter === "alle" || task.priority === priorityFilter);

  function changeMode(next: WorkspaceMode) {
    setMode(next);
    setExpanded(new Set());
    setDraggedId(null);
  }

  function addTask() {
    const now = new Date().toISOString();
    setDraft({
      id: crypto.randomUUID(),
      title: "",
      status: "offen",
      priority: "mittel",
      todo: "",
      definitionOfDone: "",
      agentPrompt: "",
      preferredAgent: "offen",
      order: workspace?.tasks.length ?? 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  function editTask(task: WorkspaceTask) {
    setDraft({ ...task });
  }

  function toggleTask(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!visible || !draft || !draft.title.trim()) return;
    const previous = visible.tasks.find((task) => task.id === draft.id);
    const movedGroup = previous && !sameGroup(previous, draft);
    const order = movedGroup
      ? Math.max(-1, ...visible.tasks.filter((task) => sameGroup(task, draft) && task.id !== draft.id).map((task) => task.order)) + 1
      : draft.order;
    const item = { ...draft, title: draft.title.trim(), order, updatedAt: new Date().toISOString() };
    const tasks = previous ? visible.tasks.map((task) => task.id === item.id ? item : task) : [...visible.tasks, item];
    if (await save({ ...visible, tasks }, "Aufgabe gespeichert.")) setDraft(null);
  }

  async function deleteTask(task: WorkspaceTask) {
    if (!visible || !window.confirm(`„${task.title}“ wirklich löschen?`)) return;
    if (await save(
      { ...visible, tasks: visible.tasks.filter((item) => item.id !== task.id) },
      "Aufgabe gelöscht.",
      [{ kind: "task", id: task.id, reason: "deleted" }],
    )) setDraft(null);
  }

  async function completeTask(task: WorkspaceTask) {
    if (!visible || task.status === "erledigt") return;
    const completed = { ...task, status: "erledigt" as const, order: visible.tasks.length, updatedAt: new Date().toISOString() };
    await save({ ...visible, tasks: visible.tasks.map((item) => item.id === task.id ? completed : item) }, "Aufgabe erledigt.");
  }

  async function copyPrompt(task: WorkspaceTask) {
    if (!task.agentPrompt) return;
    try {
      await navigator.clipboard.writeText(task.agentPrompt);
      setCopiedId(task.id);
    } catch {
      setCopiedId(null);
    }
  }

  async function moveTask(id: string, targetId: string) {
    if (!visible || id === targetId) return;
    const item = visible.tasks.find((task) => task.id === id);
    const target = visible.tasks.find((task) => task.id === targetId);
    if (!item || !target || !sameGroup(item, target)) return;
    const group = visible.tasks.filter((task) => sameGroup(task, item)).sort((a, b) => a.order - b.order);
    const from = group.findIndex((task) => task.id === id);
    const to = group.findIndex((task) => task.id === targetId);
    const reordered = [...group];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    const orderById = new Map(reordered.map((task, index) => [task.id, index]));
    await save({ ...visible, tasks: visible.tasks.map((task) => orderById.has(task.id) ? { ...task, order: orderById.get(task.id) ?? task.order } : task) }, "Reihenfolge gespeichert.");
  }

  function moveBy(task: WorkspaceTask, direction: -1 | 1) {
    const group = sorted.filter((item) => sameGroup(item, task));
    const index = group.findIndex((item) => item.id === task.id);
    const target = group[index + direction];
    if (target) void moveTask(task.id, target.id);
  }

  function drop(event: DragEvent<HTMLElement>, target: WorkspaceTask) {
    event.preventDefault();
    if (draggedId) void moveTask(draggedId, target.id);
    setDraggedId(null);
  }

  if (!workspace || !visible) return <><Notice message={error} error /><Loading /></>;

  return (
    <div className="workspace-page">
      <header className="page-heading">
        <h1>Meine Aufgaben</h1>
      </header>
      <div className="page-toolbar task-toolbar">
        <div className="compact-filters">
          <Field label="Status">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}>
              <option value="alle">Alle</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </Field>
          <Field label="Priorität">
            <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as PriorityFilter)}>
              <option value="alle">Alle</option>
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </Field>
        </div>
        <ModeToolbar mode={mode} onModeChange={changeMode} addLabel="Aufgabe hinzufügen" onAdd={addTask} />
      </div>
      <Notice message={notice} />
      <Notice message={error} error />

      {filtered.length ? (
        <div className="record-list" aria-label="Aufgaben">
          {filtered.map((task) => {
            const isExpanded = expanded.has(task.id);
            const group = sorted.filter((item) => sameGroup(item, task));
            const groupIndex = group.findIndex((item) => item.id === task.id);
            return (
              <article
                className={`record task-record status-${task.status} mode-${mode}`}
                key={task.id}
                draggable={mode === "reorder" && !busy}
                onDragStart={(event) => { if (mode === "reorder") { setDraggedId(task.id); event.dataTransfer.effectAllowed = "move"; } }}
                onDragEnd={() => setDraggedId(null)}
                onDragOver={(event) => { if (mode === "reorder" && draggedId) event.preventDefault(); }}
                onDrop={(event) => drop(event, task)}
              >
                {mode === "reorder" ? (
                  <SortHandle label={task.title} canMoveUp={groupIndex > 0} canMoveDown={groupIndex >= 0 && groupIndex < group.length - 1} onMoveUp={() => moveBy(task, -1)} onMoveDown={() => moveBy(task, 1)} />
                ) : null}

                {mode === "normal" ? (
                  <>
                    <button className="record-summary" type="button" onClick={() => toggleTask(task.id)} aria-expanded={isExpanded}>
                      <span className="record-title">{task.title}</span>
                      <span className="task-meta"><span className="status-label"><i aria-hidden="true" />{STATUS_LABELS[task.status]}</span><span>{PRIORITY_LABELS[task.priority]}</span></span>
                      <Disclosure expanded={isExpanded} />
                    </button>
                    {isExpanded ? (
                      <div className="record-detail">
                        <div className="task-detail-sections">
                          <section className="task-detail-section">
                            <h2>To-do</h2>
                            <p className="preserve-lines">{task.todo || "Noch nicht eingetragen."}</p>
                          </section>
                          <section className="task-detail-section">
                            <h2>Definition of Done</h2>
                            <p className="preserve-lines">{task.definitionOfDone || "Noch nicht eingetragen."}</p>
                          </section>
                          <section className="task-detail-section">
                            <h2>Prompt</h2>
                            <div className="prompt-preview preserve-lines">{task.agentPrompt || "Noch nicht eingetragen."}</div>
                          </section>
                        </div>
                        <div className="record-actions">
                          <button className="button secondary small" type="button" onClick={() => { changeMode("edit"); editTask(task); }}>Bearbeiten</button>
                          <button className="button secondary small" type="button" disabled={!task.agentPrompt} onClick={() => void copyPrompt(task)}>{copiedId === task.id ? "Kopiert" : "Prompt kopieren"}</button>
                          {task.status !== "erledigt" ? <button className="text-button" type="button" onClick={() => void completeTask(task)}>Als erledigt markieren</button> : null}
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="record-management">
                    <span className="record-title">{task.title}</span>
                    <span className="task-meta"><span>{STATUS_LABELS[task.status]}</span><span>{PRIORITY_LABELS[task.priority]}</span></span>
                    {mode === "edit" ? <span className="management-actions"><button className="text-button" type="button" onClick={() => editTask(task)}>Bearbeiten</button><button className="text-button danger-text" type="button" onClick={() => void deleteTask(task)}>Löschen</button></span> : null}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : <EmptyState>Keine Aufgaben für diese Auswahl.</EmptyState>}

      {draft ? (
        <WorkspaceModal title={workspace.tasks.some((task) => task.id === draft.id) ? "Aufgabe bearbeiten" : "Aufgabe hinzufügen"} onClose={() => setDraft(null)}>
          <form className="detail-form" onSubmit={(event) => void saveTask(event)}>
            <Field label="Titel" className="full"><input required maxLength={180} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></Field>
            <Field label="Status"><select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as WorkspaceTaskStatus })}>{Object.entries(STATUS_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></Field>
            <Field label="Priorität"><select value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as WorkspacePriority })}>{Object.entries(PRIORITY_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></Field>
            <Field label="To-do" className="full"><textarea rows={7} value={draft.todo} onChange={(event) => setDraft({ ...draft, todo: event.target.value })} /></Field>
            <Field label="Definition of Done" hint="Wann ist diese Aufgabe wirklich erledigt?" className="full"><textarea rows={5} value={draft.definitionOfDone} onChange={(event) => setDraft({ ...draft, definitionOfDone: event.target.value })} /></Field>
            <Field label="Prompt" className="full"><textarea className="prompt-field" rows={10} value={draft.agentPrompt} onChange={(event) => setDraft({ ...draft, agentPrompt: event.target.value })} /></Field>
            <Field label="Bevorzugter Agent"><select value={draft.preferredAgent} onChange={(event) => setDraft({ ...draft, preferredAgent: event.target.value as WorkspaceTask["preferredAgent"] })}><option value="offen">Offen</option><option value="Claude Code">Claude Code</option><option value="Codex">Codex</option></select></Field>
            <div className="detail-form-actions full">
              <button className="button" type="submit" disabled={busy}>Speichern</button>
              <button className="button secondary" type="button" onClick={() => setDraft(null)}>Abbrechen</button>
              {workspace.tasks.some((task) => task.id === draft.id) ? <button className="text-button danger-text push-right" type="button" onClick={() => void deleteTask(draft)}>Löschen</button> : null}
            </div>
          </form>
        </WorkspaceModal>
      ) : null}
    </div>
  );
}
