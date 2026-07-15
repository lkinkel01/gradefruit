"use client";

import type { DragEvent, FormEvent } from "react";
import { useMemo, useState } from "react";
import type { WorkspaceLink, WorkspaceLinkGroup } from "@/lib/types";
import { useWorkspace } from "@/lib/use-workspace";
import { ModeToolbar, type WorkspaceMode } from "./ModeToolbar";
import { SortHandle } from "./SortHandle";
import { WorkspaceModal } from "./WorkspaceModal";
import { EmptyState, Field, Loading, Notice } from "./ui";

const GROUPS: Array<{ id: WorkspaceLinkGroup; label: string }> = [
  { id: "project", label: "Intern" },
  { id: "external", label: "Extern" },
];

export function LinksClient() {
  const { workspace, visible, notice, error, busy, save } = useWorkspace();
  const [mode, setMode] = useState<WorkspaceMode>("normal");
  const [draft, setDraft] = useState<WorkspaceLink | null>(null);
  const [dragged, setDragged] = useState<{ id: string; group: WorkspaceLinkGroup } | null>(null);
  const sorted = useMemo(() => [...(workspace?.links ?? [])].sort((a, b) => a.order - b.order), [workspace]);

  function changeMode(next: WorkspaceMode) {
    setMode(next);
    setDragged(null);
  }

  function addLink() {
    setDraft({ id: crypto.randomUUID(), name: "", description: "", url: "", group: "project", order: workspace?.links.filter((link) => link.group === "project").length ?? 0 });
  }

  async function saveLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!visible || !draft || !draft.name.trim()) return;
    const previous = visible.links.find((link) => link.id === draft.id);
    const movedGroup = previous && previous.group !== draft.group;
    const item = {
      ...draft,
      name: draft.name.trim(),
      description: draft.description?.trim() || undefined,
      order: movedGroup ? visible.links.filter((link) => link.group === draft.group && link.id !== draft.id).length : draft.order,
    };
    const links = previous ? visible.links.map((link) => link.id === item.id ? item : link) : [...visible.links, item];
    if (await save({ ...visible, links }, "Link gespeichert.")) setDraft(null);
  }

  async function deleteLink(link: WorkspaceLink) {
    if (!visible || !window.confirm(`„${link.name}“ wirklich löschen?`)) return;
    if (await save(
      { ...visible, links: visible.links.filter((item) => item.id !== link.id) },
      "Link gelöscht.",
      [{ kind: "link", id: link.id, reason: "deleted" }],
    )) setDraft(null);
  }

  async function moveToGroup(link: WorkspaceLink, group: WorkspaceLinkGroup) {
    if (!visible || link.group === group) return;
    const order = visible.links.filter((item) => item.group === group).length;
    await save({ ...visible, links: visible.links.map((item) => item.id === link.id ? { ...item, group, order } : item) }, "Link verschoben.");
  }

  async function reorder(group: WorkspaceLinkGroup, id: string, targetId: string) {
    if (!visible || id === targetId) return;
    const links = visible.links.filter((link) => link.group === group).sort((a, b) => a.order - b.order);
    const from = links.findIndex((link) => link.id === id);
    const to = links.findIndex((link) => link.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = links.splice(from, 1);
    links.splice(to, 0, moved);
    const orderById = new Map(links.map((link, index) => [link.id, index]));
    await save({ ...visible, links: visible.links.map((link) => link.group === group ? { ...link, order: orderById.get(link.id) ?? link.order } : link) }, "Reihenfolge gespeichert.");
  }

  function moveBy(link: WorkspaceLink, direction: -1 | 1) {
    const groupLinks = sorted.filter((item) => item.group === link.group);
    const index = groupLinks.findIndex((item) => item.id === link.id);
    const target = groupLinks[index + direction];
    if (target) void reorder(link.group, link.id, target.id);
  }

  function drop(event: DragEvent<HTMLElement>, target: WorkspaceLink) {
    event.preventDefault();
    if (dragged?.group === target.group) void reorder(target.group, dragged.id, target.id);
    setDragged(null);
  }

  if (!workspace || !visible) return <><Notice message={error} error /><Loading /></>;

  return (
    <div className="workspace-page links-page">
      <div className="page-toolbar section-toolbar">
        <h1 id="links-title">Links</h1>
        <ModeToolbar mode={mode} onModeChange={changeMode} addLabel="Link hinzufügen" onAdd={addLink} />
      </div>
      <Notice message={notice} />
      <Notice message={error} error />

      {GROUPS.map((group) => {
        const links = sorted.filter((link) => link.group === group.id);
        return (
          <section className="workspace-section link-section" key={group.id} aria-labelledby={`links-${group.id}`}>
            <h2 id={`links-${group.id}`}>{group.label}</h2>
            {links.length ? (
              <div className="link-list">
                {links.map((link, index) => (
                  <article
                    className={`link-record mode-${mode}`}
                    key={link.id}
                    draggable={mode === "reorder" && !busy}
                    onDragStart={(event) => { if (mode === "reorder") { setDragged({ id: link.id, group: link.group }); event.dataTransfer.effectAllowed = "move"; } }}
                    onDragEnd={() => setDragged(null)}
                    onDragOver={(event) => { if (mode === "reorder" && dragged?.group === link.group) event.preventDefault(); }}
                    onDrop={(event) => drop(event, link)}
                  >
                    {mode === "reorder" ? <SortHandle label={link.name} canMoveUp={index > 0} canMoveDown={index < links.length - 1} onMoveUp={() => moveBy(link, -1)} onMoveDown={() => moveBy(link, 1)} /> : null}
                    {mode === "normal" ? (
                      link.url ? (
                        <a className="link-card" href={link.url} target="_blank" rel="noopener noreferrer">
                          <span><strong>{link.name}</strong>{link.description ? <small>{link.description}</small> : null}</span>
                          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M14 5h5v5M19 5l-8 8M19 14v5H5V5h5" /></svg>
                        </a>
                      ) : (
                        <div className="link-card link-missing"><span><strong>{link.name}</strong><small>{link.description || "Noch keine URL eingetragen."}</small></span></div>
                      )
                    ) : (
                      <div className="record-management link-management">
                        {mode === "edit" ? (
                          <button className="record-edit-trigger link-edit-trigger" type="button" onClick={() => setDraft({ ...link })} aria-label={`Link „${link.name}“ bearbeiten`} title="Link öffnen">
                            <strong className="record-title">{link.name}</strong>{link.description ? <small>{link.description}</small> : null}
                          </button>
                        ) : <span><strong className="record-title">{link.name}</strong>{link.description ? <small>{link.description}</small> : null}</span>}
                        {mode === "edit" ? <span className="management-actions"><button className="text-button danger-text" type="button" onClick={() => void deleteLink(link)}>Löschen</button></span> : null}
                        {mode === "reorder" ? <label className="group-move"><span>Bereich</span><select value={link.group} onChange={(event) => void moveToGroup(link, event.target.value as WorkspaceLinkGroup)}><option value="project">Intern</option><option value="external">Extern</option></select></label> : null}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : <EmptyState>Noch keine Links in diesem Bereich.</EmptyState>}
          </section>
        );
      })}

      {draft ? (
        <WorkspaceModal title={workspace.links.some((link) => link.id === draft.id) ? "Link bearbeiten" : "Link hinzufügen"} onClose={() => setDraft(null)}>
          <form className="detail-form" onSubmit={(event) => void saveLink(event)}>
            <Field label="Name" className="full"><input required maxLength={100} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field>
            <Field label="Kurze Beschreibung" className="full"><input maxLength={500} value={draft.description ?? ""} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></Field>
            <Field label="URL" className="full"><input type="url" value={draft.url} onChange={(event) => setDraft({ ...draft, url: event.target.value })} /></Field>
            <Field label="Bereich"><select value={draft.group} onChange={(event) => setDraft({ ...draft, group: event.target.value as WorkspaceLinkGroup })}><option value="project">Intern</option><option value="external">Extern</option></select></Field>
            <div className="detail-form-actions full">
              <button className="button" type="submit" disabled={busy}>Speichern</button>
              <button className="button secondary" type="button" onClick={() => setDraft(null)}>Abbrechen</button>
              {workspace.links.some((link) => link.id === draft.id) ? <button className="text-button danger-text push-right" type="button" onClick={() => void deleteLink(draft)}>Löschen</button> : null}
            </div>
          </form>
        </WorkspaceModal>
      ) : null}
    </div>
  );
}
