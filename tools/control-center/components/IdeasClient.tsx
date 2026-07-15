"use client";

import type { DragEvent, FormEvent } from "react";
import { useMemo, useState } from "react";
import type { WorkspaceIdea, WorkspacePriority, WorkspaceTaskStatus } from "@/lib/types";
import { useWorkspace } from "@/lib/use-workspace";
import { ModeToolbar, type WorkspaceMode } from "./ModeToolbar";
import { Disclosure, SortHandle } from "./SortHandle";
import { WorkspaceModal } from "./WorkspaceModal";
import { EmptyState, Field, Loading, Notice } from "./ui";

const PRIORITY_LABELS: Record<WorkspacePriority, string> = { "sehr-hoch": "Sehr hoch", hoch: "Hoch", mittel: "Mittel", niedrig: "Niedrig" };
const STATUS_LABELS: Record<WorkspaceTaskStatus, string> = { offen: "Offen", später: "Später", erledigt: "Erledigt" };

interface ConversionDraft {
  idea: WorkspaceIdea;
  title: string;
  status: WorkspaceTaskStatus;
  priority: WorkspacePriority;
}

export function IdeasClient() {
  const { workspace, visible, notice, error, busy, save, convertIdea } = useWorkspace();
  const [mode, setMode] = useState<WorkspaceMode>("normal");
  const [draft, setDraft] = useState<WorkspaceIdea | null>(null);
  const [conversion, setConversion] = useState<ConversionDraft | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const sorted = useMemo(() => [...(workspace?.ideas ?? [])].sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt)), [workspace]);

  function changeMode(next: WorkspaceMode) {
    setMode(next);
    setExpanded(new Set());
    setDraggedId(null);
  }

  function addIdea() {
    const now = new Date().toISOString();
    setDraft({ id: crypto.randomUUID(), title: "", idea: "", order: workspace?.ideas.length ?? 0, createdAt: now, updatedAt: now });
  }

  function toggleIdea(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function saveIdea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!visible || !draft || !draft.title.trim()) return;
    const item = { ...draft, title: draft.title.trim(), updatedAt: new Date().toISOString() };
    const exists = visible.ideas.some((idea) => idea.id === item.id);
    const ideas = exists ? visible.ideas.map((idea) => idea.id === item.id ? item : idea) : [...visible.ideas, item];
    if (await save({ ...visible, ideas }, "Idee gespeichert.")) setDraft(null);
  }

  async function deleteIdea(idea: WorkspaceIdea) {
    if (!visible || !window.confirm(`„${idea.title}“ wirklich löschen?`)) return;
    if (await save(
      { ...visible, ideas: visible.ideas.filter((item) => item.id !== idea.id) },
      "Idee gelöscht.",
      [{ kind: "idea", id: idea.id, reason: "deleted" }],
    )) {
      setDraft(null);
      setExpanded((current) => new Set([...current].filter((id) => id !== idea.id)));
    }
  }

  function beginConversion(idea: WorkspaceIdea) {
    setConversion({ idea, title: idea.title, status: "offen", priority: "mittel" });
  }

  async function confirmConversion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!conversion) return;
    const converted = await convertIdea({
      ideaId: conversion.idea.id,
      title: conversion.title,
      status: conversion.status,
      priority: conversion.priority,
    });
    if (converted) {
      setConversion(null);
      setExpanded((current) => new Set([...current].filter((id) => id !== conversion.idea.id)));
    }
  }

  async function moveIdea(id: string, targetId: string) {
    if (!visible || id === targetId) return;
    const current = [...visible.ideas].sort((a, b) => a.order - b.order);
    const from = current.findIndex((idea) => idea.id === id);
    const to = current.findIndex((idea) => idea.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = current.splice(from, 1);
    current.splice(to, 0, moved);
    const orderById = new Map(current.map((idea, index) => [idea.id, index]));
    await save({ ...visible, ideas: visible.ideas.map((idea) => ({ ...idea, order: orderById.get(idea.id) ?? idea.order })) }, "Reihenfolge gespeichert.");
  }

  function moveBy(idea: WorkspaceIdea, direction: -1 | 1) {
    const index = sorted.findIndex((item) => item.id === idea.id);
    const target = sorted[index + direction];
    if (target) void moveIdea(idea.id, target.id);
  }

  function drop(event: DragEvent<HTMLElement>, target: WorkspaceIdea) {
    event.preventDefault();
    if (draggedId) void moveIdea(draggedId, target.id);
    setDraggedId(null);
  }

  if (!workspace || !visible) return <><Notice message={error} error /><Loading /></>;

  return (
    <div className="workspace-page">
      <header className="page-heading">
        <h1>Ideen</h1>
      </header>
      <div className="page-toolbar align-right">
        <ModeToolbar mode={mode} onModeChange={changeMode} addLabel="Idee hinzufügen" onAdd={addIdea} />
      </div>
      <Notice message={notice} />
      <Notice message={error} error />

      {sorted.length ? (
        <div className="record-list" aria-label="Ideen">
          {sorted.map((idea, index) => {
            const isExpanded = expanded.has(idea.id);
            return (
              <article
                className={`record idea-record mode-${mode}`}
                key={idea.id}
                draggable={mode === "reorder" && !busy}
                onDragStart={(event) => { if (mode === "reorder") { setDraggedId(idea.id); event.dataTransfer.effectAllowed = "move"; } }}
                onDragEnd={() => setDraggedId(null)}
                onDragOver={(event) => { if (mode === "reorder" && draggedId) event.preventDefault(); }}
                onDrop={(event) => drop(event, idea)}
              >
                {mode === "reorder" ? <SortHandle label={idea.title} canMoveUp={index > 0} canMoveDown={index < sorted.length - 1} onMoveUp={() => moveBy(idea, -1)} onMoveDown={() => moveBy(idea, 1)} /> : null}
                {mode === "normal" ? (
                  <>
                    <button className="record-summary" type="button" onClick={() => toggleIdea(idea.id)} aria-expanded={isExpanded}>
                      <span className="record-title">{idea.title}</span>
                      <Disclosure expanded={isExpanded} />
                    </button>
                    {isExpanded ? (
                      <div className="record-detail">
                        <section className="idea-detail-section">
                          <h2>Idee</h2>
                          <p className="preserve-lines idea-copy">{idea.idea || "Noch kein Text eingetragen."}</p>
                        </section>
                        <div className="record-actions">
                          <button className="button secondary small" type="button" onClick={() => { changeMode("edit"); setDraft({ ...idea }); }}>Bearbeiten</button>
                          <button className="button secondary small" type="button" onClick={() => beginConversion(idea)}>Zu Aufgabe umwandeln</button>
                          <button className="text-button danger-text" type="button" onClick={() => void deleteIdea(idea)}>Löschen</button>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="record-management">
                    <span className="record-title">{idea.title}</span>
                    {mode === "edit" ? <span className="management-actions"><button className="text-button" type="button" onClick={() => setDraft({ ...idea })}>Bearbeiten</button><button className="text-button danger-text" type="button" onClick={() => void deleteIdea(idea)}>Löschen</button></span> : null}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : <EmptyState>Noch keine Ideen gespeichert.</EmptyState>}

      {draft ? (
        <WorkspaceModal title={workspace.ideas.some((idea) => idea.id === draft.id) ? "Idee bearbeiten" : "Idee hinzufügen"} onClose={() => setDraft(null)}>
          <form className="detail-form" onSubmit={(event) => void saveIdea(event)}>
            <Field label="Titel" className="full"><input required maxLength={180} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></Field>
            <Field label="Idee" className="full"><textarea rows={12} value={draft.idea} onChange={(event) => setDraft({ ...draft, idea: event.target.value })} /></Field>
            <div className="detail-form-actions full">
              <button className="button" type="submit" disabled={busy}>Speichern</button>
              <button className="button secondary" type="button" onClick={() => setDraft(null)}>Abbrechen</button>
              {workspace.ideas.some((idea) => idea.id === draft.id) ? <button className="text-button danger-text push-right" type="button" onClick={() => void deleteIdea(draft)}>Löschen</button> : null}
            </div>
          </form>
        </WorkspaceModal>
      ) : null}

      {conversion ? (
        <WorkspaceModal title="Zu Aufgabe umwandeln" onClose={() => setConversion(null)}>
          <form className="detail-form" onSubmit={(event) => void confirmConversion(event)}>
            <Field label="Titel" className="full"><input required maxLength={180} value={conversion.title} onChange={(event) => setConversion({ ...conversion, title: event.target.value })} /></Field>
            <Field label="Status"><select value={conversion.status} onChange={(event) => setConversion({ ...conversion, status: event.target.value as WorkspaceTaskStatus })}>{Object.entries(STATUS_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></Field>
            <Field label="Priorität"><select value={conversion.priority} onChange={(event) => setConversion({ ...conversion, priority: event.target.value as WorkspacePriority })}>{Object.entries(PRIORITY_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></Field>
            <div className="conversion-preview full"><strong>To-do</strong><p className="preserve-lines">{conversion.idea.idea || "Kein Ideentext vorhanden."}</p></div>
            <div className="detail-form-actions full">
              <button className="button" type="submit" disabled={busy}>Umwandeln</button>
              <button className="button secondary" type="button" onClick={() => setConversion(null)}>Abbrechen</button>
            </div>
          </form>
        </WorkspaceModal>
      ) : null}
    </div>
  );
}
