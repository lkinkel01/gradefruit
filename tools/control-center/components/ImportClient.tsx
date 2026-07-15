"use client";

import { useState } from "react";
import { api } from "@/lib/client-api";
import type { WorkspaceImportPreview, WorkspaceImportResult } from "@/lib/types";
import { Notice } from "./ui";

const LABELS = { tasks: "Aufgaben", ideas: "Ideen", milestones: "Milestones", vision: "Vision", links: "Links" } as const;

export function ImportClient() {
  const [source, setSource] = useState<unknown>(null);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState<WorkspaceImportPreview | null>(null);
  const [result, setResult] = useState<WorkspaceImportResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function choose(file: File | undefined) {
    setPreview(null); setResult(null); setError(""); setSource(null);
    if (!file) return;
    if (file.size > 1_500_000) { setError("Die Datei ist zu groß."); return; }
    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      setSource(parsed); setFileName(file.name);
      setBusy(true);
      setPreview(await api<WorkspaceImportPreview>("/api/import/preview", { method: "POST", body: JSON.stringify({ source: parsed }) }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Die Datei konnte nicht gelesen werden.");
    } finally { setBusy(false); }
  }

  async function confirm() {
    if (!source || !preview?.totalNew) return;
    setBusy(true); setError("");
    try {
      setResult(await api<WorkspaceImportResult>("/api/import/confirm", { method: "POST", body: JSON.stringify({ source }) }));
      setPreview(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Der Import ist fehlgeschlagen. Die lokale Datei bleibt unverändert.");
    } finally { setBusy(false); }
  }

  return (
    <section className="import-panel">
      <h1>Lokale Daten übernehmen</h1>
      <p>Wähle deine bisherige Datei <code>.control-center/workspace.json</code>. Zuerst wird nur eine Vorschau erstellt. Die lokale Datei wird niemals verändert oder gelöscht.</p>
      <label className="file-picker"><span>Datei auswählen</span><input type="file" accept="application/json,.json" onChange={(event) => void choose(event.target.files?.[0])} /></label>
      {fileName ? <p className="selected-file">Ausgewählt: {fileName}</p> : null}
      <Notice message={error} error />
      {busy ? <p className="loading">Wird geprüft …</p> : null}
      {preview ? <div className="import-preview"><h2>Importvorschau</h2><ul>{Object.entries(preview.counts).map(([kind, count]) => <li key={kind}><span>{LABELS[kind as keyof typeof LABELS]}</span><strong>{count.new} neu</strong><small>{count.duplicates} bereits vorhanden</small></li>)}</ul><p>{preview.totalNew} Einträge können importiert werden. {preview.totalDuplicates} Duplikate werden übersprungen.</p><button className="button" type="button" disabled={!preview.totalNew || busy} onClick={() => void confirm()}>Import bestätigen</button></div> : null}
      {result ? <Notice message={`${Object.values(result.imported).reduce((sum, count) => sum + count, 0)} Einträge wurden übernommen. Deine lokale Sicherung bleibt erhalten.`} /> : null}
    </section>
  );
}
