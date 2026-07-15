"use client";

import type { DragEvent, FormEvent } from "react";
import { useMemo, useState } from "react";
import type { WorkspaceMilestone, WorkspaceVisionItem } from "@/lib/types";
import { useWorkspace } from "@/lib/use-workspace";
import { ModeToolbar, type WorkspaceMode } from "./ModeToolbar";
import { Disclosure, SortHandle } from "./SortHandle";
import { WorkspaceModal } from "./WorkspaceModal";
import { EmptyState, Field, Loading, Notice } from "./ui";

type EditState = { kind: "milestone"; item: WorkspaceMilestone } | { kind: "vision"; item: WorkspaceVisionItem };

export function MilestonesClient() {
  const { workspace, visible, notice, error, busy, save } = useWorkspace();
  const [mode, setMode] = useState<WorkspaceMode>("normal");
  const [editing, setEditing] = useState<EditState | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dragged, setDragged] = useState<{ kind: "milestone" | "vision"; id: string } | null>(null);
  const milestones = useMemo(() => [...(workspace?.milestones ?? [])].sort((a, b) => a.order - b.order), [workspace]);
  const vision = useMemo(() => [...(workspace?.vision ?? [])].sort((a, b) => a.order - b.order), [workspace]);

  function changeMode(next: WorkspaceMode) {
    setMode(next);
    setExpanded(new Set());
    setDragged(null);
  }

  function addMilestone() {
    setEditing({ kind: "milestone", item: { id: crypto.randomUUID(), title: "", shortDescription: "", order: milestones.length } });
  }

  function addVision() {
    setEditing({ kind: "vision", item: { id: crypto.randomUUID(), text: "", order: vision.length } });
  }

  function toggle(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!visible || !editing) return;
    if (editing.kind === "milestone") {
      if (!editing.item.title.trim()) return;
      const item = { ...editing.item, title: editing.item.title.trim() };
      const exists = visible.milestones.some((entry) => entry.id === item.id);
      const next = exists ? visible.milestones.map((entry) => entry.id === item.id ? item : entry) : [...visible.milestones, item];
      if (await save({ ...visible, milestones: next }, "Milestone gespeichert.")) setEditing(null);
    } else {
      if (!editing.item.text.trim()) return;
      const item = { ...editing.item, text: editing.item.text.trim() };
      const exists = visible.vision.some((entry) => entry.id === item.id);
      const next = exists ? visible.vision.map((entry) => entry.id === item.id ? item : entry) : [...visible.vision, item];
      if (await save({ ...visible, vision: next }, "Vision gespeichert.")) setEditing(null);
    }
  }

  async function deleteEdit(item = editing) {
    if (!visible || !item) return;
    const label = item.kind === "milestone" ? item.item.title : item.item.text;
    if (!window.confirm(`„${label}“ wirklich löschen?`)) return;
    const next = item.kind === "milestone"
      ? { ...visible, milestones: visible.milestones.filter((entry) => entry.id !== item.item.id) }
      : { ...visible, vision: visible.vision.filter((entry) => entry.id !== item.item.id) };
    if (await save(next, "Eintrag gelöscht.", [{ kind: item.kind, id: item.item.id, reason: "deleted" }])) setEditing(null);
  }

  async function reorder(kind: "milestone" | "vision", id: string, targetId: string) {
    if (!visible || id === targetId) return;
    const items = [...(kind === "milestone" ? visible.milestones : visible.vision)].sort((a, b) => a.order - b.order);
    const from = items.findIndex((item) => item.id === id);
    const to = items.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);
    const orderById = new Map(items.map((item, index) => [item.id, index]));
    if (kind === "milestone") {
      await save({ ...visible, milestones: visible.milestones.map((item) => ({ ...item, order: orderById.get(item.id) ?? item.order })) }, "Reihenfolge gespeichert.");
    } else {
      await save({ ...visible, vision: visible.vision.map((item) => ({ ...item, order: orderById.get(item.id) ?? item.order })) }, "Reihenfolge gespeichert.");
    }
  }

  function moveBy(kind: "milestone" | "vision", id: string, direction: -1 | 1) {
    const items = kind === "milestone" ? milestones : vision;
    const index = items.findIndex((item) => item.id === id);
    const target = items[index + direction];
    if (target) void reorder(kind, id, target.id);
  }

  function drop(event: DragEvent<HTMLElement>, kind: "milestone" | "vision", targetId: string) {
    event.preventDefault();
    if (dragged?.kind === kind) void reorder(kind, dragged.id, targetId);
    setDragged(null);
  }

  if (!workspace || !visible) return <><Notice message={error} error /><Loading /></>;

  return (
    <div className="workspace-page milestones-page">
      <div className="page-toolbar section-toolbar">
        <h1 id="milestones-title">Milestones</h1>
        <ModeToolbar mode={mode} onModeChange={changeMode} addLabel="Milestone hinzufügen" onAdd={addMilestone} />
      </div>
      <Notice message={notice} />
      <Notice message={error} error />

      <section className="workspace-section" aria-labelledby="milestones-title">
        {milestones.length ? (
          <div className="record-list">
            {milestones.map((item, index) => {
              const isExpanded = expanded.has(item.id);
              return (
                <article
                  className={`record milestone-record mode-${mode}`}
                  key={item.id}
                  draggable={mode === "reorder" && !busy}
                  onDragStart={(event) => { if (mode === "reorder") { setDragged({ kind: "milestone", id: item.id }); event.dataTransfer.effectAllowed = "move"; } }}
                  onDragEnd={() => setDragged(null)}
                  onDragOver={(event) => { if (mode === "reorder" && dragged?.kind === "milestone") event.preventDefault(); }}
                  onDrop={(event) => drop(event, "milestone", item.id)}
                >
                  {mode === "reorder" ? <SortHandle label={item.title} canMoveUp={index > 0} canMoveDown={index < milestones.length - 1} onMoveUp={() => moveBy("milestone", item.id, -1)} onMoveDown={() => moveBy("milestone", item.id, 1)} /> : null}
                  {mode === "normal" ? (
                    <>
                      <button className="record-summary" type="button" onClick={() => toggle(item.id)} aria-expanded={isExpanded}>
                        <span className="record-title">{item.title}</span>
                        <Disclosure expanded={isExpanded} />
                      </button>
                      {isExpanded ? <div className="record-detail"><p className="preserve-lines">{item.shortDescription || "Noch keine Beschreibung eingetragen."}</p><div className="record-actions"><button className="button secondary small" type="button" onClick={() => { changeMode("edit"); setEditing({ kind: "milestone", item: { ...item } }); }}>Bearbeiten</button></div></div> : null}
                    </>
                  ) : (
                    <div className="record-management">
                      {mode === "edit" ? <button className="record-edit-trigger record-title" type="button" onClick={() => setEditing({ kind: "milestone", item: { ...item } })} aria-label={`Milestone „${item.title}“ bearbeiten`} title="Milestone öffnen">{item.title}</button> : <span className="record-title">{item.title}</span>}
                      {mode === "edit" ? <span className="management-actions"><button className="text-button danger-text" type="button" onClick={() => void deleteEdit({ kind: "milestone", item })}>Löschen</button></span> : null}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : <EmptyState>Noch keine Milestones gespeichert.</EmptyState>}
      </section>

      <section className="workspace-section vision-section" aria-labelledby="vision-title">
        <div className="section-heading"><h2 id="vision-title">Vision</h2>{mode === "edit" ? <button className="button secondary small" type="button" onClick={addVision}>Vision ergänzen</button> : null}</div>
        {vision.length ? (
          <div className="vision-list">
            {vision.map((item, index) => (
              <article
                className={`vision-record mode-${mode}`}
                key={item.id}
                draggable={mode === "reorder" && !busy}
                onDragStart={(event) => { if (mode === "reorder") { setDragged({ kind: "vision", id: item.id }); event.dataTransfer.effectAllowed = "move"; } }}
                onDragEnd={() => setDragged(null)}
                onDragOver={(event) => { if (mode === "reorder" && dragged?.kind === "vision") event.preventDefault(); }}
                onDrop={(event) => drop(event, "vision", item.id)}
              >
                {mode === "reorder" ? <SortHandle label="Visionseintrag" canMoveUp={index > 0} canMoveDown={index < vision.length - 1} onMoveUp={() => moveBy("vision", item.id, -1)} onMoveDown={() => moveBy("vision", item.id, 1)} /> : null}
                {mode === "edit" ? <button className="record-edit-trigger vision-edit-trigger" type="button" onClick={() => setEditing({ kind: "vision", item: { ...item } })} aria-label="Visionseintrag bearbeiten" title="Vision öffnen">{item.text}</button> : <p>{item.text}</p>}
                {mode === "edit" ? <span className="management-actions"><button className="text-button danger-text" type="button" onClick={() => void deleteEdit({ kind: "vision", item })}>Löschen</button></span> : null}
              </article>
            ))}
          </div>
        ) : <EmptyState>Noch keine Vision gespeichert.</EmptyState>}
      </section>

      {editing ? (
        <WorkspaceModal title={editing.kind === "milestone" ? "Milestone bearbeiten" : "Vision bearbeiten"} onClose={() => setEditing(null)}>
          <form className="detail-form" onSubmit={(event) => void saveEdit(event)}>
            {editing.kind === "milestone" ? (
              <>
                <Field label="Titel" className="full"><input required maxLength={180} value={editing.item.title} onChange={(event) => setEditing({ kind: "milestone", item: { ...editing.item, title: event.target.value } })} /></Field>
                <Field label="Kurze Beschreibung" className="full"><textarea rows={5} maxLength={1_000} value={editing.item.shortDescription} onChange={(event) => setEditing({ kind: "milestone", item: { ...editing.item, shortDescription: event.target.value } })} /></Field>
              </>
            ) : <Field label="Vision" className="full"><textarea required rows={6} maxLength={1_000} value={editing.item.text} onChange={(event) => setEditing({ kind: "vision", item: { ...editing.item, text: event.target.value } })} /></Field>}
            <div className="detail-form-actions full">
              <button className="button" type="submit" disabled={busy}>Speichern</button>
              <button className="button secondary" type="button" onClick={() => setEditing(null)}>Abbrechen</button>
              {(editing.kind === "milestone" ? workspace.milestones : workspace.vision).some((item) => item.id === editing.item.id) ? <button className="text-button danger-text push-right" type="button" onClick={() => void deleteEdit()}>Löschen</button> : null}
            </div>
          </form>
        </WorkspaceModal>
      ) : null}
    </div>
  );
}
